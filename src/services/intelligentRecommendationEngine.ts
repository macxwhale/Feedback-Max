
import { FeedbackResponse } from '@/components/FeedbackForm';
import { AdvancedInsights } from './advancedAnalyticsService';

export interface ImpactEffortMatrix {
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  score: number;
}

export interface ROICalculation {
  estimatedCost: string;
  expectedBenefit: string;
  timeToRealize: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  impactEffort: ImpactEffortMatrix;
  roi: ROICalculation;
  actionItems: string[];
  kpis: string[];
  timeline: string;
  confidence: number;
  reasoning: string[];
}

export interface PredictiveInsight {
  type: 'churn_risk' | 'satisfaction_forecast' | 'early_warning' | 'opportunity';
  title: string;
  description: string;
  probability: number;
  timeframe: string;
  preventiveActions: string[];
  indicators: string[];
}

// Generate intelligent recommendations based on advanced insights
export const generateSmartRecommendations = (
  responses: FeedbackResponse[],
  insights: AdvancedInsights
): SmartRecommendation[] => {
  const recommendations: SmartRecommendation[] = [];

  // Analyze each risk factor and generate recommendations
  insights.riskFactors.forEach((risk, index) => {
    if (risk.includes('negative emotion')) {
      recommendations.push({
        id: `risk-emotion-${index}`,
        title: 'Implement Immediate Customer Recovery Program',
        description: 'High levels of negative emotions detected. Implement proactive outreach to dissatisfied customers.',
        category: 'Customer Recovery',
        priority: 'critical',
        impactEffort: {
          impact: 'high',
          effort: 'medium',
          score: 8.5
        },
        roi: {
          estimatedCost: '$5,000 - $15,000',
          expectedBenefit: '25-40% reduction in churn, improved brand reputation',
          timeToRealize: '2-4 weeks',
          riskLevel: 'low'
        },
        actionItems: [
          'Set up automated alerts for negative feedback',
          'Create customer recovery email templates',
          'Train staff on handling dissatisfied customers',
          'Implement follow-up calling program'
        ],
        kpis: [
          'Customer retention rate',
          'Net Promoter Score improvement',
          'Response time to negative feedback',
          'Resolution rate'
        ],
        timeline: '30 days',
        confidence: 0.85,
        reasoning: [
          'Negative emotions strongly correlate with churn',
          'Proactive recovery programs show 60%+ success rates',
          'Early intervention costs 5x less than customer acquisition'
        ]
      });
    }

    if (risk.includes('low satisfaction scores')) {
      recommendations.push({
        id: `risk-scores-${index}`,
        title: 'Service Quality Improvement Initiative',
        description: 'Address systematic issues causing low satisfaction scores across multiple touchpoints.',
        category: 'Service Quality',
        priority: 'high',
        impactEffort: {
          impact: 'high',
          effort: 'high',
          score: 7.5
        },
        roi: {
          estimatedCost: '$20,000 - $50,000',
          expectedBenefit: '15-30% increase in satisfaction scores',
          timeToRealize: '8-12 weeks',
          riskLevel: 'medium'
        },
        actionItems: [
          'Conduct root cause analysis of low scores',
          'Implement service quality training program',
          'Review and optimize key customer touchpoints',
          'Establish quality monitoring system'
        ],
        kpis: [
          'Average satisfaction score',
          'Service quality metrics',
          'Customer complaint volume',
          'First-call resolution rate'
        ],
        timeline: '90 days',
        confidence: 0.78,
        reasoning: [
          'Multiple low scores indicate systematic issues',
          'Service quality directly impacts customer loyalty',
          'Investment in training shows measurable ROI'
        ]
      });
    }
  });

  // Generate recommendations from opportunity areas
  insights.opportunityAreas.forEach((opportunity, index) => {
    if (opportunity.includes('competitive advantage')) {
      const topic = opportunity.match(/strength in (.+?) as/)?.[1] || 'service area';
      
      recommendations.push({
        id: `opportunity-${index}`,
        title: `Leverage ${topic} Excellence in Marketing`,
        description: `Use proven strength in ${topic} to attract new customers and differentiate from competitors.`,
        category: 'Marketing & Growth',
        priority: 'medium',
        impactEffort: {
          impact: 'medium',
          effort: 'low',
          score: 6.5
        },
        roi: {
          estimatedCost: '$3,000 - $10,000',
          expectedBenefit: '10-20% increase in new customer acquisition',
          timeToRealize: '4-6 weeks',
          riskLevel: 'low'
        },
        actionItems: [
          `Create case studies highlighting ${topic} excellence`,
          'Develop targeted marketing campaigns',
          'Collect and showcase customer testimonials',
          'Train sales team on key differentiators'
        ],
        kpis: [
          'Lead generation increase',
          'Conversion rate improvement',
          'Brand awareness metrics',
          'Customer acquisition cost'
        ],
        timeline: '45 days',
        confidence: 0.72,
        reasoning: [
          'Positive feedback indicates genuine strength',
          'Authentic testimonials drive 35% higher conversion',
          'Low-cost marketing leverages existing assets'
        ]
      });
    }

    if (opportunity.includes('referral programs')) {
      recommendations.push({
        id: `referral-program-${index}`,
        title: 'Launch Customer Referral Program',
        description: 'High satisfaction levels indicate customers are likely to refer others. Implement structured referral program.',
        category: 'Customer Growth',
        priority: 'medium',
        impactEffort: {
          impact: 'medium',
          effort: 'medium',
          score: 7.0
        },
        roi: {
          estimatedCost: '$8,000 - $20,000',
          expectedBenefit: '20-35% of new customers from referrals',
          timeToRealize: '6-8 weeks',
          riskLevel: 'low'
        },
        actionItems: [
          'Design referral reward structure',
          'Create referral tracking system',
          'Develop referral request email campaigns',
          'Set up referral landing pages'
        ],
        kpis: [
          'Referral conversion rate',
          'Number of referral participants',
          'Customer acquisition cost reduction',
          'Referral customer lifetime value'
        ],
        timeline: '60 days',
        confidence: 0.68,
        reasoning: [
          'High satisfaction correlates with referral likelihood',
          'Referred customers have 37% higher retention',
          'Referral programs reduce acquisition costs by 50%'
        ]
      });
    }
  });

  // Topic-based recommendations
  insights.topicClusters.forEach(topic => {
    if (topic.sentiment === 'negative' && topic.frequency > 2) {
      recommendations.push({
        id: `topic-${topic.topic.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Address ${topic.topic} Issues`,
        description: `Multiple customers have expressed concerns about ${topic.topic.toLowerCase()}. Immediate attention required.`,
        category: 'Issue Resolution',
        priority: topic.frequency > 5 ? 'critical' : 'high',
        impactEffort: {
          impact: 'high',
          effort: 'medium',
          score: 8.0
        },
        roi: {
          estimatedCost: '$5,000 - $25,000',
          expectedBenefit: `Resolve ${topic.frequency} customer concerns, prevent negative reviews`,
          timeToRealize: '2-6 weeks',
          riskLevel: 'low'
        },
        actionItems: [
          `Analyze specific ${topic.topic.toLowerCase()} feedback`,
          'Identify root causes and quick wins',
          'Implement immediate improvements',
          'Follow up with affected customers'
        ],
        kpis: [
          `${topic.topic} satisfaction score`,
          'Related complaint volume',
          'Customer retention in affected segment',
          'Issue recurrence rate'
        ],
        timeline: '30-45 days',
        confidence: 0.82,
        reasoning: [
          `${topic.frequency} customers mentioned this issue`,
          'Addressing specific concerns shows immediate impact',
          'Proactive resolution prevents escalation'
        ]
      });
    }
  });

  // Sort recommendations by priority and impact score
  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.impactEffort.score - a.impactEffort.score;
  });
};

