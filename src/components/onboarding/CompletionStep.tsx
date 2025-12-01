import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import type { UserType } from "@/pages/Onboarding";

interface Props {
  userType: UserType;
  onComplete: () => void;
}

const nextStepsByType = {
  producer: [
    "List your first product or service",
    "Set up your Dignity Credit wallet",
    "Browse community needs to match",
    "Join local producer network"
  ],
  beneficiary: [
    "Browse available resources nearby",
    "Set up your preferences and needs",
    "Start earning Dignity Credits",
    "Connect with local support"
  ],
  partner: [
    "Set up your impact dashboard",
    "Configure funding preferences",
    "Review available projects",
    "Connect your systems via API"
  ]
};

const CompletionStep = ({ userType, onComplete }: Props) => {
  if (!userType) return null;

  const nextSteps = nextStepsByType[userType];

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-warm flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Welcome to the Network!
        </h2>
        <p className="text-lg text-muted-foreground">
          Your account is ready. Let's make an impact together.
        </p>
      </div>

      <Card className="p-6 border-2 bg-gradient-to-br from-primary/5 to-secondary/5 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-foreground mb-2">You're all set!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your Trust ID is created, accessibility preferences are saved, and you're ready 
              to start participating in the community.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                ✓ Trust ID Verified
              </span>
              <span className="text-xs px-3 py-1 bg-secondary/10 text-secondary rounded-full font-medium">
                ✓ Accessibility Set
              </span>
              <span className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full font-medium">
                ✓ Profile Complete
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-8">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <span>Suggested next steps</span>
          <ArrowRight className="w-4 h-4 text-primary" />
        </h3>
        <div className="space-y-3">
          {nextSteps.map((step, index) => (
            <Card 
              key={index}
              className="p-4 border-2 hover:shadow-soft transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 font-semibold text-foreground">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-foreground">{step}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Button 
        onClick={onComplete}
        size="lg" 
        className="w-full gap-2 shadow-elevated"
      >
        Enter Platform
        <ArrowRight className="w-5 h-5" />
      </Button>

      <p className="text-xs text-center text-muted-foreground mt-4">
        Need help getting started? Visit our Help Center or connect with a community guide
      </p>
    </div>
  );
};

export default CompletionStep;