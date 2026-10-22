'use client';

import React from 'react';
import Link from 'next/link';
import {
  GitCommit,
  Bug,
  BrainCircuit,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Button } from '@/components/common/Button';
import { HeroPreview } from '@/components/landing/HeroPreview';

export default function HomePage() {
  const features = [
    {
      icon: <GitCommit className="h-6 w-6 text-indigo-400" />,
      title: 'Git History Analysis',
      description:
        'Analyze commit history, churn rate, author distribution, and multi-developer file coordination patterns.',
    },
    {
      icon: <Bug className="h-6 w-6 text-rose-400" />,
      title: 'Bug Pattern Detection',
      description:
        'Identify historical bug-fix commits, regression-prone modules, and past defect hotspots across releases.',
    },
    {
      icon: <BrainCircuit className="h-6 w-6 text-purple-400" />,
      title: 'ML-Based Risk Prediction',
      description:
        'Use machine learning to estimate file-level bug-proneness from multi-dimensional engineering signals.',
    },
    {
      icon: <Layers className="h-6 w-6 text-amber-400" />,
      title: 'Visual Risk Heatmap',
      description:
        'Visualize repository risk in intuitive treemaps so developers can quickly spot and triage architectural debt.',
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'GitHub Repository', desc: 'Public GitHub repository URL' },
    { step: '02', title: 'Data Collection', desc: 'Cloning commits, branches & diff trees' },
    { step: '03', title: 'Git History Analysis', desc: 'Parsing churn, contributors & commit logs' },
    { step: '04', title: 'Feature Extraction', desc: 'Combining Git and Python source metrics' },
    { step: '05', title: 'ML Model', desc: 'Applying the saved risk prediction model' },
    { step: '06', title: 'Risk Score', desc: 'Generating normalized 0–100 risk tier' },
    { step: '07', title: 'Visual Dashboard', desc: 'Interactive hotspots & prioritized mitigation' },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 selection:bg-indigo-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left text column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1 text-xs font-mono text-indigo-300">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span>AI-Powered Technical Debt & Hotspot Predictor</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                See the Risk Hidden Inside Your Code.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans">
                Trinetra uses Git history, code metrics, and machine learning to identify files that are likely to become bug hotspots before they cause problems.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  href="/analyze"
                  size="lg"
                  variant="primary"
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  Analyze Repository
                </Button>
              </div>

              {/* Trust/Tech pills */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>File-level risk scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Commit churn telemetry</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Historical bug-fix tracking</span>
                </div>
              </div>
            </div>

            {/* Right preview column */}
            <div className="lg:col-span-5">
              <HeroPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              Deep Engineering Diagnostics
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Engineered for Real Codebases
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Trinetra analyzes multi-dimensional signals across the full lifecycle of your software repository.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm transition-all duration-200 hover:border-slate-700 hover:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-3 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed font-sans">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center text-[11px] font-mono text-indigo-400">
                  <span>Hotspot signal #{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Trinetra Works (Visual Workflow) */}
      <section id="workflow" className="py-20 border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              Pipeline Architecture
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              How Trinetra Works
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              From raw Git logs to actionable hotspot visualization in seven transparent stages.
            </p>
          </div>

          {/* Workflow Sequence */}
          <div className="mt-14 relative">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {workflowSteps.map((step, index) => (
                <div
                  key={step.step}
                  className="relative rounded-xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between transition-all hover:border-indigo-500/40"
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-xs text-slate-500 mb-2">
                      <span className="text-indigo-400 font-bold">{step.step}</span>
                      {index < workflowSteps.length - 1 && (
                        <span className="hidden md:inline text-slate-600">→</span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-white tracking-tight">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400 leading-snug">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Mobile indicator notice */}
            <div className="mt-4 text-center md:hidden">
              <span className="text-xs font-mono text-slate-500">
                ↓ Sequential analysis pipeline executes in seconds
              </span>
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-16 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/30 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Ready to find bug hotspots in your codebase?
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                Start scanning any public repository in seconds with no configuration needed.
              </p>
            </div>
            <Button
              href="/analyze"
              size="lg"
              variant="primary"
              icon={<ArrowRight className="h-4 w-4" />}
              className="shrink-0"
            >
              Analyze Your Repository
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#070A12] py-12 text-slate-500 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <span className="font-bold text-slate-200">Trinetra</span>
            <span>•</span>
            <span>Bug-Proneness & Technical Debt Hotspot Predictor</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/analyze" className="hover:text-slate-300 transition-colors">
              Analyze
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