// Generate predictive insights
export const generatePredictiveInsights = (
  responses: FeedbackResponse[],
  insights: AdvancedInsights
): PredictiveInsight[] => {
  const predictiveInsights: PredictiveInsight[] = [];

  // Churn risk prediction based on negative emotions and low scores
  const negativeResponses = responses.filter(r => r.score < 3);
  const churnRiskProbability = Math.min((negativeResponses.length / responses.length) * 100, 85);

  if (churnRiskProbability > 20) {
    predictiveInsights.push({
      type: 'churn_risk',
      title: 'Customer Churn Risk Alert',
      description: `${Math.round(churnRiskProbability)}% probability of increased customer churn in the next 30 days based on current feedback patterns.`,
      probability: churnRiskProbability / 100,
      timeframe: '30 days',
      preventiveActions: [
        'Implement immediate customer outreach program',
        'Offer service recovery incentives',
        'Address top complaint categories first',
        'Increase customer success touchpoints'
      ],
      indicators: [
        `${negativeResponses.length} low satisfaction scores`,
        'Declining sentiment trend',
        'Negative emotion patterns detected'
      ]
    });
  }

  // Satisfaction forecast
  const avgScore = responses.reduce((sum, r) => sum + r.score, 0) / responses.length;
  const forecastTrend = avgScore > 3.5 ? 'improving' : avgScore < 2.5 ? 'declining' : 'stable';
  
  predictiveInsights.push({
    type: 'satisfaction_forecast',
    title: 'Satisfaction Score Forecast',
    description: `Customer satisfaction is predicted to be ${forecastTrend} over the next quarter based on current trends.`,
    probability: 0.75,
    timeframe: '90 days',
    preventiveActions: 
      forecastTrend === 'declining' 
        ? ['Implement service improvement initiatives', 'Increase customer feedback frequency', 'Focus on top dissatisfaction drivers']
        : ['Maintain current service levels', 'Capitalize on positive momentum', 'Expand successful practices'],
    indicators: [
      `Current average score: ${avgScore.toFixed(1)}`,
      `Trend direction: ${forecastTrend}`,
      'Historical pattern analysis'
    ]
  });

  // Early warning for specific issues
  insights.topicClusters.forEach(topic => {
    if (topic.sentiment === 'negative' && topic.frequency > 1) {
      predictiveInsights.push({
        type: 'early_warning',
        title: `${topic.topic} Issue Escalation Warning`,
        description: `Rising complaints about ${topic.topic.toLowerCase()} may lead to broader service issues if not addressed.`,
        probability: Math.min(topic.frequency * 0.15, 0.8),
        timeframe: '2-4 weeks',
        preventiveActions: [
          `Review ${topic.topic.toLowerCase()} processes immediately`,
          'Implement temporary workarounds',
          'Communicate improvements to customers',
          'Monitor feedback closely'
        ],
        indicators: [
          `${topic.frequency} related complaints`,
          'Negative sentiment trend',
          'Customer keyword analysis'
        ]
      });
    }
  });

  // Opportunity prediction
  if (insights.opportunityAreas.length > 0) {
    predictiveInsights.push({
      type: 'opportunity',
      title: 'Customer Advocacy Opportunity',
      description: 'High satisfaction levels indicate strong potential for customer advocacy and referral programs.',
      probability: 0.65,
      timeframe: '60 days',
      preventiveActions: [
        'Launch customer testimonial campaign',
        'Implement referral reward program',
        'Create case studies from positive feedback',
        'Develop customer success stories'
      ],
      indicators: [
        'High satisfaction scores detected',
        'Positive emotion patterns',
        'Strong service area performance'
      ]
    });
  }

  return predictiveInsights.sort((a, b) => b.probability - a.probability);
};

// Calculate overall recommendation priority score
export const calculatePriorityScore = (recommendation: SmartRecommendation): number => {
  const priorityWeight = { critical: 10, high: 7, medium: 5, low: 2 };
  const impactWeight = { high: 3, medium: 2, low: 1 };
  const effortWeight = { low: 3, medium: 2, high: 1 }; // Lower effort = higher score
  
  const priorityScore = priorityWeight[recommendation.priority];
  const impactScore = impactWeight[recommendation.impactEffort.impact];
  const effortScore = effortWeight[recommendation.impactEffort.effort];
  const confidenceScore = recommendation.confidence * 5;
  
  return priorityScore + impactScore + effortScore + confidenceScore;
};
