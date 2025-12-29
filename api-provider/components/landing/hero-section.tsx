"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/landing/fade-in";
import { ArrowRight, PlayCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-6 text-center mb-24 relative">
        {/* Background Decoration Blobs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 dark:opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-500/20 dark:bg-purple-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 dark:opacity-30 animate-blob animation-delay-2000"></div>

        <FadeIn delay={0} direction="up">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-5xl mx-auto leading-[1.1] text-zinc-900 dark:text-white">
            Build faster with our{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-500 dark:to-indigo-500 animate-pulse-slow">
              Unified API Suite
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.1} direction="up">
          <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
            The developer-first platform for{" "}
            <span className="text-zinc-900 dark:text-white font-medium">
              PDF Manipulation
            </span>
            ,{" "}
            <span className="text-zinc-900 dark:text-white font-medium">
              AI OCR
            </span>
            , and{" "}
            <span className="text-zinc-900 dark:text-white font-medium">
              Mileage Expenses
            </span>
            . Generate keys, manage credits, and integrate in minutes.
          </p>
        </FadeIn>

        <FadeIn delay={0.2} direction="up">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Button
              asChild
              size="lg"
              className="rounded-full text-base font-semibold px-8 h-12 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <Link href="/register">Start Building for Free</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full text-base font-medium px-8 h-12 border-zinc-200 dark:border-zinc-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 dark:hover:border-indigo-500 group"
            >
              <Link href="#features" className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>See Features</span>
              </Link>
            </Button>
          </div>
        </FadeIn>

        {/* DASHBOARD MOCKUP */}
        <FadeIn delay={0.3} direction="up" className="relative max-w-5xl mx-auto animate-float">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur-2xl opacity-50"></div>
          <div className="relative bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-[24px] p-2 md:p-4 shadow-2xl overflow-hidden backdrop-blur-sm transition-colors duration-300">
            <div className="flex items-center justify-between px-4 py-3 mb-4 border-b border-zinc-100 dark:border-white/5">
              <div className="flex gap-4 items-center">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <span className="text-zinc-400 dark:text-zinc-500 text-xs font-mono ml-2">
                  dashboard.keyapi.com
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 px-2 py-0.5 rounded-full">
                  Systems Operational
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left p-2">
              <div className="md:col-span-8 bg-zinc-50 dark:bg-[#18181b] rounded-xl p-5 border border-zinc-100 dark:border-white/5 flex flex-col justify-between h-64 hover:border-indigo-500/20 transition-all duration-500 group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      API Requests
                    </h3>
                    <p className="text-xs text-zinc-500">Last 24 hours</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
                      POST /pdf/merge
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
                      POST /ocr/scan
                    </span>
                  </div>
                </div>
                <div className="flex items-end gap-2 mt-4 h-full px-2">
                  <div className="w-1/6 bg-zinc-200 dark:bg-zinc-800 rounded-t h-[40%] group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-all"></div>
                  <div className="w-1/6 bg-zinc-200 dark:bg-zinc-800 rounded-t h-[25%] group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-all"></div>
                  <div className="w-1/6 bg-gradient-to-t from-indigo-500 to-indigo-300 dark:from-indigo-600 dark:to-indigo-400 rounded-t h-[80%] relative shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>
                  <div className="w-1/6 bg-zinc-200 dark:bg-zinc-800 rounded-t h-[50%] group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-all"></div>
                  <div className="w-1/6 bg-zinc-200 dark:bg-zinc-800 rounded-t h-[60%] group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-all"></div>
                  <div className="w-1/6 bg-zinc-200 dark:bg-zinc-800 rounded-t h-[30%] group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-all"></div>
                </div>
              </div>
              <div className="md:col-span-4 flex flex-col gap-4 h-64">
                <div className="flex-1 bg-zinc-50 dark:bg-[#18181b] rounded-xl p-5 border border-zinc-100 dark:border-white/5 hover:border-purple-500/20 transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Credit Balance
                  </h3>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                    4,250 <span className="text-sm font-normal text-zinc-500">cr</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 w-[70%] h-full"></div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2">
                    Auto-refill enabled below 100 cr
                  </p>
                </div>
                <div className="flex-1 bg-zinc-50 dark:bg-[#18181b] rounded-xl p-5 border border-zinc-100 dark:border-white/5 hover:border-indigo-500/20 transition-all">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Active API Keys
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs p-2 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none">
                      <span className="font-mono text-indigo-500 dark:text-indigo-300">
                        sk_live_...8x92
                      </span>
                      <span className="text-green-500">● Active</span>
                    </div>
                    <div className="flex justify-between items-center text-xs p-2 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none">
                      <span className="font-mono text-zinc-500">
                        sk_test_...m2k9
                      </span>
                      <span className="text-zinc-400 dark:text-zinc-500">
                        ● Test
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
