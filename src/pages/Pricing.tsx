import { PricingHero } from '@/components/pricing/PricingHero';
import { PricingStickyNav } from '@/components/pricing/PricingStickyNav';
import { OverviewCards } from '@/components/pricing/OverviewCards';
import { TierTable } from '@/components/pricing/TierTable';
import { TattooExamples } from '@/components/pricing/TattooExamples';
import { PiercingFees } from '@/components/pricing/PiercingFees';
import { JewelryRanges } from '@/components/pricing/JewelryRanges';
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
      <OverviewCards />
      <TierTable />
      <TattooExamples />
      <PiercingFees />
      <JewelryRanges />
      <PackagesSection />
      <EstimatorsSection />
      <PoliciesSection />
      <PricingFAQ />
      <PricingCTA />
    </div>
  );
};

export default Pricing;
