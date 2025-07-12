export interface QuestionAnalysis {
  type: string;
  analysis: string;
  insights: string[];
  recommendations: string[];
  trend: 'positive' | 'neutral' | 'negative' | 'mixed';
}

export const analyzeQuestionByType = (question: any): QuestionAnalysis => {
  const { question_type, completion_rate, total_responses, response_distribution, insights, trend } = question;
  
  // Use the real insights and trend from the processed data
  if (insights && trend) {
    return {
      type: question_type,
      analysis: getTrendLabel(trend),
      insights: insights,
      recommendations: generateRecommendations(question_type, trend, completion_rate, total_responses),
      trend: trend
    };
  }
  
  // Fallback for backwards compatibility
  switch (question_type.toLowerCase()) {
    case 'star rating':
      return analyzeStarRating(question);
    
    case 'nps score':
      return analyzeNPSScore(question);
    
    case 'likert scale':
      return analyzeLikertScale(question);
    
    case 'multiple choice':
    case 'single choice':
      return analyzeChoiceQuestion(question);
    
    case 'slider':
      return analyzeSlider(question);
    
    case 'emoji rating':
      return analyzeEmojiRating(question);
    
    case 'ranking':
      return analyzeRanking(question);
    
    case 'matrix question':
      return analyzeMatrix(question);
    
    case 'text input':
      return analyzeTextInput(question);
    
    default:
      return {
        type: question_type,
        analysis: 'Standard Analysis',
        insights: ['Basic response tracking'],
        recommendations: ['Continue monitoring responses'],
        trend: 'neutral'
      };
  }
};

const getTrendLabel = (trend: string): string => {
  switch (trend) {
    case 'positive':
      return 'Performing Well';
    case 'negative':
      return 'Needs Attention';
    case 'mixed':
      return 'Mixed Results';
    default:
      return 'Neutral';
  }
};

const generateRecommendations = (
  questionType: string, 
  trend: string, 
  completionRate: number, 
  totalResponses: number
): string[] => {
  const recommendations: string[] = [];
  
  // General completion rate recommendations
  if (completionRate < 70) {
    recommendations.push('Consider simplifying the question or making it optional');
  } else if (completionRate > 90) {
    recommendations.push('Question performs well, consider using similar format for others');
  }
  
  // Trend-based recommendations
  switch (trend) {
    case 'positive':
      recommendations.push('Maintain current approach');
      recommendations.push('Consider highlighting this success');
      break;
    case 'negative':
      recommendations.push('Review question wording for clarity');
      recommendations.push('Consider follow-up questions to understand issues');
      break;
    case 'mixed':
      recommendations.push('Analyze response patterns for insights');
      recommendations.push('Consider segmenting results by demographics');
      break;
  }
  
  // Question type specific recommendations
  switch (questionType.toLowerCase()) {
    case 'text input':
      if (totalResponses > 20) {
        recommendations.push('Perform sentiment analysis on text responses');
      }
      break;
    case 'star rating':
    case 'nps score':
      recommendations.push('Track trends over time');
      break;
    case 'single choice':
    case 'multiple choice':
      recommendations.push('Consider adding "Other" option if not present');
      break;
  }
  
  return recommendations.length > 0 ? recommendations : ['Continue monitoring responses'];
};

const analyzeStarRating = (question: any): QuestionAnalysis => {
  const { completion_rate, total_responses, response_distribution } = question;
  let analysis = '';
  let insights = [];
  let recommendations = [];
  
  // Calculate average from distribution
  let totalStars = 0;
  let totalCount = 0;
  Object.entries(response_distribution).forEach(([rating, count]) => {
    totalStars += parseInt(rating) * (count as number);
    totalCount += count as number;
  });
  const avgRating = totalCount > 0 ? totalStars / totalCount : 0;
  
  if (avgRating >= 4.5) {
    analysis = 'Excellent';
    insights.push('High customer satisfaction');
    recommendations.push('Maintain current service quality');
  } else if (avgRating >= 3.5) {
    analysis = 'Good';
    insights.push('Above average satisfaction');
    recommendations.push('Identify areas for improvement');
  } else if (avgRating >= 2.5) {
    analysis = 'Average';
    insights.push('Room for improvement');
    recommendations.push('Investigate specific pain points');
  } else {
    analysis = 'Poor';
    insights.push('Critical satisfaction issues');
    recommendations.push('Immediate action required');
  }
  
  if (completion_rate < 70) {
    insights.push('Low completion rate may indicate question fatigue');
    recommendations.push('Consider simplifying or repositioning');
  }
  
  return { type: 'Star Rating', analysis, insights, recommendations, trend: 'neutral' };
};

