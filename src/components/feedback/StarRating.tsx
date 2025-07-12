
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  value, 
  onChange, 
  max = 5 
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-2">
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onChange(starValue)}
              className="transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#007ACE] rounded"
              aria-label={`Rate ${starValue} out of ${max} stars`}
            >
              <Star
                className={`h-10 w-10 ${
                  starValue <= value
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 hover:text-yellow-400'
                }`}
              />
            </button>
          );
        })}
      </div>
      {value > 0 && (
        <div className="text-center">
          <span className="text-lg font-medium text-[#073763]">
            {value} out of {max} stars
          </span>
        </div>
      )}
    </div>
  );
};
