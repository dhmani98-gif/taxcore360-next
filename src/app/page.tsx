import Link from 'next/link';
import { CheckCircle, Shield, Zap, Users, BarChart3, FileText, Lock, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm mr-3">
                TC
              </div>
              <span className="text-xl font-bold text-gray-900">TaxCore360</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">Pricing</a>
              <a href="#security" className="text-gray-600 hover:text-gray-900 transition">Security</a>
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Automated Tax & Payroll Compliance
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Tax Compliance Made
              <span className="text-blue-600"> Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Trusted by thousands of accountants and businesses. File 1099s, W-2s, and manage payroll 
              with IRS-compliant automation. Save hours on tax season.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Free Trial
              </Link>
              <Link
                href="#demo"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
              >
                Watch Demo
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              No credit card required. Free for 30 days.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2" />
              <span className="font-medium">5,000+ Users</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FileText className="w-5 h-5 mr-2" />
              <span className="font-medium">100K+ Forms Filed</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Shield className="w-5 h-5 mr-2" />
              <span className="font-medium">IRS Compliant</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Award className="w-5 h-5 mr-2" />
              <span className="font-medium">4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Tax Compliance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From 1099 filing to TIN matching, we've got you covered with IRS-approved solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1099 & W-2 Filing</h3>
              <p className="text-gray-600 mb-4">
                Generate, e-file, and distribute 1099-NEC, 1099-MISC, and W-2 forms directly to the IRS. 
                Automatic calculations and error checking.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  IRS FIRE system integration
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Bulk filing capabilities
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  PDF & XML generation
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">TIN Matching</h3>
              <p className="text-gray-600 mb-4">
                Verify vendor TINs against IRS database in real-time. Reduce penalties and ensure 
                accurate 1099 reporting.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Real-time IRS TIN matching
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  B-Notice error resolution
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Automated W-9 collection
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Agricultural Form 943</h3>
              <p className="text-gray-600 mb-4">
                Specialized support for agricultural businesses. File Form 943 for farm workers 
                with automatic calculations.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Agricultural payroll tracking
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Seasonal worker management
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Form 943 e-filing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="demo" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Intuitive dashboard designed for accountants. Everything you need in one place.
            </p>
          </div>

          <div className="bg-gray-100 rounded-2xl p-8 shadow-xl">
            <div className="bg-white rounded-lg p-6">
              {/* Dashboard Mockup */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">247</div>
                  <div className="text-sm text-gray-600">Active Employees</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">156</div>
                  <div className="text-sm text-gray-600">1099 Vendors</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">89</div>
                  <div className="text-sm text-gray-600">Tax Forms</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">12</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <BarChart3 className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600">Interactive dashboard with real-time compliance tracking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your business. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                $49<span className="text-base font-normal text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">Perfect for small businesses</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Up to 50 employees
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  100 forms/month
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Basic reporting
                </li>
                <li className="flex items-center text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2" />
                  TIN matching
                </li>
              </ul>
              <Link
                href="/auth/signup?plan=starter"
                className="w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-blue-600 p-8 rounded-xl shadow-lg transform hover:shadow-xl transition border-2 border-blue-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Professional</h3>
              <div className="text-3xl font-bold text-white mb-4">
                $149<span className="text-base font-normal text-blue-100">/month</span>
              </div>
              <p className="text-blue-100 mb-6">For growing businesses</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-blue-100">
                  <CheckCircle className="w-4 h-4 text-white mr-2" />
                  Up to 500 employees
                </li>
                <li className="flex items-center text-blue-100">
                  <CheckCircle className="w-4 h-4 text-white mr-2" />
                  1,000 forms/month
                </li>
                <li className="flex items-center text-blue-100">
                  <CheckCircle className="w-4 h-4 text-white mr-2" />
                  Advanced reporting
                </li>
                <li className="flex items-center text-blue-100">
                  <CheckCircle className="w-4 h-4 text-white mr-2" />
                  TIN matching included
                </li>
              </ul>
              <Link
                href="/auth/signup?plan=professional"
                className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                Custom<span className="text-base font-normal text-gray-600"></span>
              </div>
              <p className="text-gray-600 mb-6">For large organizations</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Unlimited employees
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Unlimited forms
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Custom reporting
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Priority support
                </li>
              </ul>
              <Link
                href="/contact-sales"
                className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section id="security" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bank-Level Security & Compliance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your data is protected with enterprise-grade security and full IRS compliance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">256-bit Encryption</h3>
              <p className="text-gray-600">Bank-level security for all data</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">IRS Compliant</h3>
              <p className="text-gray-600">Meets all IRS requirements</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Role-Based Access</h3>
              <p className="text-gray-600">Control who sees what</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">SOC 2 Type II</h3>
              <p className="text-gray-600">Audited and certified</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Simplify Tax Compliance?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of accountants who trust TaxCore360 for their tax filing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/auth/login"
              className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Sign In
            </Link>
          </div>
          <p className="text-blue-100 mt-4 text-sm">
            30-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm mr-3">
                  TC
                </div>
                <span className="text-xl font-bold text-white">TaxCore360</span>
              </div>
              <p className="text-gray-400">
                Automated tax compliance for modern businesses.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition">Pricing</a></li>
                <li><a href="#security" className="text-gray-400 hover:text-white transition">Security</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Careers</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2026 TaxCore360. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
