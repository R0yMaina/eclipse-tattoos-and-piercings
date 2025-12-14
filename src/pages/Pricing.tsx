import { PricingHero } from '@/components/pricing/PricingHero';
import { PricingStickyNav } from '@/components/pricing/PricingStickyNav';
import { PiercingFees } from '@/components/pricing/PiercingFees';
import { PackagesSection } from '@/components/pricing/PackagesSection';
import { EstimatorsSection } from '@/components/pricing/EstimatorsSection';
import { PoliciesSection } from '@/components/pricing/PoliciesSection';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { PricingCTA } from '@/components/pricing/PricingCTA';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <PricingHero />
      <PricingStickyNav />
      <PiercingFees />
      <PackagesSection />
      <EstimatorsSection />
      <PoliciesSection />
      <PricingFAQ />
      <PricingCTA />
    </div>
  );
};

export default Pricing;
