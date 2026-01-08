import { useEffect, useRef } from 'react';
import { piercingServices } from '@/data/services';
import { OptimizedImage } from '@/components/ui/optimized-image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import piercingMenuImg from '@/assets/piercing-menu.jpg';

gsap.registerPlugin(ScrollTrigger);

export const PiercingServices = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.children;
    gsap.from(cards, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.05,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%'
      }
    });
  }, []);

  return (
    <section id="piercings" ref={sectionRef} className="py-24 px-4 bg-background/50">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Piercing Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aseptic technique, premium jewelry, and precise placement.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Piercing Menu Image */}
          <div className="glass-panel-elevated rounded-[20px] overflow-hidden">
            <OptimizedImage
              src={piercingMenuImg}
              alt="Eclipse Tattoo Studio Piercing Price Menu"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Piercing List */}
          <div ref={cardsRef} className="grid grid-cols-2 gap-3">
            {piercingServices.map((service, index) => (
              <div 
                key={index}
                className="glass-panel rounded-xl p-4 hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-heading font-semibold text-foreground">
                    {service.title}
                  </h3>
                  <span className="text-primary font-bold text-sm whitespace-nowrap">
                    KES {service.price_from_kes?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel-elevated rounded-[20px] p-6 max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            <strong className="text-foreground">18+</strong> for most piercings. Select piercings available for <strong className="text-foreground">16+</strong> with parent/guardian and valid ID.
            All prices include jewelry.
          </p>
          <p className="text-primary font-semibold mt-3">
            Call/txt: 0769138198 / 0705025961
          </p>
        </div>
      </div>
    </section>
  );
};
