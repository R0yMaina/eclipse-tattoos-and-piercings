import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Avery",
    rating: 5,
    quote: "Immaculate studio, gentle artists, and art that gets compliments daily."
  },
  {
    name: "Jordan",
    rating: 5,
    quote: "From consult to aftercare—thoughtful, professional, and beautifully done."
  },
  {
    name: "Mina",
    rating: 5,
    quote: "Best piercing experience I've had. Clean, calm, and precise."
  },
  {
    name: "Taylor",
    rating: 5,
    quote: "Nova's attention to detail is unmatched. My fine line piece healed perfectly."
  },
  {
    name: "Sam",
    rating: 5,
    quote: "The consultation process made me feel heard and confident about my choice."
  },
  {
    name: "Alex",
    rating: 5,
    quote: "Professional, welcoming, and incredibly talented team. Highly recommend."
  }
];

export const Testimonials = () => {
  return (
    <section className="py-16 bg-secondary/20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
            What Clients Say
          </h2>
          <p className="text-muted-foreground">
            Hear from the Eclipse community
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="glass-panel glass-highlight rounded-[20px] p-6 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="h-12 w-12 text-primary" />
              </div>

              <div className="relative space-y-4">
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground leading-relaxed italic">
                  "{testimonial.quote}"
                </p>

                {/* Name */}
                <p className="text-sm font-semibold text-muted-foreground">
                  — {testimonial.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
