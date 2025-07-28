
import React from 'react';
import { Smile, Frown, Meh } from 'lucide-react';

interface SentimentIconProps {
  sentiment: string;
  className?: string;
}

export const SentimentIcon: React.FC<SentimentIconProps> = ({ sentiment, className = "w-4 h-4" }) => {
  switch (sentiment) {
    case 'positive':
      return <Smile className={`text-green-600 ${className}`} />;
    case 'negative':
      return <Frown className={`text-red-600 ${className}`} />;
    case 'neutral':
    default:
      return <Meh className={`text-gray-600 ${className}`} />;
  }
};
