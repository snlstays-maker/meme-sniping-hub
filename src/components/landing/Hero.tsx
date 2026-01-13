import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, TrendingUp, Shield } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--background))_70%)]" />
      </div>

      <div className="container mx-auto px-4 text-center">
        {/* Badge */}
        <Badge 
          variant="outline" 
          className="mb-6 px-4 py-2 text-sm bg-primary/10 border-primary/30 text-primary animate-fade-in"
        >
          <Zap className="w-3.5 h-3.5 mr-2" />
          Precision Trading, Automated
        </Badge>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
          Snipe Opportunities
          <br />
          <span className="text-primary">Before Anyone Else</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in delay-100">
          Automate your trading strategy with lightning-fast execution. 
          Monitor tokens, set triggers, and let the bot do the heavy lifting.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in delay-200">
          <Link to="/auth">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 shadow-lg shadow-primary/25">
              Start Trading Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              See How It Works
            </Button>
          </a>
        </div>

        {/* Stats/Social Proof */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in delay-300">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-primary mr-2" />
              <span className="text-2xl md:text-3xl font-bold">$2.4M+</span>
            </div>
            <p className="text-sm text-muted-foreground">Trading Volume</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-primary mr-2" />
              <span className="text-2xl md:text-3xl font-bold">50ms</span>
            </div>
            <p className="text-sm text-muted-foreground">Avg. Execution</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-primary mr-2" />
              <span className="text-2xl md:text-3xl font-bold">1,200+</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Traders</p>
          </div>
        </div>
      </div>
    </section>
  );
}
