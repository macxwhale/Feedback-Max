
import React from 'react';
import { MessageSquare, BarChart3, Target, Users, Building2, TrendingUp } from 'lucide-react';
import { FluidBackground } from './FluidBackground';

export const HowItWorks: React.FC = () => {
  const targetAudiences = [
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Small Businesses",
      description: "Restaurant owners, retail stores, and service providers looking to understand customer satisfaction"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Growing Companies",
      description: "Mid-size businesses scaling operations and needing structured feedback management"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Enterprise Teams",
      description: "Large organizations requiring advanced analytics and team collaboration features"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Collect",
      description: "Deploy feedback forms across touchpoints or send SMS surveys to gather customer insights",
      icon: <MessageSquare className="h-8 w-8" />
    },
    {
      step: "02", 
      title: "Analyze",
      description: "AI automatically categorizes and analyzes sentiment in real-time with machine learning",
      icon: <BarChart3 className="h-8 w-8" />
    },
    {
      step: "03",
      title: "Act",
      description: "Get actionable insights and track improvements with intelligent recommendations",
      icon: <Target className="h-8 w-8" />
    }
  ];

  return (
    <section className="relative py-24 bg-warm-gray-50 dark:bg-dark-warm-50 overflow-hidden">
      <FluidBackground />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Target Audience Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center space-x-2 text-warm-gray-600 dark:text-dark-warm-600 mb-6">
            <Users className="w-5 h-5 text-sunset-500" />
            <span className="text-sm font-medium uppercase tracking-wide">Who It's For</span>
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-space font-black text-warm-gray-900 dark:text-dark-warm-900 mb-6 leading-tight">
            Built for{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-sunset-500 via-coral-500 to-golden-400 bg-clip-text text-transparent">
                every business
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-sunset-500 via-coral-500 to-golden-400 rounded-full"></div>
            </span>
          </h2>
          
          <p className="text-lg lg:text-xl text-warm-gray-600 dark:text-dark-warm-600 max-w-3xl mx-auto leading-relaxed font-medium mb-12">
            Whether you're starting out or scaling up, Pulsify helps you understand and improve customer satisfaction
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {targetAudiences.map((audience, index) => (
              <div key={index} className="group relative bg-white/95 dark:bg-dark-warm-100/95 rounded-2xl p-8 border border-warm-gray-200 dark:border-dark-warm-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-sunset-500/5 via-coral-500/5 to-golden-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-sunset-500 to-coral-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {audience.icon}
                  </div>
                  <h3 className="text-lg font-space font-bold text-warm-gray-900 dark:text-dark-warm-900 mb-3">
                    {audience.title}
                  </h3>
                  <p className="text-warm-gray-600 dark:text-dark-warm-600 leading-relaxed text-sm">
                    {audience.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 text-warm-gray-600 dark:text-dark-warm-600 mb-6">
            <div className="w-2 h-2 bg-sunset-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium uppercase tracking-wide">How It Works</span>
            <div className="w-2 h-2 bg-coral-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-space font-black text-warm-gray-900 dark:text-dark-warm-900 mb-6 leading-tight">
            Simple.{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-sunset-500 via-coral-500 to-golden-400 bg-clip-text text-transparent">
                Powerful.
              </span>
            </span>
            {' '}Effective.
          </h2>
          
          <p className="text-lg lg:text-xl text-warm-gray-600 dark:text-dark-warm-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Three simple steps to transform feedback into growth
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center group relative">
              {index < 2 && (
                <div className="hidden md:block absolute top-16 left-3/4 w-1/2 h-0.5 bg-gradient-to-r from-sunset-300 to-coral-300 dark:from-sunset-600 dark:to-coral-600 opacity-30"></div>
              )}
              
              <div className="relative mb-8 group-hover:scale-110 transition-transform duration-300">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-sunset-500 via-coral-500 to-golden-400 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-sunset-500 via-coral-500 to-golden-400 rounded-2xl mx-auto opacity-20 animate-pulse"></div>
                </div>
                
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-white dark:bg-dark-warm-100 rounded-full border-4 border-sunset-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-lg font-space font-black text-sunset-600">{step.step}</span>
                </div>
              </div>
              
              <h3 className="text-xl lg:text-2xl font-space font-bold text-warm-gray-900 dark:text-dark-warm-900 mb-4">
                {step.title}
              </h3>
              
              <p className="text-warm-gray-600 dark:text-dark-warm-600 leading-relaxed font-medium">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
