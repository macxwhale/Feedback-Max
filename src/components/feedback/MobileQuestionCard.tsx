
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface MobileQuestionCardProps {
  children: React.ReactNode;
  title: string;
  required?: boolean;
  isAnswered?: boolean;
}

export const MobileQuestionCard: React.FC<MobileQuestionCardProps> = ({
  children,
  title,
  required,
  isAnswered
}) => {
  return (
    <Card className={`
      mb-20 shadow-lg border-0 mx-2
      animate-fade-in
      transition-all duration-300 ease-out
      ${isAnswered ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
    `}>
      <CardHeader className={`
        bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white rounded-t-lg 
        relative overflow-hidden p-4
        ${isAnswered ? 'bg-gradient-to-r from-green-500 to-green-600' : ''}
      `}>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1 pr-2">
            <CardTitle className="text-lg leading-tight animate-fade-in">
              {title}
            </CardTitle>
            {required && (
              <span className="text-orange-200 text-xs flex items-center mt-1">
                <span className="text-red-300 mr-1">*</span>
                Required
              </span>
            )}
          </div>
          {isAnswered && (
            <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 animate-scale-in" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
};
