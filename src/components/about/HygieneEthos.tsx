import { CheckCircle2, Award } from 'lucide-react';

const hygieneStandards = [
  "Single-use needles and barrier protection for every client.",
  "Medical-grade sterilization protocols; ultrasonic cleaning and autoclave usage.",
  "Regular spore testing with documented logs.",
  "Licensed, inspected studio; compliance with local and state regulations."
];

const certifications = [
  "Bloodborne Pathogens Certified",
  "CPR/First Aid Certified",
  "Aseptic Technique Trained"
];

export const HygieneEthos = () => {
  return (
    <section className="py-16 bg-secondary/20">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
            Hygiene & Sterility
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your safety is non-negotiable. We maintain medical-grade standards in every session.
          </p>
        </div>

        <div className="glass-panel glass-highlight rounded-[28px] p-8 md:p-12">
          <div className="space-y-8">
            {/* Standards */}
            <div className="space-y-4">
              {hygieneStandards.map((standard, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-foreground leading-relaxed">{standard}</p>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-primary" />
                <h3 className="font-heading font-semibold text-lg">Team Certifications</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {certifications.map((cert, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 rounded-full border border-primary/30 text-sm text-foreground bg-primary/5"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
