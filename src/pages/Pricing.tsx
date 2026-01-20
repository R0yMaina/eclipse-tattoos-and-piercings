import { lazy, Suspense } from 'react';
import { PricingHero } from '@/components/pricing/PricingHero';
import { PricingStickyNav } from '@/components/pricing/PricingStickyNav';
import { TattooPricing } from '@/components/pricing/TattooPricing';
import { PiercingFees } from '@/components/pricing/PiercingFees';
import { PackagesSection } from '@/components/pricing/PackagesSection';
import { PoliciesSection } from '@/components/pricing/PoliciesSection';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { PricingCTA } from '@/components/pricing/PricingCTA';

const Scene3DBroad = lazy(() => import('@/components/home/Scene3DBroad'));

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <Suspense fallback={null}>
        <Scene3DBroad />
      </Suspense>
      <div className="relative z-10">
        <PricingHero />
        <PricingStickyNav />
        <TattooPricing />
        <PiercingFees />
        <PackagesSection />

        <PoliciesSection />
        <PricingFAQ />
        <PricingCTA />
      </div>
    </div>
  );
};

export default Pricing;
