import { Card } from "@/components/ui/card";
import { Shield, Brain, Coins, Users, Database, Eye } from "lucide-react";
import type { UserType } from "@/pages/Onboarding";

interface Props {
  userType: UserType;
}

const featuresByType = {
  producer: [
    {
      icon: Database,
      title: "Local Availability Ledger",
      description: "List your goods and services with full transparency. Track what you produce, when it's available, and your impact on the community."
    },
    {
      icon: Coins,
      title: "Dignity Credits",
      description: "Earn community credits for your work and goods. Use them for essentials, training, or save for the future. Fair, non-speculative value."
    },
    {
      icon: Brain,
      title: "Smart Matching",
      description: "Our ethical AI connects your surplus with community needs, optimizes delivery routes, and helps you plan what to produce."
    },
    {
      icon: Users,
      title: "Care Exchange",
      description: "Offer paid care services - childcare, tutoring, elder care. Build your reputation and earn higher credit rates through training."
    }
  ],
  beneficiary: [
    {
      icon: Shield,
      title: "Community Trust ID",
      description: "Privacy-first identity that works offline. No exclusion based on documentation. Community attestations help you build trust."
    },
    {
      icon: Brain,
      title: "Personalized Matching",
      description: "Get matched with local resources that meet your needs - food, medicine, care services. Dignity-based access, no judgment."
    },
    {
      icon: Coins,
      title: "Earn & Save Credits",
      description: "Participate in the community and earn Dignity Credits. Use them immediately or save for future needs. Your credits, your choice."
    },
    {
      icon: Users,
      title: "Support Network",
      description: "Connect with local producers, caregivers, and neighbors. Access training, find work opportunities, and build economic resilience."
    }
  ],
  partner: [
    {
      icon: Eye,
      title: "Impact Dashboard",
      description: "Real-time tracking of every meal served, job created, and life improved. Full transparency with auditable records."
    },
    {
      icon: Coins,
      title: "Outcome-Based Funding",
      description: "Fund specific outcomes like '1,000 meals for 6 months' with complete visibility into distribution and impact."
    },
    {
      icon: Database,
      title: "Open Impact API",
      description: "Integrate with your systems. Pull data, track KPIs, and prove impact to stakeholders with comprehensive analytics."
    },
    {
      icon: Shield,
      title: "Good Samaritan Governance",
      description: "Multi-stakeholder councils ensure ethical allocation. Rotating leadership prevents capture. Community-first decision making."
    }
  ]
};

const FeatureIntroduction = ({ userType }: Props) => {
  if (!userType) return null;

  const features = featuresByType[userType];

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Platform Features for You
        </h2>
        <p className="text-lg text-muted-foreground">
          Here's what you'll have access to as a {userType === "beneficiary" ? "community member" : userType}
        </p>
      </div>

      <div className="grid gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={index}
              className="p-6 border-2 hover:shadow-soft transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-warm flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
        <p className="text-sm text-center text-muted-foreground">
          All features are designed with <span className="font-semibold text-foreground">dignity</span>, 
          <span className="font-semibold text-foreground"> privacy</span>, and 
          <span className="font-semibold text-foreground"> community stewardship</span> at their core
        </p>
      </Card>
    </div>
  );
};

export default FeatureIntroduction;