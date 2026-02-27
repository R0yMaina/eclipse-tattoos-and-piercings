import { lazy, Suspense } from 'react';
import { ServicesHero } from '@/components/services/ServicesHero';
import { StickySubnav } from '@/components/services/StickySubnav';
import { PiercingServices } from '@/components/services/PiercingServices';
import { JewelryAftercare } from '@/components/services/JewelryAftercare';
import { ProcessTimeline } from '@/components/services/ProcessTimeline';
import { ServicesFAQ } from '@/components/services/ServicesFAQ';
import { ServicesCTA } from '@/components/services/ServicesCTA';


const Scene3DBroad = lazy(() => import('@/components/home/Scene3DBroad'));

const Services = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <Suspense fallback={null}>
        <Scene3DBroad />
      </Suspense>
      <div className="relative z-10">
        <ServicesHero />
        <StickySubnav />
        <PiercingServices />
        <JewelryAftercare />
        
        <ProcessTimeline />
        <ServicesFAQ />
        <ServicesCTA />
      </div>
    </div>
  );
};

export default Services;
