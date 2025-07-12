
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsService } from '@/services/questionsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionForm } from './QuestionForm';
import { QuestionsList } from './QuestionsList';
import { useToast } from '@/components/ui/use-toast';
import { QuestionFormData } from '@/types/questionTypes';

export const QuestionsManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>({
    question_text: '',
    question_type: 'star',
    category: 'QualityService',
    order_index: 1,
    help_text: '',
    placeholder_text: '',
    is_required: false,
    options: [],
    scaleConfig: { minValue: 1, maxValue: 5 }
  });

  // Fetch questions
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['questions'],
    queryFn: () => questionsService.getQuestions(),
  });

  // Fetch question types from database
  const { data: questionTypes = [] } = useQuery({
    queryKey: ['question-types'],
    queryFn: () => questionsService.getQuestionTypes(),
  });

  // Fetch categories from database
  const { data: categories = [] } = useQuery({
    queryKey: ['question-categories'],
    queryFn: () => questionsService.getQuestionCategories(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: questionsService.createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({ title: 'Question created successfully' });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => questionsService.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({ title: 'Question updated successfully' });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionsService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({ title: 'Question deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      question_text: '',
      question_type: 'star',
      category: 'QualityService',
      order_index: 1,
      help_text: '',
      placeholder_text: '',
      is_required: false,
      options: [],
      scaleConfig: { minValue: 1, maxValue: 5 }
    });
  };

  const handleSubmit = () => {
    if (!formData.question_text.trim()) {
      toast({ title: 'Validation Error', description: 'Question text is required', variant: 'destructive' });
      return;
    }

    const maxOrder = questions.length > 0 ? Math.max(...questions.map(q => q.order_index)) : 0;
    const orderIndex = editingId ? formData.order_index : maxOrder + 1;

    const submitData = {
      ...formData,
      order_index: orderIndex
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (question: any) => {
    setEditingId(question.id);
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      category: question.category,
      order_index: question.order_index,
      help_text: question.help_text || '',
      placeholder_text: question.placeholder_text || '',
      is_required: question.is_required || false,
      options: question.question_options?.map((opt: any) => ({ 
        text: opt.option_text, 
        value: opt.option_value 
      })) || [],
      scaleConfig: question.question_scale_config?.[0] ? {
        minValue: question.question_scale_config[0].min_value,
        maxValue: question.question_scale_config[0].max_value,
        minLabel: question.question_scale_config[0].min_label || '',
        maxLabel: question.question_scale_config[0].max_label || '',
        stepSize: question.question_scale_config[0].step_size
      } : { minValue: 1, maxValue: 5 }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Questions Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading questions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <QuestionForm
          formData={formData}
          setFormData={setFormData}
          questionTypes={questionTypes}
          categories={categories}
          editingId={editingId}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />

        <QuestionsList
          questions={questions}
          onEdit={handleEdit}
          onDelete={(id) => deleteMutation.mutate(id)}
          isDeleting={deleteMutation.isPending}
        />
      </CardContent>
    </Card>
  );
};
