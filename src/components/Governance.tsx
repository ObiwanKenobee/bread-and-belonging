import { Card } from "@/components/ui/card";
import { Shield, Users, Eye, Vote } from "lucide-react";

const principles = [
  {
    icon: Shield,
    title: "Good Samaritan Governance",
    description: "Multi-stakeholder councils including faith leaders, civil society, women's representatives, and technologists guide every decision.",
  },
  {
    icon: Users,
    title: "Rotating Stewardship",
    description: "Leadership roles rotate regularly to prevent elite capture and ensure diverse community voices are heard.",
  },
  {
    icon: Eye,
    title: "Transparent Auditing",
    description: "All allocations and distributions are auditable with DAO-lite records and legal community trusts.",
  },
  {
    icon: Vote,
    title: "Community Consent",
    description: "Major decisions require community approval with clear consent flows and minimal invasive data collection.",
  },
];

const Governance = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Governed by Community Values
            </h2>
            <p className="text-xl text-muted-foreground">
              Biblical principles of neighbor-care and stewardship embedded in every process
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <Card 
                  key={index}
                  className="p-6 bg-card border-2 hover:shadow-soft transition-all duration-300"
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-warm flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {principle.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Faith-Inspired, Universally Accessible
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Drawing from the biblical principles of feeding the many (loaves and fishes) and caring for neighbors (Good Samaritan), 
                our platform serves all community members regardless of background or belief.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Governance;