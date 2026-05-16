'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, RefreshCw, CheckSquare, AlertTriangle, User, Mail, Calendar, Briefcase, DollarSign, CreditCard, Clock, Shield, FileText, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';

interface EnrichedLoan {
  _id: string;
  borrowerId: { _id: string; name: string; email: string };
  borrowerProfile?: {
    pan: string;
    monthlySalary: number;
    employmentMode: string;
    dateOfBirth: string;
    salarySlipUrl?: string;
  };
  principalAmount: number;
  tenureDays: number;
  simpleInterest: number;
  totalRepayment: number;
  status: string;
  createdAt: string;
}

type ModalType = { loan: EnrichedLoan; action: 'approve' | 'reject' } | null;

export default function SanctionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loans, setLoans] = useState<EnrichedLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user && !['admin','sanction'].includes(user.role)) { router.replace('/dashboard'); return; }
    fetchLoans();
  }, [user]);

  const fetchLoans = () => {
    setLoading(true);
    api.get('/loans/sanction/applied')
      .then(({ data }) => setLoans(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const openModal = (loan: EnrichedLoan, action: 'approve' | 'reject') => {
    setModal({ loan, action });
    setReason('');
  };

  const handleAction = async () => {
    if (!modal) return;
    if (modal.action === 'reject' && reason.trim().length < 5) {
      toast.error('Please provide a rejection reason (min 5 characters).'); return;
    }
    setProcessing(true);
    try {
      await api.patch(`/loans/sanction/${modal.loan._id}`, {
        action: modal.action === 'approve' ? 'approve' : 'reject',
        rejectionReason: reason,
      });
      toast.success(modal.action === 'approve' ? '✅ Loan sanctioned!' : '❌ Loan rejected.');
      setModal(null);
      fetchLoans();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setProcessing(false);
    }
  };

  function calcAge(dob: string) {
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  // Calculate summary stats
  const totalPrincipal = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalInterest = loans.reduce((sum, l) => sum + l.simpleInterest, 0);
  const avgTenure = loans.reduce((sum, l) => sum + l.tenureDays, 0) / (loans.length || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-4">
              <Shield size={16} className="text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Sanction Dashboard</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Loan Review & Sanction
            </h1>
            <p className="text-gray-600 mt-2">Review and approve or reject loan applications</p>
          </div>
          <button 
            onClick={fetchLoans} 
            className="px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl font-medium text-gray-700 hover:bg-white shadow-sm transition-all flex items-center gap-2 border border-gray-200 self-start"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Summary Cards - Only show if there are loans */}
        {!loading && loans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <CreditCard size={24} className="opacity-80" />
                  <span className="text-xs opacity-80">Pending Review</span>
                </div>
                <p className="text-3xl font-bold">{loans.length}</p>
                <p className="text-xs opacity-80 mt-1">Applications to review</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <DollarSign size={24} className="opacity-80" />
                  <span className="text-xs opacity-80">Total Principal</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(totalPrincipal)}</p>
                <p className="text-xs opacity-80 mt-1">Awaiting decision</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp size={24} className="opacity-80" />
                  <span className="text-xs opacity-80">Total Interest</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(totalInterest)}</p>
                <p className="text-xs opacity-80 mt-1">@12% p.a.</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-indigo-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : loans.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 text-center py-16">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full blur-2xl opacity-20"></div>
              <CheckSquare size={64} className="relative text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-lg">No pending applications to review.</p>
            <p className="text-gray-400 text-sm mt-1">Check back later or refresh the page.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {loans.map((loan, index) => (
              <div key={loan._id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
                {/* Borrower Header */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 text-lg">{loan.borrowerId.name}</p>
                          <span className="badge bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200">
                            APPLIED
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-500">{loan.borrowerId.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Borrower Profile Details */}
                    {loan.borrowerProfile && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700">
                          <FileText size={12} className="text-gray-500" />
                          <span>PAN: <strong>{loan.borrowerProfile.pan}</strong></span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700">
                          <Calendar size={12} className="text-gray-500" />
                          <span>Age: <strong>{calcAge(loan.borrowerProfile.dateOfBirth)} yrs</strong></span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700 capitalize">
                          <Briefcase size={12} className="text-gray-500" />
                          <span>{loan.borrowerProfile.employmentMode?.replace('_', ' ')}</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700">
                          <DollarSign size={12} className="text-gray-500" />
                          <span>Salary: <strong>{formatCurrency(loan.borrowerProfile.monthlySalary)}/mo</strong></span>
                        </div>
                        {loan.borrowerProfile.salarySlipUrl && (
                          <a href={`http://localhost:5000${loan.borrowerProfile.salarySlipUrl}`}
                            target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 transition-colors">
                            <FileText size={12} /> View Salary Slip
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>Applied: {formatDate(loan.createdAt)}</span>
                    </div>
                  </div>

                  {/* Loan Amount Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-[320px]">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 text-center border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Principal</p>
                      <p className="font-bold text-gray-800">{formatCurrency(loan.principalAmount)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 text-center border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Tenure</p>
                      <p className="font-bold text-gray-800">{loan.tenureDays} <span className="text-xs">days</span></p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 text-center border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Interest (12%)</p>
                      <p className="font-bold text-gray-800">{formatCurrency(loan.simpleInterest)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-3 text-center border border-purple-200">
                      <p className="text-xs text-gray-500 mb-1">Total Due</p>
                      <p className="font-bold text-purple-700">{formatCurrency(loan.totalRepayment)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => openModal(loan, 'approve')}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} /> Approve Loan
                  </button>
                  <button 
                    onClick={() => openModal(loan, 'reject')}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} /> Reject Loan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirm Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up">
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  modal.action === 'approve' 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                    : 'bg-gradient-to-br from-red-500 to-pink-500'
                }`}>
                  {modal.action === 'approve'
                    ? <CheckCircle2 size={22} className="text-white" />
                    : <XCircle size={22} className="text-white" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {modal.action === 'approve' ? 'Approve Loan' : 'Reject Loan'}
                  </h3>
                  <p className="text-sm text-gray-500">{modal.loan.borrowerId.name}</p>
                </div>
              </div>

              {/* Loan Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Principal Amount</span>
                  <strong className="text-gray-900">{formatCurrency(modal.loan.principalAmount)}</strong>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tenure</span>
                  <strong className="text-gray-900">{modal.loan.tenureDays} days</strong>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Interest (12% SI)</span>
                  <strong className="text-gray-900">{formatCurrency(modal.loan.simpleInterest)}</strong>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-700">Total Repayment</span>
                  <strong className="text-lg font-bold text-purple-700">{formatCurrency(modal.loan.totalRepayment)}</strong>
                </div>
              </div>

              {/* Rejection Reason Input */}
              {modal.action === 'reject' && (
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none resize-none min-h-[100px]"
                    placeholder="Provide a clear reason for rejection (min 5 characters)…"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">This reason will be shared with the borrower</p>
                </div>
              )}

              {/* Warning for Approval */}
              {modal.action === 'approve' && (
                <div className="flex items-start gap-2 mb-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3">
                  <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700 mb-0.5">⚠️ Action cannot be undone</p>
                    <p className="text-xs text-amber-600">
                      By approving, this loan will move to <strong>Disbursement queue</strong> for fund release.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => setModal(null)} 
                  className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={processing}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                    modal.action === 'approve' 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
                      : 'bg-gradient-to-r from-red-600 to-pink-600'
                  }`}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Processing...
                    </>
                  ) : (
                    modal.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}