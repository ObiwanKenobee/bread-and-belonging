import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How is the platform free for producers and beneficiaries?",
    answer:
      "Our freemium model is funded by Impact Partners and Enterprise clients. Governments, NGOs, foundations, and corporate donors pay for analytics, API access, and custom deployments—enabling the core marketplace to remain completely free for farmers, producers, and community members in need.",
  },
  {
    question: "What are Dignity Credits and how do they work?",
    answer:
      "Dignity Credits (DC) are community-issued, non-speculative credits earned by producers when they fulfill community needs. Unlike traditional aid, DCs are earned through work and contribution—preserving dignity while providing economic value. Credits can be redeemed within the local economy for goods and services.",
  },
  {
    question: "How does outcome-based funding work?",
    answer:
      "Donors fund specific, measurable outcomes rather than general operations. When you fund 'meals delivered' at $0.50 each, you receive real-time tracking showing exactly how many meals your contribution enabled, who received them, and the nutritional impact. Every dollar is traceable through our transparent ledger.",
  },
  {
    question: "What impact metrics can I track as a Partner?",
    answer:
      "Partners access dashboards showing: meals distributed, people helped, jobs created, sustainability scores, match success rates, food waste reduction, women-led household earnings, and geographic distribution. All data is auditable and available via API for integration with your own reporting systems.",
  },
  {
    question: "How do you ensure transparency and prevent fraud?",
    answer:
      "Multiple layers protect the system: Community Trust IDs with attestation, multi-stakeholder governance councils (including faith leaders, civil society, and women's representatives), blockchain-auditable transaction records, and rotating stewardship to prevent elite capture. All allocation rules are council-driven and publicly visible.",
  },
  {
    question: "Can the platform work offline or with limited connectivity?",
    answer:
      "Yes! The platform is designed for accessibility. We support offline-first functionality, SMS/USSD access for users without smartphones, and the Trust ID system works without requiring formal documentation—making it accessible for displaced people, refugees, and informal workers.",
  },
  {
    question: "What's included in Enterprise white-label deployment?",
    answer:
      "Enterprise clients receive: custom branding and domain, dedicated infrastructure, multi-region support, compliance and audit trails for government requirements, social bond integration for impact investors, dedicated success manager, custom API integrations, and SLA guarantees with 99.9% uptime.",
  },
  {
    question: "How is the 60% women-led household target enforced?",
    answer:
      "Our Match & Multiply AI prioritizes matches that support women-led households and marginalized groups. The governance council sets allocation rules, and real-time dashboards track progress. If targets aren't being met, the matching algorithm adjusts priorities while the council reviews and arbitrates.",
  },
];

export function PricingFAQ() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-accent border-accent">
              <HelpCircle className="w-3 h-3 mr-1" />
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our platform and funding model.
            </p>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-2 rounded-lg px-6 data-[state=open]:border-primary/50 transition-colors"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Still have questions */}
          <div className="mt-12 text-center p-8 bg-muted/50 rounded-2xl">
            <p className="text-foreground font-medium mb-2">
              Still have questions?
            </p>
            <p className="text-muted-foreground text-sm">
              Reach out to our team at{" "}
              <a
                href="mailto:hello@loavesandfish.network"
                className="text-primary hover:underline"
              >
                hello@loavesandfish.network
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
