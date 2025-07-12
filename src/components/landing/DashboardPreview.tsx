
import React from 'react';
import { BarChart3, TrendingUp, Users, Heart } from 'lucide-react';
import { FluidBackground } from './FluidBackground';

export const DashboardPreview: React.FC = () => {
  return (
    <section className="relative py-24 bg-white dark:bg-background overflow-hidden">
      <FluidBackground variant="dark" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Content */}
          <div className="lg:col-span-5 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 text-warm-gray-600 dark:text-dark-warm-600 mb-6">
              <BarChart3 className="w-5 h-5 text-sunset-500" />
              <span className="text-sm font-medium uppercase tracking-wide">Platform Overview</span>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-space font-black text-warm-gray-900 dark:text-dark-warm-900 mb-6 leading-tight">
              Your{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-sunset-500 via-coral-500 to-golden-400 bg-clip-text text-transparent">
                  complete
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-sunset-500 via-coral-500 to-golden-400 rounded-full"></div>
              </span>
              {' '}customer feedback platform
            </h2>
            
            <p className="text-lg lg:text-xl text-warm-gray-600 dark:text-dark-warm-600 leading-relaxed font-medium mb-8">
              Pulsify is an AI-powered feedback management system that helps businesses collect, analyze, and act on customer insights to drive growth and improve satisfaction
            </p>

            <div className="space-y-4">
              {[
                "Real-time sentiment analysis",
                "Multi-channel feedback collection", 
                "Automated insights & recommendations"
              ].map((feature, index) => (
                <div key={index} className="flex items-center justify-center lg:justify-start space-x-3">
                  <div className="w-2 h-2 bg-sunset-500 rounded-full"></div>
                  <span className="text-warm-gray-700 dark:text-dark-warm-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="lg:col-span-7">
            <div className="relative">
              <div className="bg-white/95 dark:bg-dark-warm-100/95 rounded-3xl shadow-xl border border-warm-gray-200 dark:border-dark-warm-200 p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-space font-bold text-warm-gray-900 dark:text-dark-warm-900">
                      Analytics Dashboard
                    </h3>
                    <p className="text-warm-gray-600 dark:text-dark-warm-600 mt-1">Real-time insights</p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-sunset-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-3 h-3 bg-coral-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { icon: <Users className="w-5 h-5" />, value: "2.8k+", label: "Responses", color: "from-sunset-500 to-coral-500" },
                    { icon: <Heart className="w-5 h-5" />, value: "94%", label: "Satisfaction", color: "from-coral-500 to-golden-400" },
                    { icon: <TrendingUp className="w-5 h-5" />, value: "+23%", label: "Growth", color: "from-golden-400 to-sunset-500" },
                    { icon: <BarChart3 className="w-5 h-5" />, value: "4.8", label: "Avg Rating", color: "from-sunset-500 to-coral-500" }
                  ].map((stat, index) => (
                    <div key={index} className="bg-white/90 dark:bg-dark-warm-200/90 rounded-xl p-4 border border-warm-gray-200/50 dark:border-dark-warm-300/50 hover:-translate-y-1 transition-transform duration-300">
                      <div className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-white mb-2`}>
                        {stat.icon}
                      </div>
                      <div className="text-lg font-space font-bold text-warm-gray-900 dark:text-dark-warm-900">{stat.value}</div>
                      <div className="text-xs text-warm-gray-600 dark:text-dark-warm-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-warm-gray-50 dark:bg-dark-warm-200 rounded-xl p-6 min-h-32 flex items-center justify-center border border-warm-gray-200 dark:border-dark-warm-300">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-sunset-500 to-coral-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <p className="text-lg font-space font-bold text-warm-gray-700 dark:text-dark-warm-700">
                      Interactive Analytics
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-sunset-400 to-coral-400 rounded-xl opacity-20 animate-float"></div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-golden-400 to-sunset-400 rounded-2xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
