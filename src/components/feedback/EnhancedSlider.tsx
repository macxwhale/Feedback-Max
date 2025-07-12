
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface EnhancedSliderProps {
  value: number;
  onChange: (value: number) => void;
  scale?: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
}

export const EnhancedSlider: React.FC<EnhancedSliderProps> = ({ 
  value, 
  onChange,
  scale = { min: 1, max: 10 }
}) => {
  return (
    <div className="space-y-6">
      <div className="px-3">
        <Slider
          value={[value || scale.min]}
          onValueChange={(values) => onChange(values[0])}
          min={scale.min}
          max={scale.max}
          step={1}
          className="w-full"
        />
      </div>
      
      <div className="flex justify-between text-sm text-gray-600">
        <span>{scale.minLabel || `${scale.min}`}</span>
        <span className="text-lg font-medium text-[#f97316]">
          {value || scale.min}
        </span>
        <span>{scale.maxLabel || `${scale.max}`}</span>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        {Array.from({ length: scale.max - scale.min + 1 }, (_, i) => (
          <span key={i} className="text-center">
            {scale.min + i}
          </span>
        ))}
      </div>
    </div>
  );
};
