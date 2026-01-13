import { Bot, Zap, Shield, BarChart3, Clock, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Execution",
    description: "Execute trades in milliseconds with our optimized infrastructure. Never miss an opportunity.",
  },
  {
    icon: Bot,
    title: "Automated Sniping",
    description: "Set your parameters and let the bot monitor and execute trades 24/7 without manual intervention.",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Built-in stop-loss, take-profit, and position sizing to protect your portfolio.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track performance, analyze trends, and optimize your strategy with detailed metrics.",
  },
  {
    icon: Clock,
    title: "24/7 Monitoring",
    description: "Continuous market surveillance across multiple tokens and trading pairs.",
  },
  {
    icon: Wallet,
    title: "Wallet Integration",
    description: "Seamlessly connect your Phantom or other Solana wallets for secure trading.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to <span className="text-primary">Win</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful tools designed for serious traders. Get the edge you need in today's fast-moving markets.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title}
                className="group bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
