'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // TODO: Implement actual password reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock email check
      if (email.includes('demo') || email.includes('test') || email.includes('admin')) {
        setMessage({ 
          type: 'success', 
          text: 'Password reset link sent to your email!' 
        });
        setEmailSent(true);
      } else {
        setMessage({ 
          type: 'info', 
          text: 'If this email exists in our system, a reset link has been sent.' 
        });
        setEmailSent(true);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send reset link. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reset password</h1>
          <p className="text-blue-200">
            We'll email you a reset link
          </p>
        </div>

        {/* Success State */}
        {emailSent ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Check your email</h3>
              <p className="text-blue-200">
                We've sent a password reset link to:
              </p>
              <p className="text-blue-300 font-medium mt-2">{email}</p>
            </div>
            <div className="space-y-3">
              <p className="text-blue-200/60 text-sm">
                Didn't receive the email? Check your spam folder or
              </p>
              <button 
                onClick={() => setEmailSent(false)}
                className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                message.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-200' :
                message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-200' :
                'bg-blue-500/20 border border-blue-500/30 text-blue-200'
              }`}>
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              {/* Send Link Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              >
                {isLoading ? 'Sending...' : 'Send Recovery Link'}
              </button>
            </form>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <Link 
                href="/auth/signin"
                className="inline-flex items-center text-blue-300 hover:text-blue-200 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </Link>
            </div>
          </>
        )}

        {/* Security Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-blue-200/40 text-xs">
            Secured with AES-256 encryption and SOC 2 compliance
          </p>
        </div>
      </div>
    </div>
  );
}
