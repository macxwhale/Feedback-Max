
import React from 'react';

interface LikertScaleProps {
  value: number | undefined;
  onChange: (value: number) => void;
  scale?: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
}

export const LikertScale: React.FC<LikertScaleProps> = ({ 
  value, 
  onChange, 
  scale = { min: 1, max: 5, minLabel: 'Strongly Disagree', maxLabel: 'Strongly Agree' }
}) => {
  const { min, max, minLabel, maxLabel } = scale;
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  
  const getOptionLabel = (option: number) => {
    if (option === min) return minLabel;
    if (option === max) return maxLabel;
    if (max - min === 4) {
      const labels = ['', 'Disagree', 'Neutral', 'Agree', ''];
      return labels[option - min];
    }
    return `${option}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-sm text-gray-600 mb-4">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option}
            className={`
              flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              hover:bg-blue-50 hover:border-[#007ACE]
              ${
                value === option
                  ? 'bg-gradient-to-r from-[#073763] to-[#007ACE] text-white border-[#073763]'
                  : 'bg-white border-gray-300'
              }
            `}
          >
            <input
              type="radio"
              name="likert"
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{getOptionLabel(option)}</span>
              <span className="text-sm opacity-75">({option})</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
