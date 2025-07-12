
import React from 'react';
import { ShieldCheck, Lock, DatabaseZap } from 'lucide-react';

const trustItems = [
  {
    icon: <ShieldCheck className="h-10 w-10 text-sunset-500" />,
    name: 'SOC 2 Compliant',
    description: 'Enterprise-grade security standards.',
  },
  {
    icon: <Lock className="h-10 w-10 text-coral-500" />,
    name: 'GDPR & CCPA Ready',
    description: 'Your data privacy is our priority.',
  },
  {
    icon: <DatabaseZap className="h-10 w-10 text-golden-500" />,
    name: '99.9% Uptime SLA',
    description: 'Reliable service you can count on.',
  },
];

export const TrustBadges: React.FC = () => {
  return (
    <section className="py-24 bg-warm-gray-50 dark:bg-dark-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-sunset-600 dark:text-sunset-400 tracking-wider uppercase">
            Trusted & Secure
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-warm-gray-900 dark:text-dark-warm-900 tracking-tight sm:text-4xl">
            Your peace of mind is our top priority
          </p>
          <p className="mt-5 max-w-prose mx-auto text-xl text-warm-gray-500 dark:text-dark-warm-500">
            We employ best-in-class security practices to keep your data safe, secure, and private.
          </p>
        </div>
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {trustItems.map((item) => (
              <div key={item.name} className="pt-6">
                <div className="flow-root bg-white dark:bg-dark-warm-200 rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-sunset-500 to-coral-500 rounded-md shadow-lg">
                        {React.cloneElement(item.icon, { className: 'h-8 w-8 text-white' })}
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-warm-gray-900 dark:text-dark-warm-900 tracking-tight">{item.name}</h3>
                    <p className="mt-5 text-base text-warm-gray-500 dark:text-dark-warm-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
