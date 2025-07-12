
import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DataUsageInfo: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4 text-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-gray-500 hover:text-gray-700"
      >
        <Info className="h-3 w-3 mr-1" />
        Data Usage
        {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
      </Button>
      
      {isExpanded && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 animate-fade-in">
          <p>Your responses are stored locally and used only for feedback analysis.</p>
          <p className="mt-1">No personal information is collected or shared.</p>
        </div>
      )}
    </div>
  );
};
