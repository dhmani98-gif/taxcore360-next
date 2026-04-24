'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  badges?: string[];
  banner?: {
    type: 'success' | 'warning' | 'info' | 'error';
    message: string;
  };
}

export default function DashboardLayout({ 
  children, 
  title, 
  description, 
  badges = [],
  banner 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar - Fixed width */}
      <div className="w-[280px] flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Main Content - Takes remaining space */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {description && (
                <p className="text-slate-400 text-sm mt-1">{description}</p>
              )}
              {badges.length > 0 && (
                <div className="flex items-center space-x-2 mt-2">
                  {badges.map((badge, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Company Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white text-sm font-medium">Acme Corporation</p>
                <p className="text-slate-400 text-xs">Professional Plan</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">AC</span>
              </div>
            </div>
          </div>
          
          {/* Banner */}
          {banner && (
            <div className={`mt-4 p-3 rounded-lg flex items-center space-x-3 ${
              banner.type === 'success' ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/30 border border-emerald-400/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]' :
              banner.type === 'warning' ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/30 border border-amber-400/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]' :
              banner.type === 'error' ? 'bg-gradient-to-r from-rose-500/20 to-red-500/30 border border-rose-400/40 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.15)]' :
              'bg-gradient-to-r from-blue-500/20 to-cyan-500/30 border border-blue-400/40 text-cyan-200 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
            }`}>
              <span className="text-sm font-medium">{banner.message}</span>
            </div>
          )}
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
