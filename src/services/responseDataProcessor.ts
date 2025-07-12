
export interface ProcessedResponseData {
  distribution: Record<string, number>;
  insights: string[];
  totalResponses: number;
  completionRate: number;
}

export interface ResponseInsight {
  type: string;
  summary: string;
  details: string[];
  trend: 'positive' | 'neutral' | 'negative' | 'mixed';
}

export const processResponsesByType = (
  questionType: string,
  responses: any[],
  totalSessions: number
): ProcessedResponseData => {
  const distribution: Record<string, number> = {};
  const insights: string[] = [];
  const totalResponses = responses.length;
  const completionRate = totalSessions > 0 ? (totalResponses / totalSessions) * 100 : 0;

  // Process responses based on question type
  responses.forEach(response => {
    const value = String(response.response_value || 'No Response');
    distribution[value] = (distribution[value] || 0) + 1;
  });

  return {
    distribution,
    insights: generateInsightsByType(questionType, distribution, totalResponses),
    totalResponses,
    completionRate
  };
};

const generateInsightsByType = (
  questionType: string,
  distribution: Record<string, number>,
  totalResponses: number
): string[] => {
  const insights: string[] = [];
  
  switch (questionType.toLowerCase()) {
    case 'star rating':
      return generateStarRatingInsights(distribution, totalResponses);
    
    case 'nps score':
      return generateNPSInsights(distribution, totalResponses);
    
    case 'single choice':
    case 'multiple choice':
      return generateChoiceInsights(distribution, totalResponses);
    
    case 'likert scale':
      return generateLikertInsights(distribution, totalResponses);
    
    case 'emoji rating':
      return generateEmojiInsights(distribution, totalResponses);
    
    case 'slider':
      return generateSliderInsights(distribution, totalResponses);
    
    case 'text input':
      return generateTextInsights(distribution, totalResponses);
    
    default:
      return [`${totalResponses} responses collected`];
  }
};

const generateStarRatingInsights = (distribution: Record<string, number>, total: number): string[] => {
  const insights: string[] = [];
  const entries = Object.entries(distribution).map(([key, value]) => ({ 
    rating: parseInt(key) || 0, 
    count: value 
  }));
  
  const highRatings = entries.filter(e => e.rating >= 4).reduce((sum, e) => sum + e.count, 0);
  const lowRatings = entries.filter(e => e.rating <= 2).reduce((sum, e) => sum + e.count, 0);
  
  const highPercentage = Math.round((highRatings / total) * 100);
  const lowPercentage = Math.round((lowRatings / total) * 100);
  
  if (highPercentage > 60) {
    insights.push(`Strong satisfaction: ${highPercentage}% gave 4+ stars`);
  }
  if (lowPercentage > 20) {
    insights.push(`${lowPercentage}% gave low ratings (1-2 stars)`);
  }
  
  const mostCommon = entries.sort((a, b) => b.count - a.count)[0];
  if (mostCommon) {
    insights.push(`Most common rating: ${mostCommon.rating} stars (${Math.round((mostCommon.count / total) * 100)}%)`);
  }
  
  return insights.length > 0 ? insights : [`${total} star ratings collected`];
};

const generateNPSInsights = (distribution: Record<string, number>, total: number): string[] => {
  const insights: string[] = [];
  let promoters = 0, passives = 0, detractors = 0;
  
  Object.entries(distribution).forEach(([score, count]) => {
    const numScore = parseInt(score) || 0;
    if (numScore >= 9) promoters += count;
    else if (numScore >= 7) passives += count;
    else detractors += count;
  });
  
  const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
  const promoterPercentage = Math.round((promoters / total) * 100);
  const detractorPercentage = Math.round((detractors / total) * 100);
  
  insights.push(`NPS Score: ${npsScore}`);
  insights.push(`${promoterPercentage}% promoters, ${detractorPercentage}% detractors`);
  
  if (npsScore > 50) insights.push('Excellent customer loyalty');
  else if (npsScore > 0) insights.push('Positive overall sentiment');
  else insights.push('Room for improvement in customer satisfaction');
  
  return insights;
};

