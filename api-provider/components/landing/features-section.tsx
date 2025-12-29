"use client";

import { FadeIn } from "@/components/landing/fade-in";
import { cn } from "@/lib/utils";

export function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto px-6 mb-24">
      <div className="text-center mb-16">
        <FadeIn delay={0} direction="up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900 dark:text-white">
            Everything you need to<br />
            <span className="text-indigo-600 dark:text-indigo-400">
              Ship Production-Ready Features
            </span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.1} direction="up">
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            A robust infrastructure handling security, billing, and scalability so
            you can focus on your code.
          </p>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <FadeIn delay={0} direction="up" className="h-full">
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl p-8 flex flex-col justify-between hover:border-indigo-500/50 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/10 transition-all duration-300 group shadow-sm dark:shadow-none h-full">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Multiple Services, One Key
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Access PDF Tools, Document Intelligence, and Mileage Generators
                via a single unified API.
              </p>
            </div>
            <div className="mt-8 flex justify-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-white/5">
              <div className="px-4 py-2 bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-white/10 rounded-lg text-xs font-mono text-red-500 dark:text-red-400 shadow-md group-hover:-translate-y-2 transition-transform">
                PDF
              </div>
              <div className="px-4 py-2 bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-white/10 rounded-lg text-xs font-mono text-blue-500 dark:text-blue-400 shadow-md group-hover:-translate-y-2 transition-transform delay-75">
                OCR
              </div>
              <div className="px-4 py-2 bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-white/10 rounded-lg text-xs font-mono text-green-500 dark:text-green-400 shadow-md group-hover:-translate-y-2 transition-transform delay-100">
                DATA
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1} direction="up" className="h-full">
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl p-8 flex flex-col justify-between hover:border-indigo-500/50 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/10 transition-all duration-300 group shadow-sm dark:shadow-none h-full">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Enterprise-Grade Security
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Keys are hashed using SHA-256. Granular scopes allow you to
                restrict keys to specific services.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-2 items-center justify-center h-24 font-mono text-xs">
              <div className="w-full max-w-[200px] bg-zinc-100 dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 text-center relative overflow-hidden">
                <span className="opacity-50">sk_live_938...</span>
                <div className="absolute inset-0 bg-zinc-200/80 dark:bg-zinc-800/80 backdrop-blur-[2px] flex items-center justify-center text-zinc-700 dark:text-white font-bold">
                  HASHED & SALTED
                </div>
              </div>
              <div className="text-green-600 dark:text-green-500 flex gap-1 items-center font-semibold dark:font-normal">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Encrypted Storage
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2} direction="up" className="h-full">
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl p-8 md:col-span-1 hover:border-indigo-500/50 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/10 transition-all duration-300 overflow-hidden relative group shadow-sm dark:shadow-none h-full">
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Real-Time Usage & Cost
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Monitor your credit consumption and API latency down to the
                millisecond.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-32 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
              <svg
                viewBox="0 0 500 150"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <path
                  className="path-anim"
                  d="M0,100 C150,200 350,0 500,100 L500,150 L0,150 Z"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="3"
                />
                <path
                  d="M0,120 C100,50 400,150 500,80"
                  fill="none"
                  stroke="#a1a1aa"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3} direction="up" className="h-full">
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl p-8 hover:border-indigo-500/50 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/10 transition-all duration-300 group shadow-sm dark:shadow-none h-full">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Live API Logs
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Inspect requests and debug issues instantly.
              </p>
            </div>
            <div className="space-y-2 font-mono text-[10px]">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded flex justify-between items-center border border-zinc-200 dark:border-white/5 border-l-2 border-l-green-500">
                <span className="text-green-600 dark:text-green-400 font-bold dark:font-normal">
                  200 OK
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  POST /v1/pdf/merge
                </span>
                <span className="text-zinc-500 dark:text-zinc-600">120ms</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded flex justify-between items-center border border-zinc-200 dark:border-white/5 border-l-2 border-l-green-500">
                <span className="text-green-600 dark:text-green-400 font-bold dark:font-normal">
                  200 OK
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  POST /v1/ocr/extract
                </span>
                <span className="text-zinc-500 dark:text-zinc-600">850ms</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded flex justify-between items-center border border-zinc-200 dark:border-white/5 border-l-2 border-l-red-500">
                <span className="text-red-500 dark:text-red-400 font-bold dark:font-normal">
                  402 Payment
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  POST /v1/mileage
                </span>
                <span className="text-zinc-500 dark:text-zinc-600">10ms</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
