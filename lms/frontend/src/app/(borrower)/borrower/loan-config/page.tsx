'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Calculator, ArrowLeft, IndianRupee, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { calculateLoan, formatCurrency } from '@/lib/utils';

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

  if (checking) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Sliders */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Calculator size={20} className="text-purple-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Loan Configuration</h1>
            <p className="text-sm text-gray-500">Use sliders to configure your loan</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Principal slider */}
          <div>
            <div className="flex justify-between items-baseline mb-3">
              <label className="label mb-0">Loan Amount</label>
              <span className="text-2xl font-bold text-blue-700">{formatCurrency(principal)}</span>
            </div>
            <input
              ref={principalRef}
              type="range" min={50000} max={500000} step={5000}
              value={principal}
              style={{ '--pct': `${principalPct}%` } as React.CSSProperties}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1.5">
              <span>₹50,000</span>
              <span className="text-gray-500 font-medium">12% p.a. Simple Interest</span>
              <span>₹5,00,000</span>
            </div>
          </div>

          {/* Tenure slider */}
          <div>
            <div className="flex justify-between items-baseline mb-3">
              <label className="label mb-0">Loan Tenure</label>
              <span className="text-2xl font-bold text-blue-700">{tenure} days</span>
            </div>
            <input
              ref={tenureRef}
              type="range" min={30} max={365} step={5}
              value={tenure}
              style={{ '--pct': `${tenurePct}%` } as React.CSSProperties}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1.5">
              <span>30 days</span>
              <span>365 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Calculation Panel */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-950 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-5">
          <IndianRupee size={20} className="text-blue-300" />
          <h3 className="font-bold text-lg">Live Loan Summary</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <div className="flex items-center gap-1 mb-1">
              <IndianRupee size={11} className="text-blue-300" />
              <p className="text-xs text-blue-300">Principal</p>
            </div>
            <p className="text-lg font-bold">{formatCurrency(principal)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <div className="flex items-center gap-1 mb-1">
              <Clock size={11} className="text-blue-300" />
              <p className="text-xs text-blue-300">Tenure</p>
            </div>
            <p className="text-lg font-bold">{tenure} days</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp size={11} className="text-blue-300" />
              <p className="text-xs text-blue-300">Interest</p>
            </div>
            <p className="text-lg font-bold">{formatCurrency(simpleInterest)}</p>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-xl p-3">
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle2 size={11} className="text-yellow-300" />
              <p className="text-xs text-yellow-300">Total Repayment</p>
            </div>
            <p className="text-xl font-bold text-yellow-300">{formatCurrency(totalRepayment)}</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-300">
            Formula: <span className="font-mono">SI = (P × R × T) / (365 × 100)</span>
          </p>
          <p className="text-xs text-blue-400 mt-1">
            = ({formatCurrency(principal)} × 12 × {tenure}) / 36,500 = <strong className="text-white">{formatCurrency(simpleInterest)}</strong>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => router.push('/borrower/upload')} className="btn-md btn-secondary">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={handleApply} disabled={loading} className="btn-lg btn-primary flex-1">
          {loading
            ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Submitting...</>
            : `Apply for ${formatCurrency(totalRepayment)}`
          }
        </button>
      </div>
    </div>
  );
}
