import { useEffect, useRef } from 'react';
import { TattooEstimator } from './TattooEstimator';
import { PiercingEstimator } from './PiercingEstimator';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const EstimatorsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.children;
    gsap.from(cards, {
      y: 30,
      opacity: 0,
      scale: 0.98,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%'
      }
    });
  }, []);

  return (
    <section id="estimators" ref={sectionRef} className="py-24 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Price Estimators
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get a quick estimate to plan your budget. Final quotes follow a consultation.
          </p>
        </div>

        <div ref={cardsRef} className="grid lg:grid-cols-2 gap-8">
          <TattooEstimator />
          <PiercingEstimator />
        </div>
      </div>
    </section>
  );
};
