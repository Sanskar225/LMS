'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Building2, Lock, Mail, User, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.role === 'borrower' ? '/borrower/personal-details' : '/dashboard');
    }
  }, [user, isLoading, router]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin ? { email: form.email, password: form.password } : form;
      const { data } = await api.post(url, body);
      login(data.data.token, data.data.user);
      toast.success(data.message);
      const role = data.data.user.role;
      router.push(role === 'borrower' ? '/borrower/personal-details' : '/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const DEMO_CREDS = [
    { role: 'Admin',        email: 'admin@lms.com',    pass: 'Admin@123' },
    { role: 'Sales',        email: 'sales@lms.com',    pass: 'Sales@123' },
    { role: 'Sanction',     email: 'sanction@lms.com', pass: 'Sanction@123' },
    { role: 'Disbursement', email: 'disburse@lms.com', pass: 'Disburse@123' },
    { role: 'Collection',   email: 'collect@lms.com',  pass: 'Collect@123' },
    { role: 'Borrower',     email: 'borrower@lms.com', pass: 'Borrower@123' },
  ];

  const quickLogin = (email: string, pass: string) => {
    setForm({ name: '', email, password: pass });
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Branding */}
        <div className="flex flex-col justify-center text-white px-4 py-8 lg:py-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">LoanPro</h1>
              <p className="text-blue-300 text-sm">Loan Management System</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Streamlined <span className="text-blue-400">Lending</span> for Everyone
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            A complete loan lifecycle management platform — from borrower application to collection.
          </p>

          {/* Workflow steps */}
          <div className="space-y-3">
            {[
              { step: 1, label: 'Apply', desc: 'Borrower submits application' },
              { step: 2, label: 'Sanction', desc: 'Officer reviews & approves' },
              { step: 3, label: 'Disburse', desc: 'Funds released to borrower' },
              { step: 4, label: 'Collect', desc: 'Payments tracked & closed' },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <span className="font-semibold text-white">{s.label}</span>
                  <span className="text-slate-400 text-sm ml-2">— {s.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick login buttons */}
          <div className="mt-8">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">Quick Login (Demo)</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_CREDS.map((c) => (
                <button key={c.role} onClick={() => quickLogin(c.email, c.pass)}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white py-1.5 px-2 rounded-lg transition-all font-medium truncate">
                  {c.role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-7">
            {['Sign In', 'Register'].map((tab) => (
              <button key={tab} onClick={() => { setIsLogin(tab === 'Sign In'); setForm({ name: '', email: '', password: '' }); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  (isLogin && tab === 'Sign In') || (!isLogin && tab === 'Register')
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {tab}
              </button>
            ))}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {isLogin ? 'Sign in to access your account' : 'Register as a borrower to apply for a loan'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input className="input pl-9" placeholder="John Doe" value={form.name}
                    onChange={(e) => set('name', e.target.value)} required />
                </div>
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input className="input pl-9" type="email" placeholder="you@example.com" value={form.email}
                  onChange={(e) => set('email', e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input className="input pl-9 pr-10" type={showPass ? 'text' : 'password'}
                  placeholder={isLogin ? 'Enter password' : 'Min 6 characters'} value={form.password}
                  onChange={(e) => set('password', e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-md btn-primary w-full mt-2 text-base py-3">
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Processing...</>
              ) : (
                <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-semibold hover:underline">
              {isLogin ? 'Register here' : 'Sign in'}
            </button>
          </p>

          {/* Credential table */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Demo Credentials</p>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Role</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Email</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Password</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_CREDS.map((c, i) => (
                    <tr key={c.role} onClick={() => quickLogin(c.email, c.pass)}
                      className={`cursor-pointer hover:bg-blue-50 transition-colors ${i % 2 === 0 ? '' : 'bg-white'}`}>
                      <td className="px-3 py-1.5 font-medium text-gray-700">{c.role}</td>
                      <td className="px-3 py-1.5 text-gray-600">{c.email}</td>
                      <td className="px-3 py-1.5 font-mono text-gray-600">{c.pass}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-center text-xs text-gray-400 py-1.5">Click any row to auto-fill</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
