import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedbackResponse, QuestionConfig } from '../FeedbackForm';
import { TotalScore } from './TotalScore';
import { ScoreDisplay } from './ScoreDisplay';
import { QuestionScores } from './QuestionScores';
import { CategoryScoreDisplay } from './CategoryScoreDisplay';
import { CustomerInsightsDashboard } from './CustomerInsightsDashboard';
import { SentimentTrends } from './SentimentTrends';
import { AnalyticsInsights } from './AnalyticsInsights';
import { AdvancedInsightsDashboard } from './AdvancedInsightsDashboard';
import { AnalyticsData } from '@/services/analyticsService';
import { SuccessAnimation } from './SuccessAnimation';
import { ThankYouActions } from './ThankYouActions';
import { generateAdvancedInsights } from '@/services/advancedAnalyticsService';
import { 
  generateSmartRecommendations,
  generatePredictiveInsights
} from '@/services/intelligentRecommendationEngine';

interface EnhancedThankYouModalProps {
  isOpen: boolean;
  responses: FeedbackResponse[];
  questions: QuestionConfig[];
  analytics?: AnalyticsData;
  onReset: () => void;
}

export const EnhancedThankYouModal: React.FC<EnhancedThankYouModalProps> = ({
  isOpen,
  responses,
  questions,
  analytics,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const averageScore = responses.length > 0 
    ? Math.round(responses.reduce((sum, r) => sum + r.score, 0) / responses.length) 
    : 0;

  // Generate advanced insights
  const advancedInsights = generateAdvancedInsights(responses);
  const smartRecommendations = generateSmartRecommendations(responses, advancedInsights);
  const predictiveInsights = generatePredictiveInsights(responses, advancedInsights);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          <SuccessAnimation show={true} />
          
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#073763] mb-2">
              Thank You for Your Feedback!
            </h2>
            <p className="text-gray-600">
              Your responses help us understand and improve our services. Here are your personalized insights:
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="insights">Customer Insights</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
              <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
              <TabsTrigger value="intelligence">AI Intelligence</TabsTrigger>
              <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              <ScoreDisplay averageScore={averageScore} />
              <TotalScore responses={responses} />
              <CategoryScoreDisplay responses={responses} questions={questions} />
              <QuestionScores responses={responses} questions={questions} />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <CustomerInsightsDashboard responses={responses} questions={questions} />
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-6">
              <SentimentTrends responses={responses} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {analytics ? (
                <AnalyticsInsights analytics={analytics} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Analytics data not available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="intelligence" className="space-y-6">
              <AdvancedInsightsDashboard responses={responses} questions={questions} />
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <div className="space-y-6">
                {/* Smart Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Priority Recommendations</h3>
                    {smartRecommendations.slice(0, 3).map((rec, index) => (
                      <div key={rec.id} className={`p-4 rounded-lg border-l-4 ${
                        rec.priority === 'critical' ? 'border-l-red-500 bg-red-50' :
                        rec.priority === 'high' ? 'border-l-orange-500 bg-orange-50' :
                        'border-l-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                              <span>ROI: {rec.roi.expectedBenefit}</span>
                              <span>Timeline: {rec.timeline}</span>
                              <span>Confidence: {Math.round(rec.confidence * 100)}%</span>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.priority}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Predictive Insights */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Predictive Insights</h3>
                    {predictiveInsights.map((insight, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${
                        insight.type === 'churn_risk' ? 'border-red-200 bg-red-50' :
                        insight.type === 'early_warning' ? 'border-yellow-200 bg-yellow-50' :
                        insight.type === 'opportunity' ? 'border-green-200 bg-green-50' :
                        'border-blue-200 bg-blue-50'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                            <div className="mt-2 text-xs text-gray-500">
                              <span>Probability: {Math.round(insight.probability * 100)}%</span>
                              <span className="ml-4">Timeframe: {insight.timeframe}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Items Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{smartRecommendations.length}</div>
                      <div className="text-sm text-gray-600">Recommendations Generated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {smartRecommendations.filter(r => r.priority === 'critical' || r.priority === 'high').length}
                      </div>
                      <div className="text-sm text-gray-600">High Priority Actions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{predictiveInsights.length}</div>
                      <div className="text-sm text-gray-600">Future Predictions</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <ThankYouActions onClose={onReset} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
