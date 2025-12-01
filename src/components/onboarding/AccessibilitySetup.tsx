import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Smartphone, Volume2, Languages, Wifi } from "lucide-react";
import { useState } from "react";

const AccessibilitySetup = () => {
  const [settings, setSettings] = useState({
    offlineMode: true,
    smsNotifications: false,
    audioAssistance: false,
    multiLanguage: false
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const options = [
    {
      id: "offlineMode",
      icon: Wifi,
      title: "Offline Mode",
      description: "Access the platform without internet. Your data syncs when you're back online.",
      recommended: true
    },
    {
      id: "smsNotifications",
      icon: Smartphone,
      title: "SMS Notifications",
      description: "Get important updates via text message. No smartphone required.",
      recommended: false
    },
    {
      id: "audioAssistance",
      icon: Volume2,
      title: "Audio Assistance",
      description: "Enable text-to-speech for all content. Helpful for those with visual impairments.",
      recommended: false
    },
    {
      id: "multiLanguage",
      icon: Languages,
      title: "Multiple Languages",
      description: "Switch between available languages anytime. Currently supporting 15+ languages.",
      recommended: false
    }
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Accessibility Options
        </h2>
        <p className="text-lg text-muted-foreground">
          We believe technology should work for everyone. Choose what works best for you.
        </p>
      </div>

      <div className="space-y-4">
        {options.map((option) => {
          const Icon = option.icon;
          const isEnabled = settings[option.id as keyof typeof settings];

          return (
            <Card key={option.id} className="p-6 border-2 hover:shadow-soft transition-all">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isEnabled ? "bg-gradient-warm" : "bg-muted"
                }`}>
                  <Icon className={`w-6 h-6 ${isEnabled ? "text-white" : "text-foreground"}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={option.id} className="text-lg font-bold text-foreground cursor-pointer">
                          {option.title}
                        </Label>
                        {option.recommended && (
                          <span className="text-xs font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                    <Switch
                      id={option.id}
                      checked={isEnabled}
                      onCheckedChange={() => toggleSetting(option.id as keyof typeof settings)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 p-6 bg-muted/50 border-2">
        <p className="text-sm text-center text-muted-foreground">
          You can change these settings anytime from your profile. We're committed to making the platform accessible to all community members.
        </p>
      </Card>
    </div>
  );
};

export default AccessibilitySetup;