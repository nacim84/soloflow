"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/landing/fade-in";
import { Shield, Zap, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function PricingSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleBuyCredits = async (planType: 'developer' | 'startup' | 'scale') => {
    setIsLoading(true);
    setLoadingPlan(planType);

    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout");
        setIsLoading(false);
        setLoadingPlan(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start checkout");
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="container mx-auto px-6 mb-20">
      <FadeIn delay={0} direction="up">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-zinc-900 dark:text-white">
            Simple, Usage-Based Pricing
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-8">
            Start free, buy credits when you need them. Credits valid for 1 year.
          </p>

          <div className="inline-flex bg-white dark:bg-zinc-900 rounded-full p-1 border border-zinc-200 dark:border-white/10 relative shadow-sm dark:shadow-none">
            <button className="px-6 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-medium shadow-sm relative z-10 border border-zinc-200 dark:border-transparent">
              Prepaid Credits
            </button>
            <button className="px-6 py-2 rounded-full text-sm font-medium hover:text-indigo-600 dark:hover:text-white text-zinc-500 dark:text-zinc-400 transition-colors relative z-10">
              Enterprise
            </button>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-center">
        {/* Starter */}
        <FadeIn delay={0} direction="up" className="h-full">
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl p-8 flex flex-col hover:-translate-y-2 transition-transform duration-300 shadow-sm dark:shadow-none h-full">
            <h3 className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-2">
              Developer
            </h3>
            <div className="text-4xl font-bold mb-2 text-zinc-900 dark:text-white">
              $0
            </div>
            <p className="text-zinc-500 text-xs mb-6">
              Forever free sandbox access
            </p>

            <Button
              className="w-full py-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 mb-8"
              onClick={() => handleBuyCredits('developer')}
              disabled={isLoading}
            >
              {isLoading && loadingPlan === 'developer' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Buy Credits"
              )}
            </Button>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-2 items-center">
                <span className="text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 text-[10px]">
                  ✓
                </span>
                100 Free Credits / mo
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 text-[10px]">
                  ✓
                </span>
                Rate limit: 60 req/min
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 text-[10px]">
                  ✓
                </span>
                Community Support
              </li>
            </ul>
          </div>
        </FadeIn>

        {/* Pro */}
        <FadeIn delay={0.1} direction="up" className="h-full">
          <div className="bg-white dark:bg-[#121214] border border-indigo-500/50 rounded-2xl p-8 flex flex-col relative shadow-xl dark:shadow-[0_0_30px_rgba(99,102,241,0.15)] transform scale-105 z-10 hover:-translate-y-2 transition-transform duration-300 h-full">
            <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              Most Popular
            </div>
            <h3 className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-2">
              Startup Pack
            </h3>
            <div className="text-4xl font-bold mb-2 text-zinc-900 dark:text-white">
              $3.99
            </div>
            <p className="text-zinc-500 text-xs mb-6">
              5,000 Credits (Valid 1 year)
            </p>

            <Button
              className="w-full py-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 mb-8"
              onClick={() => handleBuyCredits('startup')}
              disabled={isLoading}
            >
              {isLoading && loadingPlan === 'startup' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Buy Credits"
              )}
            </Button>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-2 items-center">
                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-400/10 rounded-full p-1 text-[10px]">
                  ✓
                </span>
                ~1000 PDF Merges
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-400/10 rounded-full p-1 text-[10px]">
                  ✓
                </span>
                ~500 OCR Pages
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-400/10 rounded-full p-1 text-[10px]">
                  ✓
                </span>
                Auto-refill option
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-400/10 rounded-full p-1 text-[10px]">
                  ✓
                </span>
                Priority Email Support
              </li>
            </ul>
          </div>
        </FadeIn>

        {/* Scale */}
        <FadeIn delay={0.2} direction="up" className="h-full">
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl p-8 flex flex-col hover:-translate-y-2 transition-transform duration-300 shadow-sm dark:shadow-none h-full">
            <h3 className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-2">
              Scale
            </h3>
            <div className="text-4xl font-bold mb-2 text-zinc-900 dark:text-white">
              $9.99
            </div>
            <p className="text-zinc-500 text-xs mb-6">
              25,000 Credits + Volume discount
            </p>

            <Button
              variant="outline"
              className="w-full py-2 rounded-full border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 mb-8"
              onClick={() => handleBuyCredits('scale')}
              disabled={isLoading}
            >
              {isLoading && loadingPlan === 'scale' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Buy Credits"
              )}
            </Button>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-2 items-center">
                <span className="text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 text-[10px]">
                  ✓
                </span>
                Cheapest cost per call
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 text-[10px]">
                  ✓
                </span>
                Dedicated Slack Channel
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 text-[10px]">
                  ✓
                </span>
                Higher Rate Limits
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 text-[10px]">
                  ✓
                </span>
                SLA 99.9%
              </li>
            </ul>
          </div>
        </FadeIn>
      </div>

      {/* Trust Banner */}
      <FadeIn delay={0.3} direction="up">
        <div className="border-y border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/50 py-10 mt-16 -mx-6">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm sm:gap-12">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>Secure payment via Stripe</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>Instant credit activation</span>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* FAQ */}
      <FadeIn delay={0.4} direction="up">
        <div className="max-w-3xl mx-auto mt-20">
          <div className="mb-10 text-center">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
              Frequently Asked Questions
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              Everything you need to know about credits and billing
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-zinc-200 dark:border-zinc-800">
              <AccordionTrigger className="text-left font-medium text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400">
                How do credits work?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 dark:text-zinc-400">
                Credits are prepaid and valid for 1 year from purchase. Each API call deducts credits based on the service used (e.g., PDF merge = 5 credits, OCR = 10 credits). Check your dashboard to track consumption in real-time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-zinc-200 dark:border-zinc-800">
              <AccordionTrigger className="text-left font-medium text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400">
                Can I buy more credits later?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 dark:text-zinc-400">
                Yes! You can purchase additional credit packs anytime. Unused credits roll over and remain valid until their expiration date (1 year from purchase). You can also enable auto-refill to prevent service interruptions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-zinc-200 dark:border-zinc-800">
              <AccordionTrigger className="text-left font-medium text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400">
                What happens when I run out of credits?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 dark:text-zinc-400">
                When your credit balance reaches zero, API calls will return a <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs">402 Payment Required</code> error. Simply purchase a new credit pack to resume service immediately. We recommend enabling notifications to get alerts when credits are low.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </FadeIn>
    </section>
  );
}
