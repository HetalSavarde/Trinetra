'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, SearchCode, Flame, Eye } from 'lucide-react';

interface SidebarProps {
  currentRepo?: string;
  className?: string;
}

export function Sidebar({ currentRepo = 'Current analysis', className = '' }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryRepo = searchParams.get('repo') || '';
  const queryJobId = searchParams.get('jobId') || '';
  const dashboardHref = queryJobId
    ? `/dashboard?jobId=${encodeURIComponent(queryJobId)}&repo=${encodeURIComponent(queryRepo)}`
    : '/analyze';
  const activeRepo = currentRepo === 'Current analysis' && queryRepo ? queryRepo.replace(/^https?:\/\//, '') : currentRepo;

  const navItems = [
    {
      label: 'Dashboard',
      href: dashboardHref,
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      label: 'Analyze Repository',
      href: '/analyze',
      icon: SearchCode,
      active: pathname === '/analyze' || pathname.startsWith('/analysis-progress'),
    },
    {
      label: 'Risk Hotspots',
      href: queryJobId ? `${dashboardHref}#hotspots` : '/analyze',
      icon: Flame,
      active: false,
    },
  ];

  return (
    <aside
      className={`w-64 border-r border-slate-800 bg-[#0B0F19] flex flex-col h-screen sticky top-0 shrink-0 select-none ${className}`}
    >
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-950">
              <Eye className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white">Trinetra</span>
              <span className="text-[10px] text-slate-400 font-mono leading-none">Risk Engine</span>
            </div>
          </Link>
        </div>

        <div className="p-4 border-b border-slate-800/60 bg-slate-900/40">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold mb-1">
            Active Target
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-200 bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-700/60">
            <span className="truncate max-w-[170px]" title={activeRepo}>{activeRepo}</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Analyzed" />
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  item.active
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${item.active ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800/80 bg-slate-900/60">
        <p className="text-[10px] leading-relaxed text-slate-500 font-mono">
          Semester 5 prototype • Public GitHub repositories • Python analysis
        </p>
      </div>
    </aside>
  );
}
