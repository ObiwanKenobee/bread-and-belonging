import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  icon: string;
}

interface WelcomeTourProps {
  userType: string;
  userId: string;
}

const producerSteps: TourStep[] = [
  {
    title: "Welcome to Your Producer Dashboard!",
    description: "This is your hub for managing products, tracking fulfillments, and earning Dignity Credits by helping your community.",
    icon: "🌾",
  },
  {
    title: "AI Match & Multiply",
    description: "Our AI analyzes community needs and matches them with your available products. Check here for high-priority opportunities.",
    icon: "🤖",
  },
  {
    title: "Manage Your Products & Inventory",
    description: "Add your products and track inventory levels. The system will automatically suggest matches based on what you have available.",
    icon: "📦",
  },
  {
    title: "Earn Dignity Credits",
    description: "Every time you fulfill a community need, you earn Dignity Credits. Track your impact and earnings in real-time.",
    icon: "💎",
  },
];

const beneficiarySteps: TourStep[] = [
  {
    title: "Welcome to Your Community Dashboard!",
    description: "Browse available products from local producers and request what you need. Our community is here to help.",
    icon: "🏠",
  },
  {
    title: "Browse Available Products",
    description: "See what local producers have available. You can request items directly from the product browser.",
    icon: "🛒",
  },
  {
    title: "Submit Your Needs",
    description: "Can't find what you're looking for? Submit a needs request and our AI will match you with available producers.",
    icon: "📝",
  },
  {
    title: "Track Your Dignity Credits",
    description: "You earn credits for participating in the community. Use them for future needs or share with others.",
    icon: "💎",
  },
];

const partnerSteps: TourStep[] = [
  {
    title: "Welcome to Your Impact Dashboard!",
    description: "Monitor real-time impact metrics and see how our community is making a difference together.",
    icon: "📊",
  },
  {
    title: "Track Key Metrics",
    description: "View meals distributed, people helped, sustainability scores, and more with interactive charts.",
    icon: "📈",
  },
  {
    title: "Analyze Trends",
    description: "Drill down into weekly and monthly trends to understand the community's impact over time.",
    icon: "🔍",
  },
  {
    title: "Support the Mission",
    description: "Your partnership helps connect surplus to need. See the direct impact of your support.",
    icon: "🤝",
  },
];

export function WelcomeTour({ userType, userId }: WelcomeTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const steps = userType === "producer" 
    ? producerSteps 
    : userType === "partner" 
      ? partnerSteps 
      : beneficiarySteps;

  useEffect(() => {
    checkTourStatus();
  }, [userId]);

  const checkTourStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("user_tour_status")
        .select("tour_completed")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error checking tour status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeTour = async () => {
    try {
      await supabase.from("user_tour_status").upsert({
        user_id: userId,
        tour_completed: true,
        completed_at: new Date().toISOString(),
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error completing tour:", error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeTour();
  };

  if (isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="text-4xl">{steps[currentStep].icon}</div>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogTitle className="text-xl">{steps[currentStep].title}</DialogTitle>
          <DialogDescription className="text-base">
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-1 py-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip Tour
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              {currentStep < steps.length - 1 && (
                <ChevronRight className="ml-1 h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
