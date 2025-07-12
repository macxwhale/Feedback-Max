
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MultipleChoiceProps {
  options: string[];
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  multiple: boolean;
}

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  options,
  value,
  onChange,
  multiple
}) => {
  const handleSingleChange = (selectedValue: string) => {
    onChange(selectedValue);
  };

  const handleMultipleChange = (option: string, checked: boolean) => {
    const currentValues = Array.isArray(value) ? value : [];
    if (checked) {
      onChange([...currentValues, option]);
    } else {
      onChange(currentValues.filter(v => v !== option));
    }
  };

  if (multiple) {
    return (
      <div className="space-y-3">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-blue-50 transition-colors"
          >
            <Checkbox
              id={`option-${index}`}
              checked={Array.isArray(value) && value.includes(option)}
              onCheckedChange={(checked) => handleMultipleChange(option, checked as boolean)}
              className="data-[state=checked]:bg-[#073763] data-[state=checked]:border-[#073763]"
            />
            <label
              htmlFor={`option-${index}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    );
  }

  return (
    <RadioGroup value={value as string} onValueChange={handleSingleChange}>
      <div className="space-y-3">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-blue-50 transition-colors"
          >
            <RadioGroupItem 
              value={option} 
              id={`option-${index}`}
              className="border-[#073763] text-[#073763]"
            />
            <label
              htmlFor={`option-${index}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
};
