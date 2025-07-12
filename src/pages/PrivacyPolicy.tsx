
import React from 'react';
import { Footer } from '@/components/landing/Footer';
import { ModernHeader } from '@/components/landing/ModernHeader';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-white dark:bg-background">
      <ModernHeader />
      <main className="max-w-4xl mx-auto pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-warm-gray-900 dark:text-dark-warm-900 mb-8">Privacy Policy</h1>
        <div className="prose dark:prose-invert max-w-none text-warm-gray-600 dark:text-dark-warm-600 space-y-4">
          <p>Last updated: June 15, 2025</p>

          <h2 className="text-2xl font-bold text-warm-gray-900 dark:text-dark-warm-900 !mt-8">1. Introduction</h2>
          <p>
            Welcome to Pulsify. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
          </p>

          <h2 className="text-2xl font-bold text-warm-gray-900 dark:text-dark-warm-900 !mt-8">2. Information We Collect</h2>
          <p>
            We may collect personal identification information (Name, email address, phone number, etc.) and non-personal information (browser type, etc.) from you in a variety of ways.
          </p>

          <h2 className="text-2xl font-bold text-warm-gray-900 dark:text-dark-warm-900 !mt-8">3. How We Use Your Information</h2>
          <p>
            We use the information we collect to operate and maintain our services, send you marketing communications, respond to your comments and questions, and provide you with user support.
          </p>
          
          <h2 className="text-2xl font-bold text-warm-gray-900 dark:text-dark-warm-900 !mt-8">4. Data Security</h2>
          <p>
            We take data security very seriously. Our platform is SOC 2 compliant, and all data is encrypted end-to-end. We follow industry best practices to ensure your data is safe and private. We implement a variety of security measures to maintain the safety of your personal information.
          </p>

          <h2 className="text-2xl font-bold text-warm-gray-900 dark:text-dark-warm-900 !mt-8">5. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </p>
          
          <h2 className="text-2xl font-bold text-warm-gray-900 dark:text-dark-warm-900 !mt-8">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at info@pulsify.bunisystems.com.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
