'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle } from 'lucide-react';

export default function MFAPage() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // TODO: Implement actual MFA verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success for demo code
      if (code === '123456') {
        setMessage({ type: 'success', text: 'Verification successful!' });
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setMessage({ type: 'error', text: 'Invalid code. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Verification failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    // Only allow numbers and max 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
    
    // Auto-submit when 6 digits are entered
    if (numericValue.length === 6) {
      setCode(numericValue);
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
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Check</h1>
          <p className="text-blue-200">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-200' :
            'bg-green-500/20 border border-green-500/30 text-green-200'
          }`}>
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* MFA Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6-Digit Code Input */}
          <div>
            <div className="flex justify-center space-x-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="w-14 h-14 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg flex items-center justify-center"
                >
                  <span className="text-2xl font-bold text-white">
                    {code[index] || ''}
                  </span>
                </div>
              ))}
            </div>
            
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="sr-only"
              maxLength={6}
              autoFocus
            />
            
            <p className="text-center text-blue-200/60 text-sm">
              Demo code: 123456
            </p>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            {isLoading ? 'Verifying...' : 'Verify Identity'}
          </button>
        </form>

        {/* Resend Code */}
        <div className="mt-6 text-center">
          <button className="text-blue-300 hover:text-blue-200 text-sm transition-colors">
            Resend code
          </button>
        </div>

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
