
import React from 'react';
import { Smile, Frown, Meh } from 'lucide-react';

interface SentimentIconProps {
  sentiment: string;
  className?: string;
}

export const SentimentIcon: React.FC<SentimentIconProps> = ({ sentiment, className = "w-4 h-4" }) => {
  switch (sentiment) {
    case 'positive':
      return <Smile className={`${className} text-green-600`} />;
    case 'negative':
      return <Frown className={`${className} text-red-600`} />;
    case 'neutral':
      return <Meh className={`${className} text-yellow-600`} />;
    default:
      return <Meh className={`${className} text-gray-600`} />;
  }
};
