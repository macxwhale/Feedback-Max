
import React from 'react';
import { Footer } from '@/components/landing/Footer';
import { ModernHeader } from '@/components/landing/ModernHeader';

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-white dark:bg-background">
      <ModernHeader />
      <main className="max-w-4xl mx-auto pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-warm-gray-900 dark:text-dark-warm-900 mb-8">Terms of Service</h1>
        <div className="prose dark:prose-invert max-w-none text-warm-gray-600 dark:text-dark-warm-600 space-y-4">
          <p>Last updated: June 15, 2025</p>

          <h2 className="text-2xl font-bold text-warm-gray-900 dark:text-dark-warm-900 !mt-8">1. Agreement to Terms</h2>
          <p>
            By using our services, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the services.
          </p>

          <h2 className="text-2xl font-bold text-warm-gray-900 dark:text-dark-warm-900 !mt-8">2. Use of Services</h2>
          <p>
            You may use our services only in compliance with these Terms and all applicable laws. We grant you a limited, non-exclusive, non-transferable, revocable license to use the services.
          </p>
          
          <h2 className="text-2xl font-bold text-warm-gray-900 dark:text-dark-warm-900 !mt-8">3. Accounts</h2>
          <p>
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.
          </p>

          <h2 className="text-2xl font-bold text-warm-gray-900 dark:text-dark-warm-900 !mt-8">4. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2 className="text-2xl font-bold text-warm-gray-900 dark:text-dark-warm-900 !mt-8">5. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of Kenya, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-bold text-warm-gray-900 dark:text-dark-warm-900 !mt-8">6. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at info@pulsify.bunisystems.com.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
