const steps = [
  {
    number: "01",
    title: "Discovery",
    description: "We dive deep into your brand, audience, and goals. Understanding comes first.",
  },
  {
    number: "02",
    title: "Strategy",
    description: "We map out the messaging framework that will drive your audience to action.",
  },
  {
    number: "03",
    title: "Creation",
    description: "Every word is written with precision. Multiple rounds of refinement included.",
  },
  {
    number: "04",
    title: "Launch",
    description: "Your copy goes live. We monitor results and optimize for maximum impact.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A proven process that delivers results every time.
          </p>
        </div>
        
        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px bg-border" />
              )}
              
              <div className="relative z-10">
                <span className="text-6xl font-bold text-primary/20 block mb-4">
                  {step.number}
                </span>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
