
import React from 'react';
import { TrendingUp, Users, Heart, BarChart3 } from 'lucide-react';

export const FloatingMetrics: React.FC = () => {
  const metrics = [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      value: "94%",
      label: "Satisfaction Rate",
      position: "top-20 right-20",
      delay: "0s"
    },
    {
      icon: <Users className="w-4 h-4" />,
      value: "2,000+",
      label: "Happy Customers",
      position: "top-1/3 left-16",
      delay: "1s"
    },
    {
      icon: <Heart className="w-4 h-4" />,
      value: "15M+",
      label: "Feedback Collected",
      position: "bottom-1/3 right-16",
      delay: "2s"
    },
    {
      icon: <BarChart3 className="w-4 h-4" />,
      value: "40%",
      label: "Growth Increase",
      position: "bottom-32 left-1/4",
      delay: "3s"
    }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none hidden lg:block">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`absolute ${metric.position} bg-white/80 dark:bg-dark-warm-100/80 backdrop-blur-sm border border-warm-gray-200/50 dark:border-dark-warm-300/50 rounded-2xl p-4 shadow-lg shadow-warm-gray-900/5 dark:shadow-dark-warm-50/20 animate-float`}
          style={{ animationDelay: metric.delay }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-sunset-500 to-coral-500 rounded-lg text-white">
              {metric.icon}
            </div>
            <div>
              <div className="text-lg font-space font-bold text-warm-gray-900 dark:text-dark-warm-900">
                {metric.value}
              </div>
              <div className="text-xs text-warm-gray-600 dark:text-dark-warm-600">
                {metric.label}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
