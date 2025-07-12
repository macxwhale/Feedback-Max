
import React from 'react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { CheckCircle, Circle } from 'lucide-react';

interface BreadcrumbNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  completedQuestions: number[];
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  currentIndex,
  totalQuestions,
  completedQuestions
}) => {
  const sections = [
    { name: 'Service Quality', range: [0, 2] },
    { name: 'Customer Experience', range: [3, 5] },
    { name: 'Overall Satisfaction', range: [6, totalQuestions - 1] }
  ];

  const getCurrentSection = () => {
    return sections.find(section => 
      currentIndex >= section.range[0] && currentIndex <= section.range[1]
    );
  };

  const currentSection = getCurrentSection();

  return (
    <div className="mb-6 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <Breadcrumb>
        <BreadcrumbList className="flex-wrap">
          {sections.map((section, index) => {
            const isActive = section === currentSection;
            const isCompleted = section.range.every(i => completedQuestions.includes(i));
            
            return (
              <BreadcrumbItem key={section.name} className="flex items-center">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all ${
                  isActive ? 'bg-blue-100 text-blue-700' : 
                  isCompleted ? 'bg-green-100 text-green-700' : 'text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <BreadcrumbPage className="font-medium">{section.name}</BreadcrumbPage>
                </div>
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
