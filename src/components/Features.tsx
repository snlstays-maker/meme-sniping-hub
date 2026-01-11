import { Target, Zap, TrendingUp, MessageSquare } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Laser-Focused Messaging",
    description: "Every word is crafted to resonate with your ideal customer. No wasted syllables.",
  },
  {
    icon: Zap,
    title: "Fast Turnaround",
    description: "Get high-converting copy delivered in days, not weeks. Speed without sacrifice.",
  },
  {
    icon: TrendingUp,
    title: "Conversion-Driven",
    description: "Copy backed by data and psychology. We write to convert, not to impress.",
  },
  {
    icon: MessageSquare,
    title: "Brand Voice Mastery",
    description: "We capture your unique voice and amplify it. Your copy, only sharper.",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why <span className="text-gradient">Sniper Copy</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We don't spray and pray. Every piece of copy is strategically crafted to hit your goals.
          </p>
        </div>
        
        {/* Features grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-gradient-card border border-border hover:border-primary/50 transition-all duration-300 shadow-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
