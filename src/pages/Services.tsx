import { ServicesHero } from '@/components/services/ServicesHero';
import { StickySubnav } from '@/components/services/StickySubnav';
import { TattooServices } from '@/components/services/TattooServices';
import { PiercingServices } from '@/components/services/PiercingServices';
import { JewelryAftercare } from '@/components/services/JewelryAftercare';
import { PricingSection } from '@/components/services/PricingSection';
import { ProcessTimeline } from '@/components/services/ProcessTimeline';
import { ServicesFAQ } from '@/components/services/ServicesFAQ';
import { ServicesCTA } from '@/components/services/ServicesCTA';
import { StudioGallery } from '@/components/about/StudioGallery';

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <ServicesHero />
      <StickySubnav />
      <TattooServices />
      <PiercingServices />
      <JewelryAftercare />
      <StudioGallery />
      <PricingSection />
      <ProcessTimeline />
      <ServicesFAQ />
      <ServicesCTA />
    </div>
  );
};

export default Services;
