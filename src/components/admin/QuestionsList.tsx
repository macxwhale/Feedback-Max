
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Archive } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface QuestionsListProps {
  questions: any[];
  onEdit: (question: any) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  onEdit,
  onDelete,
  isDeleting
}) => {
  const { toast } = useToast();

  const handleDelete = async (question: any) => {
    const hasResponses = question.response_count > 0; // This would come from the API
    
    if (hasResponses) {
      toast({
        title: "Question will be archived",
        description: "This question has responses and will be archived instead of deleted.",
        variant: "default"
      });
    }
    
    onDelete(question.id);
  };

  if (questions.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No questions found. Create your first question above.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {questions.map(q => (
        <div key={q.id} className={`flex items-center justify-between p-3 border rounded-lg ${!q.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{q.question_text}</span>
              {!q.is_active && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  <Archive className="w-3 h-3" />
                  Archived
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Type: {q.question_type} | Category: {q.category} | Order: {q.order_index}
              {q.help_text && <span> | Help: {q.help_text}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(q)}
              disabled={!q.is_active}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(q)}
              disabled={isDeleting || !q.is_active}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
