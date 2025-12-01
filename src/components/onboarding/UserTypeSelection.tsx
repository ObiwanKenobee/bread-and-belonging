import { Card } from "@/components/ui/card";
import { Sprout, HandHeart, TrendingUp } from "lucide-react";
import type { UserType } from "@/pages/Onboarding";

interface Props {
  userType: UserType;
  setUserType: (type: UserType) => void;
}

const userTypes = [
  {
    id: "producer" as const,
    icon: Sprout,
    title: "Producer",
    subtitle: "Farmer • Baker • Maker • Care Provider",
    description: "I have goods, services, or skills to share with my community",
    features: [
      "List surplus produce and services",
      "Earn Dignity Credits",
      "Access local markets",
      "Build sustainable income"
    ]
  },
  {
    id: "beneficiary" as const,
    icon: HandHeart,
    title: "Community Member",
    subtitle: "Individual • Family • Community Group",
    description: "I need access to food, care, or services for myself or my family",
    features: [
      "Privacy-respecting access",
      "Dignity-based support",
      "Earn credits through participation",
      "Path to economic stability"
    ]
  },
  {
    id: "partner" as const,
    icon: TrendingUp,
    title: "Impact Partner",
    subtitle: "NGO • Funder • Government • Organization",
    description: "I want to support and fund measurable community impact",
    features: [
      "Outcome-based funding",
      "Transparent impact tracking",
      "Real-time dashboards",
      "Auditable distribution"
    ]
  }
];

const UserTypeSelection = ({ userType, setUserType }: Props) => {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Welcome to The Loaves & Fish Network
        </h2>
        <p className="text-lg text-muted-foreground">
          Let's get you started. How will you participate in the community?
        </p>
      </div>

      <div className="grid gap-4">
        {userTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = userType === type.id;

          return (
            <Card
              key={type.id}
              className={`p-6 cursor-pointer transition-all duration-300 border-2 hover:shadow-soft ${
                isSelected 
                  ? "border-primary shadow-elevated scale-[1.02]" 
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setUserType(type.id)}
            >
              <div className="flex gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "bg-gradient-warm" : "bg-muted"
                }`}>
                  <Icon className={`w-8 h-8 ${isSelected ? "text-white" : "text-foreground"}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {type.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {type.subtitle}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-foreground mb-3">
                    {type.description}
                  </p>

                  <div className="space-y-1">
                    {type.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground text-center mt-6">
        Don't worry, you can change this later or participate in multiple ways
      </p>
    </div>
  );
};

export default UserTypeSelection;