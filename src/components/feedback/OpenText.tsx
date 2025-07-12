
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface OpenTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export const OpenText: React.FC<OpenTextProps> = ({
  value,
  onChange,
  placeholder = 'Please share your thoughts...',
  maxLength = 500
}) => {
  return (
    <div className="space-y-3">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="min-h-[120px] resize-none border-gray-300 focus:border-[#007ACE] focus:ring-[#007ACE]"
      />
      <div className="flex justify-between text-sm text-gray-500">
        <span>Share any additional thoughts or suggestions</span>
        <span>{value.length}/{maxLength}</span>
      </div>
    </div>
  );
};
