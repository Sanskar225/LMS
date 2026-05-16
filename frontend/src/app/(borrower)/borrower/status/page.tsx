'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, CheckCircle2, XCircle, Banknote, Lock, PlusCircle, RefreshCw,
  TrendingUp, Calendar, Percent, Wallet, ArrowRight, Sparkles,
  Award, Trophy, Star, Rocket, Shield, Zap, Gem, BarChart3,
  CircleDollarSign, PiggyBank, Target, Flag
} from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate, STATUS_BADGE } from '@/lib/utils';
import { Loan } from '@/types';

const STATUS_META: Record<string, { icon: any; label: string; desc: string; color: string; gradient: string }> = {
  applied:    { icon: Clock, label: 'Under Review', desc: 'Your application is being reviewed by our team.', color: 'text-blue-600', gradient: 'from-blue-500 to-cyan-500' },
  sanctioned: { icon: CheckCircle2, label: 'Sanctioned', desc: 'Loan approved! Awaiting fund disbursement.', color: 'text-amber-600', gradient: 'from-amber-500 to-orange-500' },
  rejected:   { icon: XCircle, label: 'Rejected', desc: 'Your application was not approved.', color: 'text-red-600', gradient: 'from-red-500 to-pink-500' },
  disbursed:  { icon: Banknote, label: 'Disbursed', desc: 'Funds have been released. Repayment is in progress.', color: 'text-purple-600', gradient: 'from-purple-500 to-indigo-500' },
  closed:     { icon: Lock, label: 'Fully Repaid', desc: 'Loan fully repaid. Congratulations! 🎉', color: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-500' },
};

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value, color, gradient }: any) => (
  <motion.div 
    whileHover={{ scale: 1.02, y: -2 }}
    className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white shadow-lg`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs opacity-90">{label}</p>
        <p className="text-xl font-bold mt-1">{value}</p>
      </div>
      <Icon size={24} className="opacity-80" />
    </div>
  </motion.div>
);

export default function StatusPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = () => {
    setLoading(true);
    api.get('/loans/my-loans').then(({ data }) => setLoans(data.data))
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, []);

  const hasActive = loans.some((l) => ['applied','sanctioned','disbursed'].includes(l.status));
  
  // Calculate overall stats
  const totalBorrowed = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalRepaid = loans.reduce((sum, l) => sum + l.totalPaid, 0);
  const activeLoans = loans.filter(l => ['disbursed'].includes(l.status)).length;
  const completedLoans = loans.filter(l => l.status === 'closed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-4">
                <Rocket size={16} className="text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Loan Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                My Loan Journey
              </h1>
              <p className="text-gray-600 mt-2">Track and manage all your loan applications</p>
            </div>
            <div className="flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchLoans} 
                className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl font-medium text-gray-700 hover:bg-white shadow-sm transition-all flex items-center gap-2"
              >
                <RefreshCw size={16} /> Refresh
              </motion.button>
              {!hasActive && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/borrower/personal-details')} 
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <PlusCircle size={16} /> New Loan
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards - Only show if there are loans */}
        {!loading && loans.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <StatsCard icon={Wallet} label="Total Borrowed" value={formatCurrency(totalBorrowed)} gradient="from-indigo-500 to-purple-500" />
            <StatsCard icon={PiggyBank} label="Total Repaid" value={formatCurrency(totalRepaid)} gradient="from-emerald-500 to-teal-500" />
            <StatsCard icon={Target} label="Active Loans" value={activeLoans} gradient="from-blue-500 to-cyan-500" />
            <StatsCard icon={Trophy} label="Completed" value={completedLoans} gradient="from-orange-500 to-red-500" />
          </motion.div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-indigo-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </motion.div>
          ) : loans.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 text-center py-16 px-4"
            >
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-2xl opacity-20"></div>
                <Banknote size={64} className="relative text-gray-300 mx-auto" />
              </div>
              <p className="text-gray-500 font-medium text-lg">No loan applications yet.</p>
              <p className="text-sm text-gray-400 mt-1">Start your financial journey with us</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/borrower/personal-details')} 
                className="btn-md btn-primary mt-6 inline-flex items-center gap-2"
              >
                Apply Now <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              {loans.map((loan, index) => {
                const meta = STATUS_META[loan.status];
                const Icon = meta.icon;
                const pct = loan.totalRepayment > 0 ? Math.min(100, (loan.totalPaid / loan.totalRepayment) * 100) : 0;
                
                return (
                  <motion.div
                    key={loan._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Header with Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`absolute inset-0 bg-gradient-to-r ${meta.gradient} rounded-2xl blur-lg opacity-30`}></div>
                          <div className={`relative w-14 h-14 bg-gradient-to-br ${meta.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                            <Icon size={24} className="text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`badge ${STATUS_BADGE[loan.status]} text-sm px-3 py-1`}>
                              {loan.status.toUpperCase()}
                            </span>
                            {loan.status === 'closed' && <Sparkles size={14} className="text-emerald-500" />}
                          </div>
                          <p className="text-sm text-gray-600">{meta.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar size={14} />
                        <span>{formatDate(loan.createdAt)}</span>
                      </div>
                    </div>

                    {/* Loan Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                        <div className="flex items-center gap-1 mb-1">
                          <CircleDollarSign size={12} className="text-indigo-500" />
                          <p className="text-xs text-gray-500">Principal</p>
                        </div>
                        <p className="font-bold text-gray-800">{formatCurrency(loan.principalAmount)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar size={12} className="text-indigo-500" />
                          <p className="text-xs text-gray-500">Tenure</p>
                        </div>
                        <p className="font-bold text-gray-800">{loan.tenureDays} <span className="text-xs font-normal">days</span></p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                        <div className="flex items-center gap-1 mb-1">
                          <Percent size={12} className="text-indigo-500" />
                          <p className="text-xs text-gray-500">Interest (12% SI)</p>
                        </div>
                        <p className="font-bold text-gray-800">{formatCurrency(loan.simpleInterest)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-200">
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp size={12} className="text-indigo-600" />
                          <p className="text-xs text-gray-600">Total Repayment</p>
                        </div>
                        <p className="font-bold text-indigo-700">{formatCurrency(loan.totalRepayment)}</p>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {loan.status === 'rejected' && loan.rejectionReason && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4"
                      >
                        <div className="flex items-start gap-2">
                          <XCircle size={16} className="text-red-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
                            <p className="text-sm text-red-600">{loan.rejectionReason}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Payment Progress for Active Loans */}
                    {(loan.status === 'disbursed' || loan.status === 'closed') && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-5 pt-4 border-t border-gray-200"
                      >
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-200">
                            <p className="text-xs text-gray-600 mb-0.5">Total Paid</p>
                            <p className="font-bold text-emerald-700">{formatCurrency(loan.totalPaid)}</p>
                          </div>
                          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-200">
                            <p className="text-xs text-gray-600 mb-0.5">Outstanding</p>
                            <p className="font-bold text-orange-700">{formatCurrency(loan.outstandingBalance)}</p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-200">
                            <p className="text-xs text-gray-600 mb-0.5">Payments Made</p>
                            <p className="font-bold text-blue-700">{loan.payments?.length || 0}</p>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-2">
                            <span className="flex items-center gap-1">
                              <Flag size={12} /> Repayment Progress
                            </span>
                            <span className="font-semibold">{pct.toFixed(1)}%</span>
                          </div>
                          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`absolute h-full rounded-full transition-all ${
                                loan.status === 'closed' 
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                  : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {loan.status === 'closed' && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="mt-3 text-center"
                            >
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full">
                                <Award size={14} className="text-emerald-600" />
                                <span className="text-xs font-semibold text-emerald-700">Loan Fully Repaid! 🎉</span>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Quick Action for Sanctioned Loans */}
                    {loan.status === 'sanctioned' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 pt-3 text-center"
                      >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-200">
                          <Shield size={14} className="text-amber-600" />
                          <span className="text-xs text-amber-700">Awaiting disbursement - Funds will be credited soon</span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Badge */}
        {!loading && loans.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full">
              <Shield size={14} className="text-indigo-500" />
              <p className="text-xs text-gray-500">Your loans are secured and monitored 24/7</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}