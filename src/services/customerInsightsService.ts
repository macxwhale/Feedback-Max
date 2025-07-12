
import { FeedbackResponse } from '@/components/FeedbackForm';

export interface CustomerInsight {
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  averageScore: number;
  responseCount: number;
  trend: 'improving' | 'declining' | 'stable';
  keyIssues: string[];
  recommendations: string[];
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  themes: Array<{
    theme: string;
    frequency: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
}

export interface ImprovementSuggestion {
  priority: 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  suggestion: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export const analyzeSentiment = (text: string): SentimentAnalysis => {
  // Simple sentiment analysis - in production, you'd use a proper NLP service
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'satisfied', 'happy', 'love', 'perfect', 'wonderful', 'fantastic'];
  const negativeWords = ['bad', 'terrible', 'awful', 'disappointed', 'hate', 'poor', 'worst', 'horrible', 'frustrating', 'annoying'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.some(pos => word.includes(pos))) positiveCount++;
    if (negativeWords.some(neg => word.includes(neg))) negativeCount++;
  });
  
  const totalSentimentWords = positiveCount + negativeCount;
  const score = totalSentimentWords > 0 ? (positiveCount - negativeCount) / totalSentimentWords : 0;
  
  return {
    overall: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
    score: Math.max(-1, Math.min(1, score)),
    confidence: Math.min(1, totalSentimentWords / 10),
    themes: extractThemes(text)
  };
};

const extractThemes = (text: string): Array<{theme: string; frequency: number; sentiment: 'positive' | 'negative' | 'neutral'}> => {
  const themes = [
    { keywords: ['staff', 'employee', 'service', 'help'], theme: 'Staff Quality' },
    { keywords: ['price', 'cost', 'expensive', 'cheap', 'value'], theme: 'Pricing' },
    { keywords: ['wait', 'time', 'quick', 'fast', 'slow'], theme: 'Service Speed' },
    { keywords: ['easy', 'difficult', 'simple', 'complex', 'user'], theme: 'Ease of Use' },
    { keywords: ['quality', 'product', 'feature'], theme: 'Product Quality' }
  ];
  
  const foundThemes = themes.filter(theme => 
    theme.keywords.some(keyword => text.toLowerCase().includes(keyword))
  );
  
  return foundThemes.map(theme => ({
    theme: theme.theme,
    frequency: 1,
    sentiment: 'neutral' as const
  }));
};

export const generateCustomerInsights = (responses: FeedbackResponse[]): CustomerInsight[] => {
  const categoryGroups = responses.reduce((acc, response) => {
    if (!acc[response.category]) {
      acc[response.category] = [];
    }
    acc[response.category].push(response);
    return acc;
  }, {} as Record<string, FeedbackResponse[]>);

  return Object.entries(categoryGroups).map(([category, categoryResponses]) => {
    const averageScore = categoryResponses.reduce((sum, r) => sum + r.score, 0) / categoryResponses.length;
    const textResponses = categoryResponses.filter(r => typeof r.value === 'string').map(r => r.value as string);
    
    // Analyze sentiment of text responses
    const sentiments = textResponses.map(text => analyzeSentiment(text));
    const overallSentiment = sentiments.length > 0 
      ? sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length 
      : 0;

    // Extract key issues from negative feedback
    const keyIssues = extractKeyIssues(textResponses, sentiments);
    
    // Generate recommendations based on score and issues
    const recommendations = generateRecommendations(category, averageScore, keyIssues);

    return {
      category: getCategoryDisplayName(category),
      sentiment: overallSentiment > 0.1 ? 'positive' : overallSentiment < -0.1 ? 'negative' : 'neutral',
      averageScore: Math.round(averageScore * 20), // Convert to percentage
      responseCount: categoryResponses.length,
      trend: 'stable', // Would be calculated from historical data
      keyIssues,
      recommendations
    };
  });
};

const extractKeyIssues = (textResponses: string[], sentiments: SentimentAnalysis[]): string[] => {
  const issues: string[] = [];
  
  sentiments.forEach((sentiment, index) => {
    if (sentiment.overall === 'negative') {
      const themes = sentiment.themes.map(t => t.theme);
      issues.push(...themes);
    }
  });
  
  // Remove duplicates and return top issues
  return [...new Set(issues)].slice(0, 3);
};

const generateRecommendations = (category: string, score: number, issues: string[]): string[] => {
  const recommendations: string[] = [];
  
  if (score < 60) {
    recommendations.push(`Immediate attention needed for ${getCategoryDisplayName(category)} - score below 60%`);
  }
  
  if (issues.includes('Staff Quality')) {
    recommendations.push('Consider additional staff training programs');
  }
  
  if (issues.includes('Service Speed')) {
    recommendations.push('Review and optimize service delivery processes');
  }
  
  if (issues.includes('Pricing')) {
    recommendations.push('Analyze pricing strategy and communicate value proposition better');
  }
  
  if (score > 80) {
    recommendations.push(`Maintain excellent performance in ${getCategoryDisplayName(category)}`);
  }
  
  return recommendations;
};

export const generateImprovementSuggestions = (insights: CustomerInsight[]): ImprovementSuggestion[] => {
  const suggestions: ImprovementSuggestion[] = [];
  
  insights.forEach(insight => {
    if (insight.sentiment === 'negative' || insight.averageScore < 60) {
      suggestions.push({
        priority: insight.averageScore < 50 ? 'high' : 'medium',
        category: insight.category,
        issue: `Low satisfaction in ${insight.category} (${insight.averageScore}%)`,
        suggestion: `Focus on ${insight.keyIssues.join(', ')} to improve customer experience`,
        impact: 'Could increase overall satisfaction by 15-25%',
        effort: insight.keyIssues.length > 2 ? 'high' : 'medium'
      });
    }
    
    if (insight.sentiment === 'positive' && insight.averageScore > 85) {
      suggestions.push({
        priority: 'low',
        category: insight.category,
        issue: 'Opportunity to leverage strength',
        suggestion: `Use ${insight.category} as a competitive advantage in marketing`,
        impact: 'Could help attract new customers',
        effort: 'low'
      });
    }
  });
  
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

const getCategoryDisplayName = (category: string): string => {
  const displayNames: Record<string, string> = {
    'QualityCommunication': 'Communication Quality',
    'QualityStaff': 'Staff Quality',
    'ValueForMoney': 'Value for Money',
    'QualityService': 'Service Quality',
    'LikeliRecommend': 'Likelihood to Recommend',
    'DidWeMakeEasy': 'Ease of Business',
    'Comments': 'General Feedback'
  };
  return displayNames[category] || category;
};
