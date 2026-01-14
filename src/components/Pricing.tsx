import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Heart, TrendingUp, Building2, Users, Sparkles, Target, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const partnerTiers = [
  {
    name: "Community",
    price: "Free",
    period: "forever",
    description: "For local producers, farmers, and beneficiaries",
    features: [
      "Trust ID verification",
      "Marketplace access",
      "AI-powered matching",
      "Dignity Credit earnings",
      "Basic impact tracking",
      "Community support",
    ],
    cta: "Join Community",
    highlighted: false,
    icon: Users,
  },
  {
    name: "Impact Partner",
    price: "$499",
    period: "/month",
    description: "For NGOs, food banks, and local organizations",
    features: [
      "Everything in Community",
      "Partner analytics dashboard",
      "Custom impact reports",
      "API access",
      "Priority matching",
      "Dedicated support",
      "Outcome tracking",
    ],
    cta: "Become a Partner",
    highlighted: true,
    icon: Target,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For governments, UN agencies, and major donors",
    features: [
      "Everything in Impact Partner",
      "White-label deployment",
      "Multi-region support",
      "Compliance & audit trails",
      "Social bond integration",
      "Dedicated success manager",
      "Custom integrations",
      "SLA guarantees",
    ],
    cta: "Contact Sales",
    highlighted: false,
    icon: Building2,
  },
];

const outcomeMetrics = [
  {
    metric: "Per Meal Delivered",
    cost: "$0.50",
    description: "Fund nutritious meals reaching families in need",
    icon: Heart,
  },
  {
    metric: "Per Job Created",
    cost: "$25",
    description: "Support sustainable local employment",
    icon: Users,
  },
  {
    metric: "Per Ton Waste Reduced",
    cost: "$15",
    description: "Convert surplus to resources, not landfill",
    icon: Leaf,
  },
  {
    metric: "Per Family Supported",
    cost: "$100",
    description: "Comprehensive monthly family support",
    icon: Sparkles,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Sustainable Model
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Invest in Impact, Not Overhead
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our freemium model ensures everyone can participate. Partners and donors fuel the platform 
            while producers and beneficiaries access it freely.
          </p>
        </div>

        {/* Partner Tiers */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
          {partnerTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card 
                key={tier.name}
                className={`relative p-8 transition-all duration-300 hover:shadow-elevated ${
                  tier.highlighted 
                    ? 'border-2 border-primary bg-gradient-to-b from-primary/5 to-transparent scale-105' 
                    : 'border-2 hover:border-primary/50'
                }`}
              >
                {tier.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    {tier.badge}
                  </Badge>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    tier.highlighted ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <Icon className={`w-6 h-6 ${tier.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{tier.name}</h3>
                </div>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                  <span className="text-muted-foreground ml-1">{tier.period}</span>
                </div>
                
                <p className="text-muted-foreground mb-6">{tier.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  asChild
                  className={`w-full ${
                    tier.highlighted 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  <Link to="/onboarding">{tier.cta}</Link>
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Outcome-Based Funding */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-secondary border-secondary">
              <TrendingUp className="w-3 h-3 mr-1" />
              Outcome-Based Funding
            </Badge>
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Pay for Results, Not Promises
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fund specific outcomes with full transparency. Every dollar tracks directly to measurable impact.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {outcomeMetrics.map((outcome) => {
              const Icon = outcome.icon;
              return (
                <Card 
                  key={outcome.metric}
                  className="p-6 border-2 hover:border-secondary/50 transition-all duration-300 hover:shadow-soft group"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                    <Icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{outcome.cost}</div>
                  <div className="text-sm font-semibold text-foreground mb-2">{outcome.metric}</div>
                  <p className="text-sm text-muted-foreground">{outcome.description}</p>
                </Card>
              );
            })}
          </div>

          {/* Donation CTA */}
          <Card className="mt-12 p-8 bg-gradient-hero border-2 border-primary/20">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Make a Difference Today</span>
                </div>
                <p className="text-muted-foreground max-w-xl">
                  Every contribution directly funds meals, jobs, and community resilience. 
                  100% transparent tracking ensures your donation creates real impact.
                </p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary/10">
                  One-Time Donation
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  Monthly Support
                </Button>
              </div>
            </div>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">Trusted by impact-focused organizations</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <span className="text-lg font-semibold text-muted-foreground">UNICEF</span>
              <span className="text-lg font-semibold text-muted-foreground">World Food Programme</span>
              <span className="text-lg font-semibold text-muted-foreground">UN Women</span>
              <span className="text-lg font-semibold text-muted-foreground">Local Food Banks</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
