import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import UserTypeSelection from "@/components/onboarding/UserTypeSelection";
import FeatureIntroduction from "@/components/onboarding/FeatureIntroduction";
import AccessibilitySetup from "@/components/onboarding/AccessibilitySetup";
import TrustIDSetup from "@/components/onboarding/TrustIDSetup";
import CompletionStep from "@/components/onboarding/CompletionStep";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type UserType = "producer" | "beneficiary" | "partner" | null;

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(null);
  const navigate = useNavigate();

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    navigate("/");
  };

  const canProceed = () => {
    if (step === 1) return userType !== null;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main content card */}
        <Card className="p-8 md:p-12 shadow-elevated border-2">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {step === 1 && (
              <UserTypeSelection 
                userType={userType} 
                setUserType={setUserType}
              />
            )}
            {step === 2 && userType && (
              <FeatureIntroduction userType={userType} />
            )}
            {step === 3 && (
              <AccessibilitySetup />
            )}
            {step === 4 && (
              <TrustIDSetup userType={userType} />
            )}
            {step === 5 && (
              <CompletionStep userType={userType} onComplete={handleComplete} />
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-border">
            {step > 1 && step < totalSteps && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            {step < totalSteps && (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2 ml-auto"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;