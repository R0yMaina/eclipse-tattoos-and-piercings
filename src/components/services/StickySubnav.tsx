import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Tattoos", href: "#tattoos" },
  { label: "Piercings", href: "#piercings" },
  { label: "Jewelry & Aftercare", href: "#jewelry-aftercare" },
  { label: "Pricing", href: "#pricing" },
  { label: "Process", href: "#process" },
  { label: "FAQ", href: "#faq" }
];

export const StickySubnav = () => {
  const [activeSection, setActiveSection] = useState('tattoos');
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 600);

      const sections = navItems.map(item => item.href.substring(1));
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const id = href.substring(1);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isSticky ? 'glass-panel-elevated shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center gap-2 md:gap-6 py-4 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.substring(1);
            return (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className={`relative whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
