import { Crosshair } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-border bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Crosshair className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Sniper Copy</span>
          </div>
          
          {/* Links */}
          <nav className="flex items-center gap-8">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Work
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Services
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>
          
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2025 Sniper Copy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
