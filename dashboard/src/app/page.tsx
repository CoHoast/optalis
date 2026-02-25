'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <img 
            src="https://www.optalishealthcare.com/wp-content/uploads/2023/03/optalis_logonav.webp" 
            alt="Optalis Healthcare" 
            className="h-16 w-auto mb-8 brightness-0 invert"
          />
          <h1 className="text-4xl font-serif text-white mb-4">
            Admissions Portal
          </h1>
          <p className="text-xl text-white/80">
            Streamline patient admissions with intelligent document processing and workflow management.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>AI-powered document extraction</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Real-time application tracking</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Seamless CRM integration</span>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <img 
              src="https://www.optalishealthcare.com/wp-content/uploads/2023/03/optalis_logonav.webp" 
              alt="Optalis Healthcare" 
              className="h-12 mx-auto mb-4"
            />
            <h1 className="text-2xl font-serif text-primary">Admissions Portal</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-soft-lg p-8">
            <h2 className="text-2xl font-serif text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500 mb-8">Sign in to access the admissions dashboard</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  defaultValue="jennifer.walsh@optalis.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="you@optalis.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  defaultValue="demo123"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded border-gray-300" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Need help? Contact{' '}
              <a href="mailto:support@optalis.com" className="text-primary hover:underline">
                IT Support
              </a>
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            © 2026 Optalis Healthcare. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
