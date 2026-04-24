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
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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
              banner.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-200' :
              banner.type === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-200' :
              banner.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-200' :
              'bg-blue-500/20 border border-blue-500/30 text-blue-200'
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
