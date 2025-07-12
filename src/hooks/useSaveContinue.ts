
import { useToast } from '@/components/ui/use-toast';

export const useSaveContinue = (
  responses: Record<string, any>,
  currentQuestionIndex: number,
  completedQuestions: number[]
) => {
  const { toast } = useToast();

  const saveProgress = () => {
    const progressData = {
      responses,
      currentQuestionIndex,
      completedQuestions,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('feedback-save-continue', JSON.stringify(progressData));
  };

  const pauseAndExit = () => {
    saveProgress();
    toast({
      title: "Session paused",
      description: "Your progress has been saved. Return anytime to continue.",
    });
    window.location.reload();
  };

  const hasUnsavedChanges = Object.keys(responses).length > 0;

  return {
    saveProgress,
    pauseAndExit,
    hasUnsavedChanges
  };
};
