import { Sparkles, Shield, Heart, Star } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import shop1 from '@/assets/gallery/shop-1.jpg';
import shop2 from '@/assets/gallery/shop-2.jpg';
import shop3 from '@/assets/gallery/shop-3.jpg';

const values = [
  {
    icon: Sparkles,
    title: "Craftsmanship",
    description: "Meticulous linework, thoughtful composition, and expert execution."
  },
  {
    icon: Shield,
    title: "Cleanliness",
    description: "Medical-grade sterilization, single-use needles, and spotless setups."
  },
  {
    icon: Heart,
    title: "Consent",
    description: "Transparent pricing, clear expectations, and client-first decisions."
  },
  {
    icon: Star,
    title: "Care",
    description: "Detailed aftercare, ongoing support, and respect for your time and body."
  }
];

export const StoryValues = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Est. 2019</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mt-3 mb-6">Our Foundation</h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>

        {/* Newspaper Layout Story */}
        <div className="space-y-12 md:space-y-24 mb-24">

          {/* Section 1: Image Left, Text Right */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 translate-x-3 translate-y-3 rounded-[24px] blur-sm -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500" />
              <OptimizedImage
                src={shop1}
                alt="Eclipse Studio Entrance"
                className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-xl"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-heading font-semibold text-primary/90">A Creative Spark</h3>
              <p className="text-lg text-foreground/80 leading-relaxed font-light first-letter:text-5xl first-letter:font-heading first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                What began in 2019 as a small creative spark has grown into one of Kenya’s most respected tattoo and piercing studios. Eclipse Tattoos & Piercings was founded on a simple belief: What began in 2019 as a small creative spark has grown into one of Kenya's most respected tattoo and piercing studios. Eclipse Tattoos & Piercings was founded on a simple belief: perfection is thee aim — not as an absolute, but as a standard that pushes every artist to grow, refine, and evolve. — not as an absolute, but as a standard that pushes every artist to grow, refine, and evolve.
              </p>
            </div>
          </div>

          {/* Section 2: Text Left, Image Right */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <h3 className="text-2xl md:text-3xl font-heading font-semibold text-primary/90">Building Trust</h3>
              <p className="text-lg text-foreground/80 leading-relaxed font-light">
                In the early days, Eclipse was a modest space with big dreams. A handful of passionate artists, a few worn-in chairs, and a commitment to craft drove every session. We weren’t just creating tattoos and piercings — we were building trust with every client who walked through our doors.
              </p>
            </div>
            <div className="relative group order-1 md:order-2">
              <div className="absolute inset-0 bg-primary/20 -translate-x-3 translate-y-3 rounded-[24px] blur-sm -z-10 group-hover:-translate-x-2 group-hover:translate-y-2 transition-transform duration-500" />
              <OptimizedImage
                src={shop2}
                alt="Early Days at Eclipse"
                className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-xl"
              />
            </div>
          </div>

          {/* Section 3: Full Width Image & Text */}
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="relative group max-w-2xl mx-auto mb-12">
              <div className="absolute inset-0 bg-primary/20 translate-y-4 rounded-[24px] blur-md -z-10 group-hover:translate-y-3 transition-transform duration-500" />
              <OptimizedImage
                src={shop3}
                alt="Eclipse Studio Interior today"
                className="w-full aspect-video object-cover rounded-[24px] shadow-2xl"
              />
            </div>

            <h3 className="text-2xl md:text-3xl font-heading font-semibold text-primary/90">More Than Ink</h3>
            <div className="columns-1 md:columns-2 gap-8 text-left space-y-4">
              <p className="text-lg text-foreground/80 leading-relaxed font-light">
                From the beginning, we believed that body art is more than ink and metal. It’s personal history, identity, and expression. That belief shaped everything we did — from how we welcomed our first clients to how we perfected every line, curve, and detail.
              </p>
              <p className="text-lg text-foreground/80 leading-relaxed font-light">
                Today, that same spirit drives us forward. Our studio is a sanctuary for self-expression, where safety meets style and tradition meets innovation. Every session is a collaboration, honoring the trust you place in our hands.
              </p>
            </div>
          </div>

        </div>

        {/* Values Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-border/40">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="glass-panel glass-highlight rounded-[20px] p-6 transition-smooth hover:scale-[1.05] hover:border-primary/30 group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 gold-glow group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
