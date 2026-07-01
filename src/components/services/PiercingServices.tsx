import { useEffect, useRef } from 'react';
import { piercingServices } from '@/data/services';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Info } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const PiercingServices = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;

    const items = listRef.current.querySelectorAll('.price-item');
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
    <section id="piercings" ref={sectionRef} className="py-24 px-4 bg-background/50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/40 rounded-full blur-[120px]" />
      </div>

      <div className="container max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Body Piercing Price List
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-6">
            Our Piercing Services
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Aseptic technique, jewelry-grade titanium, and precise placement for every anatomy.
          </p>
        </div>

        {/* Organized Pricing Grid */}
        <div className="glass-panel-elevated rounded-[32px] overflow-hidden border-primary/20 shadow-2xl p-6 md:p-12 relative">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          
          <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
            {piercingServices.map((service, index) => (
              <div 
                key={index} 
                className="price-item flex items-center justify-between py-3 border-b border-primary/10 hover:bg-primary/5 transition-colors duration-300 px-3 rounded-lg group"
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

          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-primary/20">
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
    </section>
  );
};