const analyzeNPSScore = (question: any): QuestionAnalysis => {
  const { response_distribution } = question;
  
  // NPS calculation (0-6 detractors, 7-8 passives, 9-10 promoters)
  let promoters = 0, passives = 0, detractors = 0;
  let totalResponses = 0;
  
  Object.entries(response_distribution).forEach(([score, count]) => {
    const numScore = parseInt(score);
    const numCount = count as number;
    totalResponses += numCount;
    
    if (numScore >= 9) promoters += numCount;
    else if (numScore >= 7) passives += numCount;
    else detractors += numCount;
  });
  
  const npsScore = totalResponses > 0 ? 
    Math.round(((promoters - detractors) / totalResponses) * 100) : 0;
  
  let analysis = '';
  let insights = [];
  let recommendations = [];
  
  if (npsScore >= 50) {
    analysis = 'Excellent';
    insights.push(`Strong loyalty with ${Math.round((promoters/totalResponses)*100)}% promoters`);
    recommendations.push('Leverage promoters for referrals');
  } else if (npsScore >= 0) {
    analysis = 'Good';
    insights.push(`Balanced feedback with NPS of ${npsScore}`);
    recommendations.push('Focus on converting passives to promoters');
  } else {
    analysis = 'Needs Improvement';
    insights.push(`High detractor rate: ${Math.round((detractors/totalResponses)*100)}%`);
    recommendations.push('Address detractor concerns immediately');
  }
  
  return { type: 'NPS', analysis, insights, recommendations, trend: 'neutral' };
};

const analyzeLikertScale = (question: any): QuestionAnalysis => {
  const { response_distribution } = question;
  
  let analysis = '';
  let insights = [];
  let recommendations = [];
  
  // Calculate agreement levels
  let totalResponses = 0;
  let positiveResponses = 0;
  
  Object.entries(response_distribution).forEach(([response, count]) => {
    const numCount = count as number;
    totalResponses += numCount;
    
    // Assuming 5-point Likert (Agree/Strongly Agree are positive)
    if (response.toLowerCase().includes('agree') && !response.toLowerCase().includes('disagree')) {
      positiveResponses += numCount;
    }
  });
  
  const agreementRate = totalResponses > 0 ? (positiveResponses / totalResponses) * 100 : 0;
  
  if (agreementRate >= 70) {
    analysis = 'Strong Agreement';
    insights.push(`${Math.round(agreementRate)}% agreement rate`);
    recommendations.push('Statement resonates well with audience');
  } else if (agreementRate >= 50) {
    analysis = 'Moderate Agreement';
    insights.push('Mixed opinions detected');
    recommendations.push('Clarify messaging or investigate concerns');
  } else {
    analysis = 'Low Agreement';
    insights.push('Statement may need revision');
    recommendations.push('Reconsider approach or gather more context');
  }
  
  return { type: 'Likert Scale', analysis, insights, recommendations, trend: 'neutral' };
};

const analyzeChoiceQuestion = (question: any): QuestionAnalysis => {
  const { response_distribution, completion_rate, question_type } = question;
  
  let insights = [];
  let recommendations = [];
  
  const responses = Object.entries(response_distribution);
  const totalResponses = responses.reduce((sum, [_, count]) => sum + (count as number), 0);
  
  // Find most and least popular options
  const sortedResponses = responses.sort((a, b) => (b[1] as number) - (a[1] as number));
  const mostPopular = sortedResponses[0];
  
  const topChoicePercentage = totalResponses > 0 ? 
    Math.round(((mostPopular[1] as number) / totalResponses) * 100) : 0;
  
  let analysis = '';
  
  if (topChoicePercentage >= 60) {
    analysis = 'Clear Preference';
    insights.push(`Strong preference for "${mostPopular[0]}" (${topChoicePercentage}%)`);
    recommendations.push('Consider focusing on the preferred option');
  } else if (topChoicePercentage >= 40) {
    analysis = 'Moderate Preference';
    insights.push('Some options are more popular than others');
    recommendations.push('Investigate why certain options are preferred');
  } else {
    analysis = 'Even Distribution';
    insights.push('No clear preference among options');
    recommendations.push('All options seem equally viable');
  }
  
  if (completion_rate > 90) {
    insights.push('High engagement with options provided');
  }
  
  return { type: question_type, analysis, insights, recommendations, trend: 'neutral' };
};

