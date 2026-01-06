import { PricingSection } from "@/components/landing/pricing-section";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] transition-colors duration-300">
      <main className="py-20">
        <PricingSection />
      </main>
    </div>
  );
}
