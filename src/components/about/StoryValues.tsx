import { Sparkles, Shield, Heart, Star } from 'lucide-react';

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
    <section className="py-16">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Story */}
          <div className="glass-panel glass-highlight rounded-[28px] p-8 md:p-12">
            <div className="space-y-6">
              <div>
                <span className="text-primary text-sm font-semibold tracking-wider uppercase">Est. 2017</span>
                <h2 className="text-3xl md:text-4xl font-heading font-semibold mt-2 mb-4">Our Foundation</h2>
              </div>
              
              <p className="text-foreground leading-relaxed">
                Eclipse was founded to elevate tattoo and piercing into an uncompromising studio experience—precision artistry, intentional design, and absolute respect for the body.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex gap-3">
                  <div className="w-1.5 h-full bg-primary/30 rounded-full flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    We design with intention. Every line, every placement, and every session is tailored to you.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-1.5 h-full bg-primary/30 rounded-full flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    We prioritize consent and care. You should feel informed, comfortable, and confident at every step.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-1.5 h-full bg-primary/30 rounded-full flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    We build work that outlives trends. The Eclipse standard is timeless, clean, and impeccably executed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  className="glass-panel glass-highlight rounded-[20px] p-6 transition-smooth hover:scale-[1.02]"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 gold-glow">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
