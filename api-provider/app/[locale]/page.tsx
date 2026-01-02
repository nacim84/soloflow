import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FooterSection } from "@/components/landing/footer-section";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] transition-colors duration-300">
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
      </main>
      <FooterSection />
    </div>
  );
}