import { Wallet, Settings, Zap, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    step: "01",
    title: "Connect Wallet",
    description: "Link your Phantom or compatible Solana wallet securely.",
  },
  {
    icon: Settings,
    step: "02",
    title: "Configure Strategy",
    description: "Set your trading parameters, risk limits, and target tokens.",
  },
  {
    icon: Zap,
    step: "03",
    title: "Activate Bot",
    description: "Enable automated trading and let the bot monitor the market 24/7.",
  },
  {
    icon: TrendingUp,
    step: "04",
    title: "Track & Profit",
    description: "Monitor your positions and watch your portfolio grow.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Trading in <span className="text-primary">4 Steps</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get up and running in minutes. No complex setup required.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.step}
                className="relative text-center group"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-full h-px bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                
                {/* Step Number */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                  <div className="absolute inset-2 rounded-full bg-background border border-primary/30 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
