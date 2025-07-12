
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface MobileProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
  completedQuestions: number[];
}

export const MobileProgressBar: React.FC<MobileProgressBarProps> = ({
  currentIndex,
  totalQuestions,
  completedQuestions
}) => {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="mb-4 bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {completedQuestions.includes(currentIndex) ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-gray-400" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {currentIndex + 1} of {totalQuestions}
          </span>
        </div>
        <span className="text-sm font-bold text-orange-600">
          {Math.round(progress)}%
        </span>
      </div>
      
      <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-center mt-2">
        <div className="flex space-x-1">
          {Array.from({ length: Math.min(totalQuestions, 8) }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= currentIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
