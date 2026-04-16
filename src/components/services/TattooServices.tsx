import { useEffect, useRef } from 'react';
import { tattooServices, piercingServices } from '@/data/services';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Info, DollarSign } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const TattooServices = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pricingRef.current) return;

    const items = pricingRef.current.querySelectorAll('.price-row');
    gsap.from(items, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 70%'
      }
    });
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="py-16 md:py-24 px-4 bg-background/50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/40 rounded-full blur-[120px]" />
      </div>

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Tattoo Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
            Tailored designs and precise execution—built to age beautifully.
          </p>
        </div>

        <div ref={pricingRef}>
          {/* Piercing Pricing Section */}
          <div id="piercings" className="glass-panel-elevated rounded-[32px] border-primary/20 shadow-2xl p-6 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-semibold">Piercing Price List</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
              {piercingServices.map((service, index) => (
                <div 
                  key={index} 
                  className="price-row flex items-center justify-between py-3 border-b border-primary/10 hover:bg-primary/5 transition-colors duration-300 px-3 rounded-lg group"
                >
                  <div className="flex flex-col">
                    <span className="font-heading font-medium text-foreground group-hover:text-primary transition-colors">
                      {service.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-tighter">
                      Professional Grade
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/40 font-light">KES</span>
                    <span className="text-lg font-heading font-bold text-primary">
                      {service.price_from_kes?.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-primary/10">
              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background/40 px-4 py-2 rounded-full border border-primary/10">
                <Info className="w-4 h-4 text-primary" />
                <span>Prices include standard initial jewelry. Special pieces available separately.</span>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-xs text-muted-foreground mb-1">Inquiries & Bookings</p>
                <p className="text-primary font-bold font-heading">0769138198 / 0705025961</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};