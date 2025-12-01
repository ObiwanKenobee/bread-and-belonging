import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, HandHeart, TrendingUp } from "lucide-react";

const userTypes = [
  {
    icon: Sprout,
    title: "Producers",
    subtitle: "Farmers, Bakers, Makers",
    description: "Turn surplus into income. List your excess produce, baked goods, or services. Earn Dignity Credits and build sustainable local markets.",
    benefits: [
      "No waste - every item finds a home",
      "Fair pricing through community validation",
      "Access to micro-work opportunities",
    ],
    cta: "Register as Producer",
    color: "secondary",
  },
  {
    icon: HandHeart,
    title: "Beneficiaries",
    subtitle: "Community Members in Need",
    description: "Access food, care, and services with dignity. Use your Community Trust ID to connect with local resources and build economic resilience.",
    benefits: [
      "Privacy-respecting access",
      "Earn credits through participation",
      "Path to economic stability",
    ],
    cta: "Find Resources",
    color: "primary",
  },
  {
    icon: TrendingUp,
    title: "Donors & Partners",
    subtitle: "Impact Funders, NGOs, Governments",
    description: "Fund measurable outcomes with full transparency. Track every meal served, job created, and life improved through open impact dashboards.",
    benefits: [
      "Outcome-based funding",
      "Real-time impact tracking",
      "Auditable distribution",
    ],
    cta: "View Impact API",
    color: "accent",
  },
];

const UserTypes = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Built for Everyone
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're producing, receiving, or funding - there's a place for you in the network
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {userTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <Card 
                key={index}
                className="p-8 hover:shadow-elevated transition-all duration-300 border-2 bg-card flex flex-col"
              >
                <div className={`w-16 h-16 rounded-2xl bg-${type.color}/10 flex items-center justify-center mb-6`}>
                  <Icon className={`w-8 h-8 text-${type.color}`} />
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {type.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {type.subtitle}
                </p>
                <p className="text-muted-foreground mb-6">
                  {type.description}
                </p>

                <div className="space-y-2 mb-8 flex-grow">
                  {type.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${type.color} mt-2`} />
                      <p className="text-sm text-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full ${type.color === 'primary' ? '' : 'bg-' + type.color + ' hover:bg-' + type.color + '/90'}`}
                  variant={type.color === 'primary' ? 'default' : 'secondary'}
                >
                  {type.cta}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UserTypes;