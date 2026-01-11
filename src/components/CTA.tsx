import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.15)_0%,transparent_70%)]" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Ready to make every word count?
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Let's create copy that converts. Book a free strategy call and see how precision copywriting can transform your results.
        </p>
        <Button variant="hero" size="xl">
          Book Your Free Call
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </section>
  );
};

export default CTA;
