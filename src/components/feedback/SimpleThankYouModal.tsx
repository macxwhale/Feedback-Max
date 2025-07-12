
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star } from 'lucide-react';
import { FeedbackResponse, QuestionConfig } from '../FeedbackForm';
import { useOrganizationConfig } from '@/hooks/useOrganizationConfig';

interface SimpleThankYouModalProps {
  isOpen: boolean;
  responses: FeedbackResponse[];
  questions: QuestionConfig[];
  onClose: () => void;
}

export const SimpleThankYouModal: React.FC<SimpleThankYouModalProps> = ({
  isOpen,
  responses,
  questions,
  onClose
}) => {
  const { 
    organization, 
    logoAsset, 
    colors, 
    thankYouTitle, 
    thankYouMessage 
  } = useOrganizationConfig();

  if (!organization) return null;

  const totalScore = responses.reduce((sum, response) => sum + (response.score || 0), 0);
  const averageScore = responses.length > 0 ? Math.round(totalScore / responses.length) : 0;
  const completionRate = Math.round((responses.length / questions.length) * 100);

  // Generate simple feedback summary
  const categoryScores = responses.reduce((acc, response) => {
    const question = questions.find(q => q.id === response.questionId);
    if (question && question.category) {
      if (!acc[question.category]) {
        acc[question.category] = { total: 0, count: 0 };
      }
      acc[question.category].total += response.score || 0;
      acc[question.category].count += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
        <DialogHeader className="text-center space-y-6 pb-6">
          {/* Success Icon and Logo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: `${colors.primary}10` }}
              >
                <CheckCircle 
                  className="w-12 h-12"
                  style={{ color: colors.primary }}
                />
              </div>
              <div 
                className="absolute -inset-2 rounded-full blur-lg opacity-30"
                style={{ backgroundColor: colors.primary }}
              />
            </div>
            
            {logoAsset?.asset_url && (
              <img 
                src={logoAsset.asset_url} 
                alt={logoAsset.asset_name || `${organization.name} Logo`}
                className="h-12 w-auto opacity-80"
              />
            )}
          </div>

          <DialogTitle 
            className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
            style={{ 
              backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` 
            }}
          >
            {thankYouTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thank You Message */}
          <p className="text-center text-gray-700 text-lg leading-relaxed px-4">
            {thankYouMessage}
          </p>

          {/* Simple Feedback Summary */}
          <div className="p-6 bg-white/60 rounded-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-center mb-4" style={{ color: colors.primary }}>
              Your Feedback Summary
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star 
                    className="w-6 h-6 mr-1"
                    style={{ color: colors.primary }}
                  />
                </div>
                <div 
                  className="text-2xl font-bold"
                  style={{ color: colors.primary }}
                >
                  {averageScore}/5
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle 
                    className="w-6 h-6 mr-1"
                    style={{ color: colors.primary }}
                  />
                </div>
                <div 
                  className="text-2xl font-bold"
                  style={{ color: colors.primary }}
                >
                  {completionRate}%
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>

            {/* Category Ratings */}
            {Object.keys(categoryScores).length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 text-center">Ratings by Category:</p>
                {Object.entries(categoryScores).map(([category, scores]) => (
                  <div key={category} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{category}</span>
                    <span className="font-medium" style={{ color: colors.primary }}>
                      {Math.round(scores.total / scores.count)}/5
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={onClose}
              size="lg"
              className="text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{ 
                backgroundColor: colors.primary,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
              }}
            >
              Complete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
