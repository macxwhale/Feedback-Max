import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Zap, Clock, Star } from 'lucide-react';
import { FluidBackground } from './FluidBackground';

export const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const urgencyIndicators = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Customer complaints increasing?",
      description: "Don't wait until it's too late - start monitoring satisfaction now"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Competing on customer experience?",
      description: "Get ahead of competitors with better customer insights"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Growing fast and losing touch?",
      description: "Scale your business without losing the personal connection"
    }
  ];

  const plans = [
    {
      name: "Starter",
      monthlyPrice: 7,
      yearlyPrice: 70,
      period: isYearly ? "/year" : "/month",
      description: "Perfect for small teams getting started with feedback.",
      features: [
        "Up to 5 team members",
        "1,000 responses/month",
        "Standard Analytics",
        "Email Support",
      ],
      popular: false,
      cta: "Start Free Trial",
      gradient: "from-warm-gray-100 to-warm-gray-50",
    },
    {
      name: "Growth", 
      monthlyPrice: 27,
      yearlyPrice: 270,
      period: isYearly ? "/year" : "/month",
      description: "For growing businesses who need to scale their feedback operations.",
      features: [
        "Up to 15 team members",
        "5,000 responses/month",
        "AI-Powered Insights",
        "Priority Support",
        "Custom Branding",
      ],
      popular: true,
      cta: "Start Free Trial",
      gradient: "from-sunset-50 to-coral-50",
    },
    {
      name: "Pro",
      monthlyPrice: 97,
      yearlyPrice: 970,
      period: isYearly ? "/year" : "/month",
      description: "For established businesses that require advanced control and integrations.",
      features: [
        "Up to 30 team members",
        "20,000 responses/month",
        "API Access",
        "Advanced Integrations",
        "Team Collaboration Tools",
      ],
      popular: false,
      cta: "Start Free Trial",
      gradient: "from-golden-50 to-sunset-50",
    },
    {
      name: "Enterprise",
      monthlyPrice: 247,
      yearlyPrice: 2470,
      period: isYearly ? "/year" : "/month",
      description: "Tailored solutions for large organizations with complex needs.", 
      features: [
        "Unlimited team members",
        "Custom response limits",
        "Dedicated Success Manager",
        "SLA & Advanced Security",
        "On-premise deployment",
      ],
      popular: false,
      cta: "Start Free Trial",
      gradient: "from-warm-gray-100 to-warm-gray-50",
    },
  ];

  const getPrice = (plan: typeof plans[0]) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  return (
    <section id="pricing" className="relative py-32 bg-gradient-to-br from-warm-gray-50 via-white to-sunset-50/30 dark:from-dark-warm-50 dark:via-dark-warm-100 dark:to-dark-warm-50 overflow-hidden">
      <FluidBackground />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* WHEN - Urgency */}
        <div className="text-center mb-24 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 text-warm-gray-600 dark:text-dark-warm-600 mb-8">
            <Clock className="w-6 h-6 text-sunset-500" />
            <span className="text-lg font-space font-medium">When You Need It</span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-space font-black text-warm-gray-900 dark:text-dark-warm-900 mb-8 leading-tight">
            The{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-sunset-500 via-coral-500 to-golden-400 bg-clip-text text-transparent">
                right time
              </span>
              <div className="absolute -bottom-3 left-0 right-0 h-2 bg-gradient-to-r from-sunset-500 via-coral-500 to-golden-400 rounded-full animate-scale-in"></div>
            </span>
            {' '}is now
          </h2>
          
          <p className="text-xl lg:text-2xl text-warm-gray-600 dark:text-dark-warm-600 leading-relaxed font-medium max-w-4xl mx-auto mb-16">
            Don't wait until customer satisfaction becomes a crisis. Start building better relationships today.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {urgencyIndicators.map((indicator, index) => (
              <div key={index} className="bg-white/80 dark:bg-dark-warm-100/80 backdrop-blur-sm rounded-3xl p-8 border border-warm-gray-200/50 dark:border-dark-warm-300/50 group hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  {indicator.icon}
                </div>
                <h3 className="text-xl font-space font-bold text-warm-gray-900 dark:text-dark-warm-900 mb-4">
                  {indicator.title}
                </h3>
                <p className="text-warm-gray-600 dark:text-dark-warm-600 leading-relaxed">
                  {indicator.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* WHERE - Pricing Plans */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 text-warm-gray-600 dark:text-dark-warm-600 mb-8">
            <Zap className="w-6 h-6 text-sunset-500" />
            <span className="text-lg font-space font-medium">Where To Get Started</span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-space font-black text-warm-gray-900 dark:text-dark-warm-900 mb-8 leading-tight">
            Choose your{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-sunset-500 via-coral-500 to-golden-400 bg-clip-text text-transparent">
                growth path
              </span>
            </span>
          </h2>
          
          <p className="text-xl lg:text-2xl text-warm-gray-600 dark:text-dark-warm-600 leading-relaxed font-medium max-w-4xl mx-auto mb-12">
            Start free, scale as you grow. Upgrade or downgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-16">
            <span className={`text-lg font-medium ${!isYearly ? 'text-sunset-600 dark:text-sunset-400' : 'text-warm-gray-600 dark:text-dark-warm-600'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sunset-500 focus:ring-offset-2 ${
                isYearly ? 'bg-sunset-500' : 'bg-warm-gray-300 dark:bg-dark-warm-400'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg font-medium ${isYearly ? 'text-sunset-600 dark:text-sunset-400' : 'text-warm-gray-600 dark:text-dark-warm-600'}`}>
              Yearly
              <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16 items-stretch">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`flex flex-col border-0 shadow-lg relative transition-all duration-300 rounded-3xl group ${
                plan.popular
                  ? 'bg-white dark:bg-dark-warm-100 shadow-2xl shadow-sunset-500/20 ring-2 ring-sunset-500 z-10'
                  : 'bg-white/60 dark:bg-dark-warm-100/60 backdrop-blur-md border border-warm-gray-200/50 dark:border-dark-warm-300/50 hover:bg-white dark:hover:bg-dark-warm-100 hover:shadow-xl hover:scale-[1.02]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-sunset-500 to-coral-500 text-white px-6 py-2 text-base font-space font-bold shadow-lg rounded-full">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8 pt-12">
                <CardTitle className="text-3xl font-space font-extrabold text-warm-gray-900 dark:text-dark-warm-900 mb-2">
                  {plan.name}
                </CardTitle>
                
                <div className="mt-6 mb-4">
                  <span className="text-5xl font-space font-black text-warm-gray-900 dark:text-dark-warm-900">
                    ${getPrice(plan)}
                  </span>
                  {plan.period && (
                    <span className="text-warm-gray-500 dark:text-dark-warm-500 text-lg font-medium">
                      {plan.period}
                    </span>
                  )}
                </div>
                
                <CardDescription className="text-warm-gray-600 dark:text-dark-warm-600 text-base leading-relaxed px-4">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-col flex-grow px-8 pb-8">
                <ul className="space-y-4 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-warm-gray-700 dark:text-dark-warm-600 font-medium text-base">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full mt-10"
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => navigate('/auth')}
                >
                  <span className="flex items-center justify-center">
                    {plan.cta}
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <div className="bg-white/80 dark:bg-dark-warm-100/80 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-warm-gray-200/50 dark:border-dark-warm-300/50 shadow-lg">
            <p className="text-warm-gray-600 dark:text-dark-warm-600 font-medium text-lg">
              All plans include a <span className="text-sunset-600 dark:text-sunset-400 font-semibold">14-day free trial</span>
              <br />
              No setup fees • Cancel anytime • Full feature access
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
