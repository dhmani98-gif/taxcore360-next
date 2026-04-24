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
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar - Fixed width with dark navy */}
      <div className="w-[280px] flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Main Content - White/Light Gray Background */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header - White with subtle border */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-gray-500 text-sm mt-1">{description}</p>
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
                <p className="text-gray-900 text-sm font-medium">Acme Corporation</p>
                <p className="text-gray-500 text-xs">Professional Plan</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">AC</span>
              </div>
            </div>
          </div>
          
          {/* Banner */}
          {banner && (
            <div className={`mt-4 p-3 rounded-lg flex items-center space-x-3 ${
              banner.type === 'success' ? 'bg-gradient-to-r from-emerald-50 to-green-100 border border-emerald-200 text-emerald-800' :
              banner.type === 'warning' ? 'bg-gradient-to-r from-amber-50 to-yellow-100 border border-amber-200 text-amber-800' :
              banner.type === 'error' ? 'bg-gradient-to-r from-rose-50 to-red-100 border border-rose-200 text-rose-800' :
              'bg-gradient-to-r from-blue-50 to-cyan-100 border border-blue-200 text-blue-800'
            }`}>
              <span className="text-sm font-medium">{banner.message}</span>
            </div>
          )}
        </header>
        
        {/* Page Content - Light Gray Subtle Background */}
        <main className="flex-1 p-6 overflow-auto bg-[#f8fafc]">
          {children}
        </main>
      </div>
    </div>
  );
}
