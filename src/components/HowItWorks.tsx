import { Card } from "@/components/ui/card";
import { Users, Database, Brain, Coins, Heart, Shield } from "lucide-react";

const steps = [
  {
    icon: Users,
    title: "Community Trust ID",
    description: "Privacy-respecting identity system that includes everyone - from displaced persons to informal workers.",
    gradient: "from-primary to-primary/80",
  },
  {
    icon: Database,
    title: "Local Availability Ledger",
    description: "Track local inventories of food, medicine, services - with full transparency and provenance.",
    gradient: "from-secondary to-secondary/80",
  },
  {
    icon: Brain,
    title: "Match & Multiply AI",
    description: "Ethical AI matches surplus to need, optimizes routing, and predicts demand - all explainable.",
    gradient: "from-accent to-accent/80",
  },
  {
    icon: Coins,
    title: "Dignity Credit",
    description: "Community-issued credits earned for work and goods, backed by measurable outcomes.",
    gradient: "from-primary to-accent",
  },
  {
    icon: Heart,
    title: "Care Exchange",
    description: "Platform for paid care and education shifts, prioritizing women and marginalized groups.",
    gradient: "from-secondary to-primary",
  },
  {
    icon: Shield,
    title: "Good Samaritan Governance",
    description: "Multi-stakeholder councils set rules, audit distribution, and ensure accountability.",
    gradient: "from-accent to-secondary",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Six integrated components that transform local abundance into sustainable livelihoods
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index}
                className="p-6 hover:shadow-elevated transition-all duration-300 border-2 hover:scale-105 bg-card"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-4 shadow-soft`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;