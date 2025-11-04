import { Award, Newspaper } from 'lucide-react';

const awards = [
  "Best Fine Line Studio — City Weekly (2023)",
  "Top Piercing Experience — Culture Mag (2024)"
];

const pressOutlets = [
  "Culture Magazine",
  "Inked Magazine",
  "City Weekly",
  "Tattoo Life"
];

export const AwardsPress = () => {
  return (
    <section className="py-16">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="glass-panel glass-highlight rounded-[28px] p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Awards */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-semibold">Awards</h2>
              </div>
              <div className="space-y-4">
                {awards.map((award, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-[16px] bg-primary/5 border border-primary/20"
                  >
                    <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground leading-relaxed">{award}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Press */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Newspaper className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-semibold">Featured In</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {pressOutlets.map((outlet, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-[16px] bg-muted/10 border border-border flex items-center justify-center text-center transition-smooth hover:border-primary/30 hover:bg-primary/5"
                  >
                    <p className="text-sm font-semibold text-muted-foreground">{outlet}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
