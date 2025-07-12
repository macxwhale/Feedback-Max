
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuestionTypeForm } from './QuestionTypeForm';
import { Plus } from 'lucide-react';
import { QuestionFormData, getQuestionTypeCapabilities } from '@/types/questionTypes';

interface QuestionFormProps {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
  questionTypes: any[];
  categories: any[];
  editingId: string | null;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  formData,
  setFormData,
  questionTypes,
  categories,
  editingId,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const capabilities = getQuestionTypeCapabilities(formData.question_type);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Question text"
          value={formData.question_text}
          onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
        />
        <Select 
          value={formData.question_type} 
          onValueChange={(value) => setFormData(prev => ({ 
            ...prev, 
            question_type: value,
            // Reset options and scale when type changes
            options: [],
            scaleConfig: { minValue: 1, maxValue: 5 }
          }))}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {questionTypes.map(type => 
              <SelectItem key={type.id} value={type.name}>{type.display_name}</SelectItem>
            )}
          </SelectContent>
        </Select>
        <Select 
          value={formData.category} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map(cat => 
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <QuestionTypeForm
        questionType={formData.question_type}
        supportsOptions={capabilities.supportsOptions}
        supportsScale={capabilities.supportsScale}
        options={formData.options}
        scaleConfig={formData.scaleConfig}
        helpText={formData.help_text}
        placeholderText={formData.placeholder_text}
        onOptionsChange={(options) => setFormData(prev => ({ ...prev, options }))}
        onScaleChange={(scaleConfig) => setFormData(prev => ({ ...prev, scaleConfig }))}
        onHelpTextChange={(help_text) => setFormData(prev => ({ ...prev, help_text }))}
        onPlaceholderChange={(placeholder_text) => setFormData(prev => ({ ...prev, placeholder_text }))}
      />

      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={!formData.question_text.trim() || isSubmitting}
        >
          <Plus className="w-4 h-4 mr-1" />
          {editingId ? 'Update' : 'Add'} Question
        </Button>
        {editingId && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
