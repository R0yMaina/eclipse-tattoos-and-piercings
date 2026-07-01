import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <Link to="/" className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <img src="/eclipselogo.png" alt="Eclipse" className="w-8 h-8 object-contain" />
              <span className="text-xl font-heading font-bold text-foreground">Eclipse</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Premium tattoo and piercing studio. Perfection is the aim.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Eclipse Tattoo & Piercings. All rights reserved.
            </p>
            <Link 
              to="/admin" 
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mt-2 opacity-50 hover:opacity-100"
            >
              <Shield className="w-3 h-3" />
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
