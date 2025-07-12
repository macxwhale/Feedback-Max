
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPaginatedFeedbackResponses } from '@/services/feedbackService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Inbox, Search, Filter, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedFeedbackInboxProps {
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

export const EnhancedFeedbackInbox: React.FC<EnhancedFeedbackInboxProps> = ({ organizationId }) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const pageSize = 15;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['feedbackResponses', organizationId, page, pageSize, searchTerm, statusFilter],
    queryFn: () => getPaginatedFeedbackResponses(organizationId, page, pageSize),
    placeholderData: (previousData) => previousData,
  });

  const responses = data?.data as FeedbackResponse[] | null;
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleViewResponse = (responseId: string) => {
    // TODO: Implement view response functionality
    console.log('View response:', responseId);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Inbox className="w-6 h-6" />
            <CardTitle>Feedback Inbox</CardTitle>
          </div>
          <Badge variant="outline" className="text-sm">
            {totalCount} Total Responses
          </Badge>
        </div>
        <CardDescription>
          View and manage individual feedback submissions from your organization.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search feedback responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Responses</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="older">Older</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertDescription>
              Error loading feedback: {error instanceof Error ? error.message : 'An unknown error occurred'}
            </AlertDescription>
          </Alert>
        )}

        {/* Responses Table */}
        {!isLoading && !isError && responses && responses.length > 0 && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <TableRow key={response.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="max-w-xs truncate">
                        {response.question_snapshot?.question_text || "Question not available"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-muted-foreground">
                        {JSON.stringify(response.response_value)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewResponse(response.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View response</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!responses || responses.length === 0) && (
          <div className="text-center py-12">
            <Inbox className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Your inbox is empty</h3>
            <p className="text-sm text-muted-foreground">
              New feedback responses will appear here when customers submit feedback.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
