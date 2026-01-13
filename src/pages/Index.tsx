import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import UserTypes from "@/components/UserTypes";
import Impact from "@/components/Impact";
import Governance from "@/components/Governance";
import CTA from "@/components/CTA";
import { CommunityFeed } from "@/components/community/CommunityFeed";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <UserTypes />
      <CommunityFeed />
      <Impact />
      <Governance />
      <CTA />
    </div>
  );
};

export default Index;