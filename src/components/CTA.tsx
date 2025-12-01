import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto p-12 bg-card/80 backdrop-blur-sm border-2 shadow-elevated text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Join the Network?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're a producer, community member, or impact partner - there's a place for you 
            in building resilient, dignified local economies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="gap-2 shadow-soft"
              onClick={() => navigate('/onboarding')}
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 border-2">
              <Mail className="w-5 h-5" />
              Contact Us
            </Button>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Launching pilot programs in partnership with
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-muted-foreground">
              <span>UNICEF</span>
              <span>•</span>
              <span>WFP</span>
              <span>•</span>
              <span>UN Women</span>
              <span>•</span>
              <span>Local Faith Networks</span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CTA;