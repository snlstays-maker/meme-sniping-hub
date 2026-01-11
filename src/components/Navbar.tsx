import { Button } from "@/components/ui/button";
import { Crosshair } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between bg-background/80 backdrop-blur-lg rounded-full border border-border px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-primary" />
          <span className="text-lg font-bold">Sniper Copy</span>
        </div>
        
        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Services
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Work
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
        </div>
        
        {/* CTA */}
        <Button size="sm">
          Get in Touch
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
