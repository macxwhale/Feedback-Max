
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { FluidBackground } from './FluidBackground';

export const SocialProof: React.FC = () => {
  const testimonials = [
    {
      quote: "Pulselify helped us increase customer satisfaction by 40% in just 3 months. The insights are absolutely game-changing for our business growth.",
      author: "Sarah Chen",
      role: "Head of Customer Success",
      company: "TechStart Inc",
      rating: 5,
      gradient: "from-sunset-500 to-coral-500"
    },
    {
      quote: "Finally, a feedback tool that's actually easy to use and powerful. Our entire team loves the real-time dashboards and actionable insights.",
      author: "Marcus Johnson", 
      role: "Operations Director",
      company: "RetailCorp",
      rating: 5,
      gradient: "from-coral-500 to-golden-400"
    }
  ];

  const companies = ['TechStart', 'RetailCorp', 'InnovateCo', 'GrowthLabs', 'ScaleUp'];

  return (
    <section className="relative py-24 bg-warm-gray-50 dark:bg-dark-warm-50 overflow-hidden">
      <FluidBackground variant="dark" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trusted by companies */}
        <div className="text-center mb-16">
          <p className="text-warm-gray-500 dark:text-dark-warm-500 font-medium mb-8 text-sm uppercase tracking-wider">
            Trusted by 2,000+ growing companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60">
            {companies.map((company, index) => (
              <div key={index} className="text-lg lg:text-xl font-space font-bold text-warm-gray-400 dark:text-dark-warm-400 hover:text-sunset-500 transition-colors duration-300">
                {company}
              </div>
            ))}
          </div>
        </div>

        {/* Section header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 text-warm-gray-600 dark:text-dark-warm-600 mb-6">
            <Star className="w-5 h-5 text-golden-400 fill-current" />
            <span className="text-sm font-medium uppercase tracking-wide">Customer Stories</span>
            <Star className="w-5 h-5 text-golden-400 fill-current" />
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-space font-black text-warm-gray-900 dark:text-dark-warm-900 mb-6 leading-tight">
            Loved by{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-sunset-500 via-coral-500 to-golden-400 bg-clip-text text-transparent">
                businesses
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-sunset-500 via-coral-500 to-golden-400 rounded-full"></div>
            </span>
            {' '}worldwide
          </h2>
          
          <p className="text-lg lg:text-xl text-warm-gray-600 dark:text-dark-warm-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Join thousands of companies that trust Pulselify to{' '}
            <span className="text-sunset-600 dark:text-sunset-400 font-semibold">transform their customer relationships</span>
          </p>
        </div>
        
        {/* Testimonials grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white dark:bg-dark-warm-100 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-golden-400 text-golden-400" />
                  ))}
                </div>
                
                <div className="relative mb-8">
                  <Quote className="absolute -top-2 -left-1 w-8 h-8 text-sunset-200 dark:text-sunset-600" />
                  <blockquote className="text-warm-gray-700 dark:text-dark-warm-700 text-lg leading-relaxed font-medium pl-6">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-xl flex items-center justify-center text-white text-lg font-space font-bold mr-4`}>
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-lg font-space font-bold text-warm-gray-900 dark:text-dark-warm-900">
                      {testimonial.author}
                    </div>
                    <div className="text-warm-gray-600 dark:text-dark-warm-600 font-medium text-sm">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
