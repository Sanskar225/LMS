'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Calculator, ArrowLeft, IndianRupee, Clock, TrendingUp, CheckCircle2, Sparkles, Shield, Zap, Gem } from 'lucide-react';
import api from '@/lib/api';
import { calculateLoan, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoanConfigPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [principal, setPrincipal] = useState(150000);
  const [tenure, setTenure] = useState(180);
  const principalRef = useRef<HTMLInputElement>(null);
  const tenureRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      api.get('/borrower/profile'),
      api.get('/loans/my-loans'),
    ]).then(([profileRes, loanRes]) => {
      const p = profileRes.data.data;
      if (!p || p.breStatus !== 'passed') { router.replace('/borrower/personal-details'); return; }
      if (!p.salarySlipUrl) { router.replace('/borrower/upload'); return; }
      const active = loanRes.data.data.find((l: any) => ['applied','sanctioned','disbursed'].includes(l.status));
      if (active) { router.replace('/borrower/status'); }
    }).catch(() => router.replace('/borrower/personal-details'))
      .finally(() => setChecking(false));
  }, [router]);

  const { simpleInterest, totalRepayment } = calculateLoan(principal, tenure);
  const interestRate = 12;
  const emiApprox = totalRepayment / tenure;

  // Update CSS custom property for slider fill
  const principalPct = ((principal - 50000) / (500000 - 50000)) * 100;
  const tenurePct = ((tenure - 30) / (365 - 30)) * 100;

  const handleApply = async () => {
    setLoading(true);
    try {
      await api.post('/loans/apply', { principalAmount: principal, tenureDays: tenure });
      toast.success('Loan application submitted successfully!');
      router.push('/borrower/status');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to apply.');
    } finally { setLoading(false); }
  };

  if (checking) return (
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
        {/* Header with animated gradient */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-4">
            <Gem size={16} className="text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Smart Loan Configurator</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Design Your Loan
          </h1>
          <p className="text-gray-600 mt-2">Adjust sliders to see instant calculations</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Premium Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calculator size={22} className="text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Configure Parameters</h2>
                  <p className="text-sm text-gray-500">Fine-tune your loan details</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Principal slider */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block">Loan Amount</label>
                      <span className="text-xs text-gray-500">₹50,000 - ₹5,00,000</span>
                    </div>
                    <motion.div 
                      key={principal}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-right"
                    >
                      <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {formatCurrency(principal)}
                      </span>
                    </motion.div>
                  </div>
                  <div className="relative pt-2">
                    <input
                      ref={principalRef}
                      type="range" 
                      min={50000} 
                      max={500000} 
                      step={5000}
                      value={principal}
                      style={{ '--pct': `${principalPct}%` } as React.CSSProperties}
                      onChange={(e) => setPrincipal(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-indigo-600 [&::-webkit-slider-thumb]:to-purple-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="absolute h-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 pointer-events-none" style={{ width: `${principalPct}%`, top: '8px' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>₹50k</span>
                    <span className="text-indigo-600 font-semibold">12% p.a.</span>
                    <span>₹500k</span>
                  </div>
                </div>

                {/* Tenure slider */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block">Loan Tenure</label>
                      <span className="text-xs text-gray-500">30 - 365 days</span>
                    </div>
                    <motion.div 
                      key={tenure}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-right"
                    >
                      <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {tenure} days
                      </span>
                    </motion.div>
                  </div>
                  <div className="relative pt-2">
                    <input
                      ref={tenureRef}
                      type="range" 
                      min={30} 
                      max={365} 
                      step={5}
                      value={tenure}
                      style={{ '--pct': `${tenurePct}%` } as React.CSSProperties}
                      onChange={(e) => setTenure(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="absolute h-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 pointer-events-none" style={{ width: `${tenurePct}%`, top: '8px' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>30 days</span>
                    <span>~{Math.floor(tenure/30)} months</span>
                    <span>365 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: 'Zero Processing Fee', color: 'from-emerald-500 to-teal-500' },
                { icon: Zap, label: 'Instant Approval', color: 'from-orange-500 to-red-500' },
                { icon: Clock, label: 'Flexible Tenure', color: 'from-blue-500 to-cyan-500' },
                { icon: TrendingUp, label: 'Best Interest Rates', color: 'from-purple-500 to-pink-500' }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50 hover:shadow-lg transition-all"
                >
                  <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-2`}>
                    <feature.icon size={18} className="text-white" />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{feature.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Live Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Premium Summary Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 rounded-3xl shadow-2xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles size={20} className="text-yellow-400" />
                  <h3 className="font-bold text-xl">Live Loan Summary</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <IndianRupee size={14} className="text-indigo-300" />
                      <p className="text-xs text-indigo-300 font-medium">Principal</p>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(principal)}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={14} className="text-indigo-300" />
                      <p className="text-xs text-indigo-300 font-medium">Tenure</p>
                    </div>
                    <p className="text-2xl font-bold">{tenure} <span className="text-sm">days</span></p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={14} className="text-indigo-300" />
                      <p className="text-xs text-indigo-300 font-medium">Interest</p>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(simpleInterest)}</p>
                    <p className="text-xs text-indigo-300 mt-1">@12% p.a.</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={14} className="text-white" />
                      <p className="text-xs text-white/90 font-medium">Total Repayment</p>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(totalRepayment)}</p>
                  </div>
                </div>

                {/* Daily EMI Estimate */}
                <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-indigo-300">Daily EMI Estimate</p>
                      <p className="text-sm text-white/70">≈ {formatCurrency(emiApprox)} per day</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-indigo-300">Effective Interest</p>
                      <p className="text-sm font-semibold text-white">₹{simpleInterest.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Formula Display */}
                <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/10">
                  <p className="text-xs text-indigo-300 font-mono">
                    SI = (P × R × T) / 36,500
                  </p>
                  <p className="text-xs text-indigo-400 mt-1">
                    = ({formatCurrency(principal)} × 12 × {tenure}) / 36,500
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/borrower/upload')} 
                className="px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:border-indigo-300 hover:shadow-lg transition-all flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Back
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApply} 
                disabled={loading} 
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Apply for {formatCurrency(totalRepayment)}
                  </>
                )}
              </motion.button>
            </div>

            {/* Trust Badge */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                <Shield size={12} />
                Your information is secure with bank-grade encryption
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          background: transparent;
        }
        input[type="range"]:focus {
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #9333ea);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
}