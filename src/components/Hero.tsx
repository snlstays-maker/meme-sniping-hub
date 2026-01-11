import { Button } from "@/components/ui/button";
import { Crosshair, ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden bg-gradient-hero">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Gradient orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary/50 mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <Crosshair className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Precision copywriting that converts</span>
        </div>
        
        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Words that hit
          <br />
          <span className="text-gradient">their target</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          Sharp, targeted copy that turns browsers into buyers. 
          No fluff. No filler. Just results.
        </p>
        
        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <Button variant="hero" size="xl">
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg">
            See Our Work
          </Button>
        </div>
        
        {/* Social proof */}
        <div className="mt-16 pt-8 border-t border-border animate-fade-up" style={{ animationDelay: "0.5s" }}>
          <p className="text-sm text-muted-foreground mb-4">Trusted by high-growth brands</p>
          <div className="flex items-center justify-center gap-8 opacity-50">
            <span className="text-xl font-bold">ACME</span>
            <span className="text-xl font-bold">APEX</span>
            <span className="text-xl font-bold">NOVA</span>
            <span className="text-xl font-bold hidden sm:block">ZENITH</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
