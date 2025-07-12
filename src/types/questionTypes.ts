
export interface QuestionFormData {
  question_text: string;
  question_type: string;
  category: string;
  order_index: number;
  help_text?: string;
  placeholder_text?: string;
  is_required?: boolean;
  options?: { text: string; value?: string }[];
  scaleConfig?: {
    minValue: number;
    maxValue: number;
    minLabel?: string;
    maxLabel?: string;
    stepSize?: number;
  };
}

export interface QuestionTypeCapabilities {
  supportsOptions: boolean;
  supportsScale: boolean;
}

export const getQuestionTypeCapabilities = (questionType: string): QuestionTypeCapabilities => {
  const typeCapabilities = {
    'single-choice': { supportsOptions: true, supportsScale: false },
    'multi-choice': { supportsOptions: true, supportsScale: false },
    'star': { supportsOptions: false, supportsScale: true },
    'likert': { supportsOptions: false, supportsScale: true },
    'nps': { supportsOptions: false, supportsScale: true },
    'slider': { supportsOptions: false, supportsScale: true },
    'emoji': { supportsOptions: true, supportsScale: false },
    'ranking': { supportsOptions: true, supportsScale: false },
    'matrix': { supportsOptions: true, supportsScale: true },
    'text': { supportsOptions: false, supportsScale: false }
  };

  return typeCapabilities[questionType as keyof typeof typeCapabilities] || { supportsOptions: false, supportsScale: false };
};
