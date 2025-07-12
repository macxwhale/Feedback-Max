
import React from 'react';
import { ModernHeader } from './ModernHeader';
import { ModernHero } from './ModernHero';
import { HowItWorks } from './HowItWorks';
import { DashboardPreview } from './DashboardPreview';
import { Features } from './Features';
import { Pricing } from './Pricing';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';
import { TrustBadges } from './TrustBadges';
import { FAQ } from './FAQ';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-background transition-colors duration-300">
      <ModernHeader />
      <ModernHero />
      <DashboardPreview />
      <TrustBadges />
      <HowItWorks />
      <Features />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
};
