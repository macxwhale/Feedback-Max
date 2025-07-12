
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Lightbulb,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import { FeedbackResponse, QuestionConfig } from '../FeedbackForm';
import { 
  generateAdvancedInsights, 
  AdvancedInsights,
  EmotionAnalysis,
  TopicCluster,
  TrendAnalysis
} from '@/services/advancedAnalyticsService';
import { 
  generateSmartRecommendations,
  generatePredictiveInsights,
  SmartRecommendation,
  PredictiveInsight,
  calculatePriorityScore
} from '@/services/intelligentRecommendationEngine';

interface AdvancedInsightsDashboardProps {
  responses: FeedbackResponse[];
  questions: QuestionConfig[];
}

export const AdvancedInsightsDashboard: React.FC<AdvancedInsightsDashboardProps> = ({
  responses,
  questions
}) => {
  const [activeTab, setActiveTab] = useState('insights');
  const [selectedRecommendation, setSelectedRecommendation] = useState<SmartRecommendation | null>(null);

  const insights = generateAdvancedInsights(responses);
  const recommendations = generateSmartRecommendations(responses, insights);
  const predictiveInsights = generatePredictiveInsights(responses, insights);

  const getEmotionIcon = (emotion: EmotionAnalysis['emotion']) => {
    const icons = {
      delighted: <Star className="w-4 h-4 text-yellow-500" />,
      satisfied: <TrendingUp className="w-4 h-4 text-green-500" />,
      neutral: <Users className="w-4 h-4 text-gray-500" />,
      frustrated: <AlertTriangle className="w-4 h-4 text-orange-500" />,
      angry: <AlertTriangle className="w-4 h-4 text-red-500" />,
      confused: <Brain className="w-4 h-4 text-purple-500" />
    };
    return icons[emotion];
  };

  const getPriorityColor = (priority: SmartRecommendation['priority']) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[priority];
  };

  const getInsightTypeIcon = (type: PredictiveInsight['type']) => {
    const icons = {
      churn_risk: <AlertTriangle className="w-5 h-5 text-red-500" />,
      satisfaction_forecast: <TrendingUp className="w-5 h-5 text-blue-500" />,
      early_warning: <Shield className="w-5 h-5 text-orange-500" />,
      opportunity: <Target className="w-5 h-5 text-green-500" />
    };
    return icons[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-[#073763]">Advanced Customer Intelligence</h2>
        <Badge variant="outline" className="ml-2">AI-Powered</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Deep Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Smart Actions</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {/* Emotion Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Emotion Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {insights.emotionBreakdown
                  .reduce((acc, emotion) => {
                    const existing = acc.find(e => e.emotion === emotion.emotion);
                    if (existing) {
                      existing.count++;
                      existing.avgConfidence = (existing.avgConfidence + emotion.confidence) / 2;
                    } else {
                      acc.push({ 
                        emotion: emotion.emotion, 
                        count: 1, 
                        avgConfidence: emotion.confidence 
                      });
                    }
                    return acc;
                  }, [] as { emotion: EmotionAnalysis['emotion']; count: number; avgConfidence: number }[])
                  .map(({ emotion, count, avgConfidence }) => (
                    <div key={emotion} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        {getEmotionIcon(emotion)}
                        <span className="text-sm font-medium capitalize">{emotion}</span>
                      </div>
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round(avgConfidence * 100)}% confidence
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Topic Clusters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Topic Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.topicClusters.map((topic, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{topic.topic}</h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={
                            topic.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                            topic.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {topic.sentiment}
                        </Badge>
                        <span className="text-sm text-gray-500">{topic.frequency} mentions</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Keywords: {topic.keywords.join(', ')}
                    </div>
                    {topic.responses.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Example: "{topic.responses[0]}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors & Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.riskFactors.length === 0 ? (
                    <p className="text-gray-500 text-sm">No significant risks detected</p>
                  ) : (
                    insights.riskFactors.map((risk, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                        {risk}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Target className="w-5 h-5" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.opportunityAreas.length === 0 ? (
                    <p className="text-gray-500 text-sm">No opportunities identified</p>
                  ) : (
                    insights.opportunityAreas.map((opportunity, index) => (
                      <div key={index} className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                        {opportunity}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {recommendations.map((rec) => (
                <Card 
                  key={rec.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRecommendation?.id === rec.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedRecommendation(rec)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                          <span className="text-sm text-gray-600">{rec.category}</span>
                        </div>
                        <h4 className="font-semibold mb-1">{rec.title}</h4>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-blue-600">
                          {calculatePriorityScore(rec).toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Priority Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Impact:</span>
                        <span className="ml-1 font-medium">{rec.impactEffort.impact}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Effort:</span>
                        <span className="ml-1 font-medium">{rec.impactEffort.effort}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Timeline:</span>
                        <span className="ml-1 font-medium">{rec.timeline}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recommendation Details */}
            <div className="lg:col-span-1">
              {selectedRecommendation && (
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedRecommendation.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        ROI Analysis
                      </h5>
                      <div className="text-sm space-y-1">
                        <div><span className="text-gray-600">Cost:</span> {selectedRecommendation.roi.estimatedCost}</div>
                        <div><span className="text-gray-600">Benefit:</span> {selectedRecommendation.roi.expectedBenefit}</div>
                        <div><span className="text-gray-600">Timeline:</span> {selectedRecommendation.roi.timeToRealize}</div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Action Items
                      </h5>
                      <ul className="text-sm space-y-1">
                        {selectedRecommendation.actionItems.map((action, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Key Metrics
                      </h5>
                      <div className="text-sm space-y-1">
                        {selectedRecommendation.kpis.map((kpi, index) => (
                          <div key={index} className="text-gray-600">• {kpi}</div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Reasoning</h5>
                      <div className="text-sm space-y-1">
                        {selectedRecommendation.reasoning.map((reason, index) => (
                          <div key={index} className="text-gray-600">• {reason}</div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="text-sm text-gray-500 mb-2">
                        Confidence: {Math.round(selectedRecommendation.confidence * 100)}%
                      </div>
                      <Button className="w-full">
                        Start Implementation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictiveInsights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getInsightTypeIcon(insight.type)}
                    {insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{insight.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Probability:</span>
                    <Badge variant="outline">
                      {Math.round(insight.probability * 100)}%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Timeframe:</span>
                    <span className="text-sm text-gray-600">{insight.timeframe}</span>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Preventive Actions:</h5>
                    <ul className="text-sm space-y-1">
                      {insight.preventiveActions.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-start gap-2">
                          <Zap className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Key Indicators:</h5>
                    <div className="text-sm space-y-1">
                      {insight.indicators.map((indicator, indicatorIndex) => (
                        <div key={indicatorIndex} className="text-gray-600">
                          • {indicator}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.trendAnalysis.map((trend, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {trend.period}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {trend.averageScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Trend:</span>
                      <Badge 
                        className={
                          trend.sentimentTrend === 'improving' ? 'bg-green-100 text-green-800' :
                          trend.sentimentTrend === 'declining' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {trend.sentimentTrend}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Change:</span>
                      <span className={`text-sm font-medium ${
                        trend.changePercentage > 0 ? 'text-green-600' : 
                        trend.changePercentage < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {trend.changePercentage > 0 ? '+' : ''}{trend.changePercentage}%
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      Based on {trend.sampleSize} responses
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Correlation Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Category Correlations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(insights.correlationMatrix).map(([categories, correlation]) => (
                  <div key={categories} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{categories}</span>
                    <span className={`text-sm font-medium ${
                      correlation > 0.5 ? 'text-green-600' :
                      correlation < -0.5 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {correlation > 0 ? '+' : ''}{correlation}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
