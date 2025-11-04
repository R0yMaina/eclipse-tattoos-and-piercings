import { MessageCircle, PenTool, Sparkles, Heart } from 'lucide-react';

const steps = [
  {
    number: "1",
    title: "Consultation",
    description: "We discuss your idea, placement, sizing, and timeline—online or in person.",
    icon: MessageCircle
  },
  {
    number: "2",
    title: "Design",
    description: "Your artist develops a custom design or curates flash aligned to your vision.",
    icon: PenTool
  },
  {
    number: "3",
    title: "Session",
    description: "Comfort, precision, and pacing that respects your body and skin.",
    icon: Sparkles
  },
  {
    number: "4",
    title: "Aftercare",
    description: "Clear instructions and follow-ups to ensure a clean, beautiful heal.",
    icon: Heart
  }
];

export const ProcessTimeline = () => {
  return (
    <section className="py-16 bg-secondary/20">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
            Our Process
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From first contact to final heal—every step designed for your comfort and confidence.
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-primary/20" 
            style={{ width: 'calc(100% - 120px)', marginLeft: '60px' }} 
          />

          <div className="grid md:grid-cols-4 gap-8 md:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Step Number Circle */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center gold-glow">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold font-heading">
                        {step.number}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="glass-panel glass-highlight rounded-[20px] p-6 text-center">
                    <h3 className="font-heading font-semibold text-xl mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
