
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPaginatedFeedbackResponses } from '@/services/feedbackService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Inbox } from 'lucide-react';

interface FeedbackInboxProps {
  organizationId: string;
}

type FeedbackResponse = {
  id: string;
  created_at: string;
  response_value: any;
  question_snapshot: {
    question_text: string;
  } | null;
};

export const FeedbackInbox: React.FC<FeedbackInboxProps> = ({ organizationId }) => {
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['feedbackResponses', organizationId, page, pageSize],
    queryFn: () => getPaginatedFeedbackResponses(organizationId, page, pageSize),
    placeholderData: (previousData) => previousData,
  });

  const responses = data?.data as FeedbackResponse[] | null;
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Inbox className="w-6 h-6" />
                <CardTitle>Feedback Inbox</CardTitle>
            </div>
            <Badge variant="outline">{totalCount} Total Responses</Badge>
        </div>
        <CardDescription>
          View and manage individual feedback submissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading && (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))
          )}

          {isError && (
            <div className="text-red-500 p-4 border border-red-200 bg-red-50 rounded-lg">
              <p>Error loading feedback: {error instanceof Error ? error.message : 'An unknown error occurred'}</p>
            </div>
          )}

          {!isLoading && !isError && responses && responses.length > 0 && (
            responses.map(response => (
              <div key={response.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{response.question_snapshot?.question_text || "Question not available"}</p>
                    <p className="text-gray-600 mt-1 text-sm">{JSON.stringify(response.response_value)}</p>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap pl-4">
                    {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}

          {!isLoading && (!responses || responses.length === 0) && (
             <div className="text-center py-12 text-gray-500">
                <Inbox className="w-12 h-12 mx-auto mb-4" />
                <p className="font-semibold">Your inbox is empty</p>
                <p className="text-sm">New feedback responses will appear here.</p>
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
                <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    Previous
                </Button>
                <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                </span>
                <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    Next
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
};
