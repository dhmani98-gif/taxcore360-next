'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, FileText, Calendar } from 'lucide-react';

export default function WelcomeSection() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Section */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                TaxCore360
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100">
                Payroll Tax Compliance Made Simple
              </p>
              <p className="text-lg text-blue-200/80">
                W-2, 1099-NEC, Form 941, and more - all in one platform
              </p>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="font-semibold">IRS-Ready</span>
                </div>
                <p className="text-sm text-blue-200">Generate W-2 + W-3</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="font-semibold">Quarterly</span>
                </div>
                <p className="text-sm text-blue-200">Track 941 deadlines</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="font-semibold">Secure</span>
                </div>
                <p className="text-sm text-blue-200">SOC 2 compliant</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/auth/signin"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-xl text-center"
                >
                  Sign In to Workspace
                </Link>
                <Link 
                  href="/auth/signup"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-all text-center"
                >
                  Create New Account
                </Link>
              </div>
            </div>

            {/* Trust Signal */}
            <div className="pt-4">
              <p className="text-blue-200/60 text-sm flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Trusted by 5,000+ Teams
              </p>
            </div>
          </div>

          {/* Right Side - Visual */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <div className="w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl absolute -inset-4"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="space-y-4">
                  <div className="h-2 bg-white/20 rounded-full w-3/4"></div>
                  <div className="h-2 bg-white/10 rounded-full w-full"></div>
                  <div className="h-2 bg-white/20 rounded-full w-5/6"></div>
                  <div className="h-2 bg-white/10 rounded-full w-2/3"></div>
                  <div className="h-2 bg-white/20 rounded-full w-4/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Footer */}
      <div className="absolute bottom-0 left-0 right-0 py-4 text-center">
        <p className="text-blue-200/40 text-xs">
          Secured with AES-256 encryption and SOC 2 compliance
        </p>
      </div>
    </div>
  );
}
