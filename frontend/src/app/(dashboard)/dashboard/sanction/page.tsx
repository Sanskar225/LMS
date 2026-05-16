'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, RefreshCw, CheckSquare, AlertTriangle } from 'lucide-react';
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Sanction — Loan Review</h1>
          <p className="page-subtitle">Review and approve or reject loan applications</p>
        </div>
        <button onClick={fetchLoans} className="btn-md btn-secondary">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : loans.length === 0 ? (
        <div className="card text-center py-16">
          <CheckSquare size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No pending applications to review.</p>
          <p className="text-gray-400 text-sm mt-1">Check back later or refresh.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <div key={loan._id} className="card animate-slide-up">
              <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                {/* Borrower info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <p className="font-semibold text-gray-900">{loan.borrowerId.name}</p>
                    <span className="badge bg-blue-100 text-blue-700">APPLIED</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{loan.borrowerId.email}</p>

                  {loan.borrowerProfile && (
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="bg-gray-100 rounded-full px-2.5 py-1 text-gray-700">
                        PAN: <strong>{loan.borrowerProfile.pan}</strong>
                      </span>
                      <span className="bg-gray-100 rounded-full px-2.5 py-1 text-gray-700">
                        Age: <strong>{calcAge(loan.borrowerProfile.dateOfBirth)} yrs</strong>
                      </span>
                      <span className="bg-gray-100 rounded-full px-2.5 py-1 text-gray-700 capitalize">
                        {loan.borrowerProfile.employmentMode?.replace('_', ' ')}
                      </span>
                      <span className="bg-gray-100 rounded-full px-2.5 py-1 text-gray-700">
                        Salary: <strong>{formatCurrency(loan.borrowerProfile.monthlySalary)}/mo</strong>
                      </span>
                      {loan.borrowerProfile.salarySlipUrl && (
                        <a href={`http://localhost:5000${loan.borrowerProfile.salarySlipUrl}`}
                          target="_blank" rel="noreferrer"
                          className="bg-blue-100 text-blue-700 rounded-full px-2.5 py-1 hover:bg-blue-200 transition-colors">
                          📄 View Salary Slip
                        </a>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">Applied: {formatDate(loan.createdAt)}</p>
                </div>

                {/* Loan numbers */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:min-w-[340px]">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">Principal</p>
                    <p className="font-bold text-sm">{formatCurrency(loan.principalAmount)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">Tenure</p>
                    <p className="font-bold text-sm">{loan.tenureDays} days</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">Interest</p>
                    <p className="font-bold text-sm">{formatCurrency(loan.simpleInterest)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">Total Due</p>
                    <p className="font-bold text-sm text-blue-700">{formatCurrency(loan.totalRepayment)}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button onClick={() => openModal(loan, 'approve')}
                  className="btn-md btn-success flex-1">
                  <CheckCircle2 size={16} /> Approve Loan
                </button>
                <button onClick={() => openModal(loan, 'reject')}
                  className="btn-md btn-danger flex-1">
                  <XCircle size={16} /> Reject Loan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                modal.action === 'approve' ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                {modal.action === 'approve'
                  ? <CheckCircle2 size={20} className="text-emerald-600" />
                  : <XCircle size={20} className="text-red-600" />}
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {modal.action === 'approve' ? 'Approve Loan' : 'Reject Loan'}
                </h3>
                <p className="text-sm text-gray-500">{modal.loan.borrowerId.name}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <strong>{formatCurrency(modal.loan.principalAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tenure</span>
                <strong>{modal.loan.tenureDays} days</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Repayment</span>
                <strong className="text-blue-700">{formatCurrency(modal.loan.totalRepayment)}</strong>
              </div>
            </div>

            {modal.action === 'reject' && (
              <div className="mb-4">
                <label className="label">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="input min-h-[90px] resize-none"
                  placeholder="Provide a clear reason for rejection (min 5 characters)…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            )}

            {modal.action === 'approve' && (
              <div className="flex items-start gap-2 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  By approving, this loan will move to <strong>Disbursement</strong> queue. This cannot be undone.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="btn-md btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={processing}
                className={`btn-md flex-1 ${modal.action === 'approve' ? 'btn-success' : 'btn-danger'}`}>
                {processing
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Processing…</>
                  : modal.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
