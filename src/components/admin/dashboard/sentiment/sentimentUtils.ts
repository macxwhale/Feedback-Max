
export const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 text-green-800';
    case 'negative':
      return 'bg-red-100 text-red-800';
    case 'neutral':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const calculateSentiment = (score: number): string => {
  if (score >= 4) return 'positive';
  if (score <= 2) return 'negative';
  return 'neutral';
};

export const aggregateSentimentStats = (questionSentiments: Array<{ sentiment: string }>) => {
  const stats = {
    positive: 0,
    negative: 0,
    neutral: 0
  };

  questionSentiments.forEach(question => {
    if (question.sentiment === 'positive') stats.positive++;
    else if (question.sentiment === 'negative') stats.negative++;
    else stats.neutral++;
  });

  return stats;
};

export const calculateOverallSentiment = (stats: { positive: number; negative: number; neutral: number }): string => {
  const total = stats.positive + stats.negative + stats.neutral;
  if (total === 0) return 'neutral';
  
  const positiveRate = stats.positive / total;
  const negativeRate = stats.negative / total;
  
  if (positiveRate > 0.6) return 'positive';
  if (negativeRate > 0.4) return 'negative';
  return 'neutral';
};
