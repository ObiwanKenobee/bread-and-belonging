import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Eye, UserCheck } from "lucide-react";
import { useState } from "react";
import type { UserType } from "@/pages/Onboarding";

interface Props {
  userType: UserType;
}

const TrustIDSetup = ({ userType }: Props) => {
  const [method, setMethod] = useState<"phone" | "email" | "community">("phone");

  const methods = [
    {
      id: "phone" as const,
      icon: Shield,
      title: "Phone Number",
      description: "Verify via SMS - works with basic phones"
    },
    {
      id: "email" as const,
      icon: Lock,
      title: "Email Address",
      description: "Secure email verification"
    },
    {
      id: "community" as const,
      icon: UserCheck,
      title: "Community Attestation",
      description: "Get verified by trusted community members"
    }
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-warm flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Create Your Trust ID
        </h2>
        <p className="text-lg text-muted-foreground">
          Your privacy-first identity on the network. No exclusions, no judgment.
        </p>
      </div>

      <Card className="p-6 border-2 bg-gradient-to-br from-primary/5 to-secondary/5 mb-6">
        <div className="flex gap-3 mb-3">
          <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Privacy Promise</h3>
            <p className="text-sm text-muted-foreground">
              We collect only what's necessary. Your data stays with you, works offline, 
              and can be deleted anytime. No tracking, no selling, no surveillance.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-3 mb-6">
        <Label className="text-sm font-medium text-foreground">
          Choose your verification method
        </Label>
        {methods.map((option) => {
          const Icon = option.icon;
          return (
            <Card
              key={option.id}
              className={`p-4 cursor-pointer transition-all border-2 ${
                method === option.id 
                  ? "border-primary shadow-soft" 
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setMethod(option.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  method === option.id ? "bg-gradient-warm" : "bg-muted"
                }`}>
                  <Icon className={`w-5 h-5 ${method === option.id ? "text-white" : "text-foreground"}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{option.title}</h4>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
                {method === option.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {method === "phone" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="+1 (555) 000-0000"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              We'll send a verification code via SMS
            </p>
          </div>
        </div>
      )}

      {method === "email" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="your@email.com"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Check your inbox for a verification link
            </p>
          </div>
        </div>
      )}

      {method === "community" && (
        <Card className="p-6 border-2 bg-muted/30">
          <h4 className="font-semibold text-foreground mb-2">Community Attestation</h4>
          <p className="text-sm text-muted-foreground mb-4">
            This method requires two trusted community members to verify your identity. 
            Perfect if you don't have consistent access to phone or email.
          </p>
          <Button variant="outline" className="w-full">
            Request Community Verification
          </Button>
        </Card>
      )}

      <div className="mt-6 space-y-2">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <div className="w-1 h-1 rounded-full bg-primary mt-1.5" />
          <span>Your Trust ID works offline and syncs when connected</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <div className="w-1 h-1 rounded-full bg-primary mt-1.5" />
          <span>Optional: Add biometric login later for faster access</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <div className="w-1 h-1 rounded-full bg-primary mt-1.5" />
          <span>You control your data - delete anytime, no questions asked</span>
        </div>
      </div>
    </div>
  );
};

export default TrustIDSetup;