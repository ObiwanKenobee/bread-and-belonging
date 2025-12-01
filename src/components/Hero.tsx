import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-community.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Heart className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Community-Powered Impact</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          The Loaves & Fish
          <br />
          <span className="bg-gradient-warm bg-clip-text text-transparent">Network</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          Multiplying local abundance into meals, jobs, and dignity through ethical technology and community stewardship
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Button 
            size="lg" 
            className="gap-2 shadow-elevated hover:shadow-soft transition-all"
            onClick={() => navigate('/onboarding')}
          >
            Join the Network
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" className="border-2">
            Learn How It Works
          </Button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          {[
            { value: "1M+", label: "Meals Delivered" },
            { value: "2K+", label: "Jobs Created" },
            { value: "60%", label: "Women-Led" },
            { value: "40%", label: "Waste Reduced" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-warm bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;