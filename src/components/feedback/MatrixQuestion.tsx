
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MatrixQuestionProps {
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
  options: string[];
  scale?: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
}

export const MatrixQuestion: React.FC<MatrixQuestionProps> = ({ 
  value = {}, 
  onChange, 
  options,
  scale = { min: 1, max: 5 }
}) => {
  const handleRowChange = (option: string, rating: number) => {
    onChange({ ...value, [option]: rating });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 border-b border-gray-200">Aspect</th>
            {Array.from({ length: scale.max - scale.min + 1 }, (_, i) => (
              <th key={i} className="text-center p-3 border-b border-gray-200 min-w-[60px]">
                {scale.min + i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {options.map((option) => (
            <tr key={option} className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-100 font-medium">{option}</td>
              {Array.from({ length: scale.max - scale.min + 1 }, (_, i) => {
                const rating = scale.min + i;
                return (
                  <td key={rating} className="p-3 border-b border-gray-100 text-center">
                    <RadioGroup
                      value={value[option]?.toString() || ''}
                      onValueChange={(val) => handleRowChange(option, parseInt(val))}
                    >
                      <RadioGroupItem value={rating.toString()} />
                    </RadioGroup>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>{scale.minLabel || `${scale.min} - Poor`}</span>
        <span>{scale.maxLabel || `${scale.max} - Excellent`}</span>
      </div>
    </div>
  );
};
