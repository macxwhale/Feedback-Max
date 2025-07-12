
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, PlayCircle } from 'lucide-react';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
            <Star className="w-3 h-3 mr-1" />
            Trusted by 2,000+ businesses
          </Badge>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Turn Customer Feedback Into
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Growth</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Collect, analyze, and act on customer feedback with AI-powered insights. 
            Make data-driven decisions that actually move the needle.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4 shadow-lg shadow-blue-600/25 group"
            >
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-gray-700 border-gray-300 hover:bg-gray-50 text-lg px-8 py-4 group"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Watch demo
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            No credit card required • 14-day free trial • Setup in under 5 minutes
          </p>
        </div>
      </div>
    </section>
  );
};
