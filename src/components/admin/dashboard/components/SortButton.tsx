
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SortButtonProps {
  field: string;
  currentField: string;
  direction: 'asc' | 'desc';
  onSort: (field: string) => void;
  children: React.ReactNode;
}

export const SortButton: React.FC<SortButtonProps> = ({
  field,
  currentField,
  direction,
  onSort,
  children
}) => {
  return (
    <Button
      variant="ghost"
      onClick={() => onSort(field)}
      className="h-auto p-0 font-medium"
    >
      {children}
      {currentField === field && (
        direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
      )}
    </Button>
  );
};
