'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, CheckCircle2, ChevronRight, User2, Info, 
  Shield, Sparkles, Calendar, CreditCard, Briefcase, 
  DollarSign, Fingerprint, Lock, BadgeCheck, ArrowRight,
  Cake, TrendingUp, Building2, XCircle
} from 'lucide-react';
import api from '@/lib/api';
import { BorrowerProfile } from '@/types';

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [breErrors, setBreErrors] = useState<string[]>([]);
  const [form, setForm] = useState({
    fullName: '', pan: '', dateOfBirth: '',
    monthlySalary: '', employmentMode: '',
  });

  useEffect(() => {
    api.get<{ success: boolean; data: BorrowerProfile | null }>('/borrower/profile')
      .then(({ data }) => {
        const p = data.data;
        if (p) {
          setForm({
            fullName: p.fullName || '',
            pan: p.pan || '',
            dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
            monthlySalary: p.monthlySalary?.toString() || '',
            employmentMode: p.employmentMode || '',
          });
          if (p.breStatus === 'failed') setBreErrors(p.breRejectionReasons);
          if (p.breStatus === 'passed') router.replace('/borrower/upload');
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [router]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBreErrors([]);
    setLoading(true);
    try {
      await api.post('/borrower/personal-details', {
        ...form, monthlySalary: Number(form.monthlySalary),
      });
      toast.success('Eligibility check passed! Proceeding to upload.');
      router.push('/borrower/upload');
    } catch (err: any) {
      const resp = err.response?.data;
      if (resp?.data?.breRejectionReasons?.length) {
        setBreErrors(resp.data.breRejectionReasons);
        toast.error('Eligibility check failed. See details below.');
      } else {
        toast.error(resp?.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-indigo-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-4">
            <Shield size={16} className="text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Secure Verification Process</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Verify Your Identity
          </h1>
          <p className="text-gray-600 mt-2">Complete your profile for instant eligibility check</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* BRE Rejection Banner */}
            <AnimatePresence>
              {breErrors.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-2xl p-5 shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-30"></div>
                      <div className="relative w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <AlertTriangle size={18} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-red-800">Eligibility Check Failed</p>
                      <p className="text-xs text-red-600">Please fix the issues below and resubmit.</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {breErrors.map((e, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2 text-sm text-red-700 bg-white/50 rounded-lg p-2"
                      >
                        <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                        {e}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Form Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User2 size={22} className="text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-500">Fill in your details for eligibility check</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <motion.div whileHover={{ scale: 1.02 }} className="group">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      <User2 size={14} className="inline mr-1 text-indigo-500" />
                      Full Name *
                    </label>
                    <input 
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white/50"
                      placeholder="As per PAN card" 
                      value={form.fullName}
                      onChange={(e) => set('fullName', e.target.value)} 
                      required 
                    />
                  </motion.div>

                  {/* PAN Number */}
                  <motion.div whileHover={{ scale: 1.02 }} className="group">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      <CreditCard size={14} className="inline mr-1 text-indigo-500" />
                      PAN Number *
                    </label>
                    <input 
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white/50 uppercase tracking-wider font-mono"
                      placeholder="ABCDE1234F" 
                      maxLength={10}
                      value={form.pan} 
                      onChange={(e) => set('pan', e.target.value.toUpperCase())} 
                      required 
                    />
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Fingerprint size={10} /> Format: 5 letters + 4 digits + 1 letter
                    </p>
                  </motion.div>

                  {/* Date of Birth */}
                  <motion.div whileHover={{ scale: 1.02 }} className="group">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      <Cake size={14} className="inline mr-1 text-indigo-500" />
                      Date of Birth *
                    </label>
                    <input 
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white/50"
                      type="date" 
                      value={form.dateOfBirth}
                      onChange={(e) => set('dateOfBirth', e.target.value)} 
                      required 
                    />
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar size={10} /> Must be between 23–50 years old
                    </p>
                  </motion.div>

                  {/* Monthly Salary */}
                  <motion.div whileHover={{ scale: 1.02 }} className="group">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      <DollarSign size={14} className="inline mr-1 text-indigo-500" />
                      Monthly Salary (₹) *
                    </label>
                    <input 
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white/50"
                      type="number" 
                      min={0} 
                      placeholder="e.g. 50000" 
                      value={form.monthlySalary}
                      onChange={(e) => set('monthlySalary', e.target.value)} 
                      required 
                    />
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <TrendingUp size={10} /> Minimum ₹25,000 required
                    </p>
                  </motion.div>
                </div>

                {/* Employment Mode */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-3">
                    <Briefcase size={14} className="inline mr-1 text-indigo-500" />
                    Employment Mode *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { v: 'salaried', l: '💼 Salaried', icon: Building2, gradient: 'from-blue-500 to-cyan-500' },
                      { v: 'self_employed', l: '🏢 Self-Employed', icon: Briefcase, gradient: 'from-purple-500 to-pink-500' },
                      { v: 'unemployed', l: '❌ Unemployed', icon: XCircle, gradient: 'from-red-500 to-orange-500' },
                    ].map(({ v, l, icon: Icon, gradient }) => (
                      <motion.button 
                        key={v} 
                        type="button" 
                        onClick={() => set('employmentMode', v)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all overflow-hidden ${
                          form.employmentMode === v
                            ? v === 'unemployed'
                              ? 'border-red-500 bg-gradient-to-r from-red-50 to-orange-50 text-red-700 shadow-md'
                              : `border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-md`
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md bg-white/50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Icon size={18} />
                          <span>{l}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {form.employmentMode === 'unemployed' && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs text-red-600 mt-2 flex items-center gap-1 bg-red-50 p-2 rounded-lg"
                      >
                        <AlertTriangle size={12} /> Unemployed applicants are not eligible for loans.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Button */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading || !form.employmentMode} 
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Running Eligibility Check...
                    </>
                  ) : (
                    <>
                      <BadgeCheck size={18} />
                      Check Eligibility & Continue
                      <ChevronRight size={16} />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Right Column - Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Eligibility Criteria Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={20} className="text-yellow-400" />
                  <h3 className="font-bold text-xl">Eligibility Criteria</h3>
                </div>
                
                <p className="text-sm text-indigo-200 mb-4">Powered by Business Rule Engine</p>
                
                <div className="space-y-3">
                  {[
                    { icon: Cake, rule: 'Age', cond: '23 to 50 years', gradient: 'from-pink-500 to-rose-500' },
                    { icon: TrendingUp, rule: 'Salary', cond: '≥ ₹25,000/month', gradient: 'from-emerald-500 to-teal-500' },
                    { icon: Fingerprint, rule: 'PAN', cond: 'Valid format (ABCDE1234F)', gradient: 'from-blue-500 to-cyan-500' },
                    { icon: Briefcase, rule: 'Employment', cond: 'Salaried or Self-Employed', gradient: 'from-purple-500 to-indigo-500' },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.rule}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${item.gradient} rounded-lg flex items-center justify-center`}>
                          <item.icon size={14} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-indigo-200">{item.rule}</p>
                          <p className="text-sm font-semibold">{item.cond}</p>
                        </div>
                        <CheckCircle2 size={16} className="text-green-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Lock size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Secure & Encrypted</p>
                  <p className="text-xs text-gray-500">Your data is safe with us</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Shield size={12} />
                <span>Bank-grade encryption • GDPR compliant • Secure servers</span>
              </div>
            </motion.div>

            {/* Info Box */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-200"
            >
              <div className="flex items-start gap-3">
                <Info size={18} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-2">Why we need this information?</p>
                  <p className="text-xs text-blue-700">
                    Your details are used for instant eligibility check through our automated 
                    Business Rule Engine. All checks run on the server to prevent bypass.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-1/4 h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
              </div>
              <p className="text-xs text-gray-500">Step 1 of 3</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}