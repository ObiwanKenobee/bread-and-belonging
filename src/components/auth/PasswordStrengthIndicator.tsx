import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordRequirement {
  label: string;
  validator: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: "At least 8 characters", validator: (p) => p.length >= 8 },
  { label: "Contains uppercase letter", validator: (p) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", validator: (p) => /[a-z]/.test(p) },
  { label: "Contains a number", validator: (p) => /\d/.test(p) },
];

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { strength, metRequirements } = useMemo(() => {
    const met = requirements.filter((req) => req.validator(password));
    return {
      strength: met.length,
      metRequirements: met.map((req) => req.label),
    };
  }, [password]);

  const strengthLabel = useMemo(() => {
    if (password.length === 0) return null;
    if (strength <= 1) return { text: "Weak", color: "bg-destructive" };
    if (strength === 2) return { text: "Fair", color: "bg-orange-500" };
    if (strength === 3) return { text: "Good", color: "bg-yellow-500" };
    return { text: "Strong", color: "bg-secondary" };
  }, [password, strength]);

  if (password.length === 0) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                strength >= level ? strengthLabel?.color : "bg-muted"
              }`}
            />
          ))}
        </div>
        {strengthLabel && (
          <p className="text-xs text-muted-foreground">
            Password strength: <span className="font-medium">{strengthLabel.text}</span>
          </p>
        )}
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1">
        {requirements.map((req) => {
          const isMet = metRequirements.includes(req.label);
          return (
            <li
              key={req.label}
              className={`flex items-center gap-2 text-xs transition-colors ${
                isMet ? "text-secondary" : "text-muted-foreground"
              }`}
            >
              {isMet ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
