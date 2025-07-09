
export const calculateSentiment = (score: number): 'positive' | 'negative' | 'neutral' => {
  if (score >= 7) return 'positive';
  if (score <= 4) return 'negative';
  return 'neutral';
};

export const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'negative':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'neutral':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const aggregateSentimentStats = (questionSentiments: any[]) => {
  const positive = questionSentiments.filter(q => q.sentiment === 'positive').length;
  const negative = questionSentiments.filter(q => q.sentiment === 'negative').length;
  const neutral = questionSentiments.filter(q => q.sentiment === 'neutral').length;
  
  return { positive, negative, neutral };
};

export const calculateOverallSentiment = (stats: { positive: number; negative: number; neutral: number }) => {
  if (stats.positive > stats.negative && stats.positive > stats.neutral) {
    return 'positive';
  } else if (stats.negative > stats.positive && stats.negative > stats.neutral) {
    return 'negative';
  }
  return 'neutral';
};
