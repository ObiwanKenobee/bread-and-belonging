import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import UserTypes from "@/components/UserTypes";
import Impact from "@/components/Impact";
import Governance from "@/components/Governance";
import CTA from "@/components/CTA";
import Pricing from "@/components/Pricing";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <UserTypes />
      <CommunityFeed />
      <Pricing />
      <PricingFAQ />
      <Impact />
      <Governance />
      <CTA />
    </div>
  );
};

export default Index;