'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from './Button';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-md shadow-indigo-900/40 border border-indigo-400/30 group-hover:scale-105 transition-transform">
            <Eye className="h-5 w-5 text-white" />
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white font-sans">
                Trinetra
              </span>
              <span className="rounded bg-indigo-500/10 px-1.5 py-0.2 text-[10px] font-mono font-medium text-indigo-400 border border-indigo-500/20">
                v0.1
              </span>
            </div>
            <span className="text-[11px] text-slate-400 leading-none">
              Hotspot Predictor
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/#features"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#workflow"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            How it works
          </Link>
        </nav>

        {/* Right Action buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            href="/analyze"
            size="sm"
            variant="primary"
            icon={<ArrowRight className="h-3.5 w-3.5" />}
          >
            Analyze Repo
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0B0F19] px-4 pt-3 pb-5 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white py-2"
          >
            Home
          </Link>
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white py-2"
          >
            Features
          </Link>
          <Link
            href="/#workflow"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white py-2"
          >
            How it works
          </Link>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              href="/analyze"
              size="md"
              variant="primary"
              className="w-full text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Analyze Repository
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
