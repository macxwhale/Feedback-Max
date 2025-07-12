
import React from 'react';

interface NPSRatingProps {
  value: number | undefined;
  onChange: (value: number) => void;
}

export const NPSRating: React.FC<NPSRatingProps> = ({ value, onChange }) => {
  const getScoreLabel = (score: number) => {
    if (score <= 6) return 'Detractor';
    if (score <= 8) return 'Passive';
    return 'Promoter';
  };

  const getScoreColor = (score: number) => {
    if (score <= 6) return 'text-red-600';
    if (score <= 8) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Not likely at all</span>
        <span>Extremely likely</span>
      </div>
      
      <div className="grid grid-cols-11 gap-2">
        {Array.from({ length: 11 }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(index)}
            className={`
              h-12 w-full rounded-lg border-2 transition-all duration-200 
              font-medium text-sm hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#007ACE]
              ${
                value === index
                  ? 'bg-gradient-to-r from-[#073763] to-[#007ACE] text-white border-[#073763]'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-[#007ACE]'
              }
            `}
            aria-label={`Rate ${index} out of 10`}
          >
            {index}
          </button>
        ))}
      </div>

      {value !== undefined && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-lg font-medium text-[#073763]">
            Score: {value}/10
          </div>
          <div className={`text-sm font-medium ${getScoreColor(value)}`}>
            {getScoreLabel(value)}
          </div>
        </div>
      )}
    </div>
  );
};
