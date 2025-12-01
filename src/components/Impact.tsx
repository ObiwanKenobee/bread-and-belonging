import { Card } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Leaf } from "lucide-react";

const metrics = [
  {
    icon: TrendingUp,
    value: "1M+",
    label: "Meals Delivered Annually",
    description: "Nutritious meals reaching families in need",
    trend: "+127%",
  },
  {
    icon: Users,
    value: "2,000",
    label: "Local Jobs Created",
    description: "Sustainable employment opportunities",
    trend: "+85%",
  },
  {
    icon: DollarSign,
    value: "60%",
    label: "Women-Led Earnings",
    description: "Economic empowerment for women",
    trend: "+43%",
  },
  {
    icon: Leaf,
    value: "40%",
    label: "Food Waste Reduction",
    description: "Surplus converted to resources",
    trend: "+52%",
  },
];

const Impact = () => {
  return (
    <section className="py-24 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Measurable Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every transaction, every meal, every job - tracked transparently and auditably
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card 
                key={index}
                className="p-6 bg-card/80 backdrop-blur-sm border-2 hover:shadow-elevated transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-secondary px-2 py-1 bg-secondary/10 rounded-full">
                    {metric.trend}
                  </span>
                </div>
                
                <div className="text-3xl font-bold bg-gradient-warm bg-clip-text text-transparent mb-1">
                  {metric.value}
                </div>
                <div className="text-sm font-semibold text-foreground mb-2">
                  {metric.label}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Card className="inline-block p-6 bg-card border-2">
            <p className="text-sm text-muted-foreground mb-2">24-Month Pilot Target</p>
            <p className="text-2xl font-bold text-foreground">
              20% increase in health & schooling outcomes
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Impact;