import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "The Match & Multiply AI helped us reduce food waste by 45% while connecting surplus directly to families in need. The transparency in impact tracking has transformed how we report to donors.",
    name: "Sister Maria Gonzalez",
    role: "Director, Community Food Bank",
    type: "Partner",
    avatar: "MG",
  },
  {
    quote:
      "For the first time, I earn Dignity Credits for the vegetables I grow. It's not charity—it's recognition for my work. My family now has consistent access to other goods we need.",
    name: "Amara Okonkwo",
    role: "Urban Farmer & Producer",
    type: "Producer",
    avatar: "AO",
  },
  {
    quote:
      "The platform's outcome-based funding model aligns perfectly with our impact investment thesis. We can now fund specific meals and jobs with full traceability—exactly what social bond holders demand.",
    name: "Dr. James Chen",
    role: "Impact Investment Director, Global Foundation",
    type: "Partner",
    avatar: "JC",
  },
  {
    quote:
      "When I lost my job, I didn't want handouts. Through the Care Exchange, I found paid shifts helping elderly neighbors. The Trust ID worked even though I don't have formal documents.",
    name: "Fatima Al-Hassan",
    role: "Community Caregiver",
    type: "Beneficiary",
    avatar: "FA",
  },
  {
    quote:
      "Our governance council—faith leaders, women's representatives, technologists—ensures no one group controls distribution. This is neighbor-care as governance, not charity.",
    name: "Pastor Emmanuel Adeyemi",
    role: "Good Samaritan Council Member",
    type: "Partner",
    avatar: "EA",
  },
  {
    quote:
      "My daughters now attend school regularly because we have reliable access to nutritious food. The notifications tell me exactly when a producer fulfills our family's request.",
    name: "Rosa Martinez",
    role: "Mother of Three",
    type: "Beneficiary",
    avatar: "RM",
  },
];

const typeColors: Record<string, string> = {
  Partner: "bg-accent/10 text-accent border-accent/30",
  Producer: "bg-secondary/10 text-secondary border-secondary/30",
  Beneficiary: "bg-primary/10 text-primary border-primary/30",
};

const Testimonials = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Community Voices
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Stories of Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real voices from the partners, producers, and families whose lives are being transformed.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-6 border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-soft flex flex-col"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Quote className="w-5 h-5 text-primary" />
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${typeColors[testimonial.type]}`}
                >
                  {testimonial.type}
                </Badge>
              </div>

              <blockquote className="text-foreground mb-6 flex-1 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-gradient-warm flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
