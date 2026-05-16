'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle2, ChevronRight, User2, Info } from 'lucide-react';
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
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* BRE Rejection Banner */}
      {breErrors.length > 0 && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-800">Eligibility Check Failed</p>
              <p className="text-xs text-red-600">Please fix the issues below and resubmit.</p>
            </div>
          </div>
          <ul className="space-y-2">
            {breErrors.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                <span className="mt-1 w-4 h-4 bg-red-200 rounded-full flex items-center justify-center text-red-700 font-bold text-xs flex-shrink-0">{i + 1}</span>
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <User2 size={20} className="text-blue-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Personal Details</h1>
            <p className="text-sm text-gray-500">Fill in your details for eligibility check</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" placeholder="As per PAN card" value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)} required />
            </div>

            <div>
              <label className="label">PAN Number *</label>
              <input className="input tracking-widest uppercase" placeholder="ABCDE1234F" maxLength={10}
                value={form.pan} onChange={(e) => set('pan', e.target.value.toUpperCase())} required />
              <p className="text-xs text-gray-400 mt-1">Format: 5 letters + 4 digits + 1 letter</p>
            </div>

            <div>
              <label className="label">Date of Birth *</label>
              <input className="input" type="date" value={form.dateOfBirth}
                onChange={(e) => set('dateOfBirth', e.target.value)} required />
              <p className="text-xs text-gray-400 mt-1">Must be between 23–50 years old</p>
            </div>

            <div>
              <label className="label">Monthly Salary (₹) *</label>
              <input className="input" type="number" min={0} placeholder="e.g. 50000" value={form.monthlySalary}
                onChange={(e) => set('monthlySalary', e.target.value)} required />
              <p className="text-xs text-gray-400 mt-1">Minimum ₹25,000 required</p>
            </div>
          </div>

          <div>
            <label className="label">Employment Mode *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: 'salaried',     l: '💼 Salaried' },
                { v: 'self_employed', l: '🏢 Self-Employed' },
                { v: 'unemployed',   l: '❌ Unemployed' },
              ].map(({ v, l }) => (
                <button key={v} type="button" onClick={() => set('employmentMode', v)}
                  className={`py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    form.employmentMode === v
                      ? v === 'unemployed'
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
            {form.employmentMode === 'unemployed' && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertTriangle size={12} /> Unemployed applicants are not eligible for loans.
              </p>
            )}
          </div>

          <button type="submit" disabled={loading || !form.employmentMode} className="btn-lg btn-primary w-full">
            {loading
              ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Checking Eligibility...</>
              : <>Check Eligibility &amp; Continue <ChevronRight size={16} /></>
            }
          </button>
        </form>
      </div>

      {/* Eligibility rules info box */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} className="text-blue-600" />
          <p className="text-sm font-semibold text-blue-800">Eligibility Criteria (Business Rule Engine)</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { rule: 'Age', cond: '23 to 50 years' },
            { rule: 'Salary', cond: '≥ ₹25,000/month' },
            { rule: 'PAN', cond: 'Valid format (ABCDE1234F)' },
            { rule: 'Employment', cond: 'Salaried or Self-Employed' },
          ].map((r) => (
            <div key={r.rule} className="flex items-start gap-2 text-sm">
              <CheckCircle2 size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <span><span className="font-medium text-blue-800">{r.rule}:</span> <span className="text-blue-700">{r.cond}</span></span>
            </div>
          ))}
        </div>
        <p className="text-xs text-blue-600 mt-3 italic">
          All checks run on the server to prevent bypass.
        </p>
      </div>
    </div>
  );
}
