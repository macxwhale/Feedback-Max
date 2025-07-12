
import React from 'react';

interface EmojiRatingProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export const EmojiRating: React.FC<EmojiRatingProps> = ({ 
  value, 
  onChange, 
  options 
}) => {
  // Filter out empty options and ensure we have valid emojis
  const validOptions = options.filter(option => option && option.trim());
  
  // If no options provided, use default emojis
  const displayOptions = validOptions.length > 0 ? validOptions : ['😞', '😐', '😊'];

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-4">
        {displayOptions.map((emoji, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(emoji)}
            className={`text-6xl p-4 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#f97316] ${
              value === emoji ? 'bg-orange-100 scale-110' : 'hover:bg-gray-100'
            }`}
            aria-label={`Select ${emoji} rating`}
          >
            {emoji}
          </button>
        ))}
      </div>
      {value && (
        <div className="text-center">
          <span className="text-lg font-medium text-[#073763]">
            You selected: {value}
          </span>
        </div>
      )}
    </div>
  );
};
