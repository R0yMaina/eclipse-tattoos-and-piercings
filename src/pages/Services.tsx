import { ServicesHero } from '@/components/services/ServicesHero';
import { StickySubnav } from '@/components/services/StickySubnav';
import { TattooServices } from '@/components/services/TattooServices';
import { PiercingServices } from '@/components/services/PiercingServices';
import { JewelryAftercare } from '@/components/services/JewelryAftercare';
import { PricingSection } from '@/components/services/PricingSection';
import { ProcessTimeline } from '@/components/services/ProcessTimeline';
import { ServicesFAQ } from '@/components/services/ServicesFAQ';
import { ServicesCTA } from '@/components/services/ServicesCTA';

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <ServicesHero />
      <StickySubnav />
      <TattooServices />
      <PiercingServices />
      <JewelryAftercare />
      <PricingSection />
      <ProcessTimeline />
      <ServicesFAQ />
      <ServicesCTA />
    </div>
  );
};

export default Services;