const analyzeSlider = (question: any): QuestionAnalysis => {
  const { response_distribution } = question;
  
  let analysis = '';
  let insights = [];
  let recommendations = [];
  
  // Calculate average from distribution
  let totalValue = 0;
  let totalCount = 0;
  Object.entries(response_distribution).forEach(([value, count]) => {
    totalValue += parseFloat(value) * (count as number);
    totalCount += count as number;
  });
  const avgValue = totalCount > 0 ? totalValue / totalCount : 0;
  
  // Assuming 0-100 or 1-10 scale
  const values = Object.keys(response_distribution).map(Number).filter(n => !isNaN(n));
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;
  
  const normalizedScore = range > 0 ? ((avgValue - minValue) / range) * 100 : 50;
  
  if (normalizedScore >= 75) {
    analysis = 'High Value';
    insights.push('Responses trend toward upper range');
    recommendations.push('Maintain current performance');
  } else if (normalizedScore >= 50) {
    analysis = 'Moderate Value';
    insights.push('Balanced distribution');
    recommendations.push('Opportunity for improvement exists');
  } else {
    analysis = 'Low Value';
    insights.push('Responses trend toward lower range');
    recommendations.push('Significant improvement needed');
  }
  
  return { type: 'Slider', analysis, insights, recommendations, trend: 'neutral' };
};

const analyzeEmojiRating = (question: any): QuestionAnalysis => {
  const { response_distribution } = question;
  
  let insights = [];
  let recommendations = [];
  
  const responses = Object.entries(response_distribution);
  const totalResponses = responses.reduce((sum, [_, count]) => sum + (count as number), 0);
  
  // Categorize emojis (positive, neutral, negative)
  let positive = 0, neutral = 0, negative = 0;
  
  responses.forEach(([emoji, count]) => {
    const numCount = count as number;
    // Simple emoji sentiment classification
    if (['😊', '😍', '🥰', '😄', '👍', '❤️'].includes(emoji)) {
      positive += numCount;
    } else if (['😐', '😑', '🤔'].includes(emoji)) {
      neutral += numCount;
    } else {
      negative += numCount;
    }
  });
  
  const positiveRate = totalResponses > 0 ? (positive / totalResponses) * 100 : 0;
  
  let analysis = '';
  
  if (positiveRate >= 60) {
    analysis = 'Positive Sentiment';
    insights.push(`${Math.round(positiveRate)}% positive reactions`);
    recommendations.push('Emotional connection is strong');
  } else if (positiveRate >= 40) {
    analysis = 'Mixed Sentiment';
    insights.push('Varied emotional responses');
    recommendations.push('Monitor sentiment trends');
  } else {
    analysis = 'Negative Sentiment';
    insights.push('Predominantly negative reactions');
    recommendations.push('Address underlying issues');
  }
  
  return { type: 'Emoji Rating', analysis, insights, recommendations, trend: 'neutral' };
};

const analyzeRanking = (question: any): QuestionAnalysis => {
  const { response_distribution } = question;
  
  let insights = [];
  let recommendations = [];
  
  // For ranking questions, analyze the top-ranked items
  const rankings = Object.entries(response_distribution);
  
  insights.push('Ranking preferences identified');
  recommendations.push('Use rankings to prioritize initiatives');
  
  return {
    type: 'Ranking',
    analysis: 'Priority Analysis',
    insights,
    recommendations,
    trend: 'neutral'
  };
};

const analyzeMatrix = (question: any): QuestionAnalysis => {
  const { total_responses } = question;
  
  let analysis = '';
  let insights = [];
  let recommendations = [];
  
  if (total_responses > 10) {
    analysis = 'Active Responses';
    insights.push('Multiple dimensions show user engagement');
    recommendations.push('Continue monitoring across all areas');
  } else {
    analysis = 'Low Engagement';
    insights.push('Matrix questions may need simplification');
    recommendations.push('Consider breaking into separate questions');
  }
  
  return { type: 'Matrix', analysis, insights, recommendations, trend: 'neutral' };
};

const analyzeTextInput = (question: any): QuestionAnalysis => {
  const { total_responses, completion_rate } = question;
  
  let analysis = '';
  let insights = [];
  let recommendations = [];
  
  if (completion_rate >= 80) {
    analysis = 'High Engagement';
    insights.push('Users are willing to provide detailed feedback');
    recommendations.push('Analyze responses for common themes');
  } else if (completion_rate >= 60) {
    analysis = 'Moderate Engagement';
    insights.push('Some users provide detailed feedback');
    recommendations.push('Consider making question more specific');
  } else {
    analysis = 'Low Engagement';
    insights.push('Users may find question too demanding');
    recommendations.push('Simplify question or make it optional');
  }
  
  if (total_responses > 0) {
    insights.push('Qualitative insights available');
    recommendations.push('Perform sentiment and keyword analysis');
  }
  
  return { type: 'Text Input', analysis, insights, recommendations, trend: 'neutral' };
};