const generateChoiceInsights = (distribution: Record<string, number>, total: number): string[] => {
  const insights: string[] = [];
  const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  
  if (sorted.length > 0) {
    const topChoice = sorted[0];
    const percentage = Math.round((topChoice[1] / total) * 100);
    insights.push(`Most popular: "${topChoice[0]}" (${percentage}%)`);
    
    if (percentage > 60) {
      insights.push('Clear preference identified');
    } else if (percentage < 30) {
      insights.push('Even distribution across options');
    }
  }
  
  if (sorted.length > 1) {
    const secondChoice = sorted[1];
    const secondPercentage = Math.round((secondChoice[1] / total) * 100);
    insights.push(`Second choice: "${secondChoice[0]}" (${secondPercentage}%)`);
  }
  
  return insights;
};

const generateLikertInsights = (distribution: Record<string, number>, total: number): string[] => {
  const insights: string[] = [];
  let agreementCount = 0;
  let disagreementCount = 0;
  
  Object.entries(distribution).forEach(([response, count]) => {
    const lowerResponse = response.toLowerCase();
    if (lowerResponse.includes('agree') && !lowerResponse.includes('disagree')) {
      agreementCount += count;
    } else if (lowerResponse.includes('disagree')) {
      disagreementCount += count;
    }
  });
  
  const agreementRate = Math.round((agreementCount / total) * 100);
  const disagreementRate = Math.round((disagreementCount / total) * 100);
  
  insights.push(`${agreementRate}% agreement, ${disagreementRate}% disagreement`);
  
  if (agreementRate > 70) {
    insights.push('Strong consensus in favor');
  } else if (disagreementRate > 50) {
    insights.push('Majority disagrees with statement');
  } else {
    insights.push('Mixed opinions on this topic');
  }
  
  return insights;
};

const generateEmojiInsights = (distribution: Record<string, number>, total: number): string[] => {
  const insights: string[] = [];
  const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  
  if (sorted.length > 0) {
    const topEmoji = sorted[0];
    const percentage = Math.round((topEmoji[1] / total) * 100);
    insights.push(`Most used: ${topEmoji[0]} (${percentage}%)`);
  }
  
  // Categorize emotions (simplified)
  let positiveCount = 0;
  let negativeCount = 0;
  
  Object.entries(distribution).forEach(([emoji, count]) => {
    if (['😊', '😍', '🥰', '😄', '👍', '❤️', '😀', '🎉'].includes(emoji)) {
      positiveCount += count;
    } else if (['😢', '😠', '😞', '👎', '😡', '😔', '😒'].includes(emoji)) {
      negativeCount += count;
    }
  });
  
  const positiveRate = Math.round((positiveCount / total) * 100);
  insights.push(`${positiveRate}% positive emotional responses`);
  
  return insights;
};

const generateSliderInsights = (distribution: Record<string, number>, total: number): string[] => {
  const insights: string[] = [];
  const values = Object.entries(distribution)
    .map(([key, count]) => ({ value: parseFloat(key) || 0, count }))
    .filter(item => !isNaN(item.value));
  
  if (values.length > 0) {
    const weightedSum = values.reduce((sum, item) => sum + (item.value * item.count), 0);
    const average = weightedSum / total;
    insights.push(`Average value: ${average.toFixed(1)}`);
    
    const sortedValues = values.sort((a, b) => a.value - b.value);
    const minValue = sortedValues[0].value;
    const maxValue = sortedValues[sortedValues.length - 1].value;
    const range = maxValue - minValue;
    
    if (range > 0) {
      const normalizedAverage = ((average - minValue) / range) * 100;
      if (normalizedAverage > 75) {
        insights.push('Values tend toward upper range');
      } else if (normalizedAverage < 25) {
        insights.push('Values tend toward lower range');
      } else {
        insights.push('Balanced distribution of values');
      }
    }
  }
  
  return insights;
};

const generateTextInsights = (distribution: Record<string, number>, total: number): string[] => {
  const insights: string[] = [];
  
  insights.push(`${total} text responses collected`);
  
  // Analyze response lengths (simplified)
  let shortResponses = 0;
  let longResponses = 0;
  
  Object.entries(distribution).forEach(([text, count]) => {
    const length = text.length;
    if (length < 20) {
      shortResponses += count;
    } else if (length > 100) {
      longResponses += count;
    }
  });
  
  const shortPercentage = Math.round((shortResponses / total) * 100);
  const longPercentage = Math.round((longResponses / total) * 100);
  
  if (longPercentage > 30) {
    insights.push(`${longPercentage}% provided detailed responses`);
  }
  if (shortPercentage > 50) {
    insights.push(`${shortPercentage}% gave brief responses`);
  }
  
  return insights;
};
