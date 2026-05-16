'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Building2, Shield, User, Loader2, Sparkles, Zap } from 'lucide-react';

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);
    
    if (!user) { 
      setTimeout(() => router.replace('/auth'), 500);
    } else if (user.role === 'borrower') {
      setTimeout(() => router.replace('/borrower/personal-details'), 500);
    } else {
      setTimeout(() => router.replace('/dashboard'), 500);
    }
    
    return () => clearInterval(interval);
  }, [user, isLoading, router]);

  // Complete progress on redirect
  useEffect(() => {
    if (user !== undefined) {
      setProgress(100);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="relative">
        {/* Animated Background Circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        {/* Main Card */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center min-w-[320px] border border-white/50">
          {/* Logo Animation */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 size={36} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            LoanPro
          </h1>
          <p className="text-sm text-gray-500 mb-6">Smart Lending Platform</p>

          {/* Loading Indicator */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Loader2 size={20} className="text-indigo-600 animate-spin" />
              <span className="text-sm text-gray-600">
                {!user ? 'Redirecting to login...' : 'Loading your dashboard...'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Loading Tips */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                <Sparkles size={12} />
                <span>Securely connecting you</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role Badge Animation (shows when user is detected) */}
        {user && (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
              user.role === 'borrower' 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            }`}>
              {user.role === 'borrower' ? <User size={10} /> : <Shield size={10} />}
              <span>{user.role.toUpperCase()} Access</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}