'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle2, ArrowLeft, X, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    api.get('/borrower/profile').then(({ data }) => {
      const p = data.data;
      if (!p || p.breStatus !== 'passed') { router.replace('/borrower/personal-details'); return; }
      if (p.salarySlipUrl) { setUploaded(true); setExistingFile(p.salarySlipOriginalName); }
    }).catch(() => router.replace('/borrower/personal-details'))
      .finally(() => setFetching(false));
  }, [router]);

  const validateFile = (f: File): boolean => {
    if (f.size > 5 * 1024 * 1024) { toast.error('File size must be under 5MB.'); return false; }
    const ok = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!ok.includes(f.type)) { toast.error('Only PDF, JPG, or PNG files are allowed.'); return false; }
    return true;
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) setFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f && validateFile(f)) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) { toast.error('Please select a file first.'); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('salarySlip', file);
    try {
      await api.post('/borrower/upload-salary-slip', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Salary slip uploaded!');
      setUploaded(true);
      setExistingFile(file.name);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Upload size={20} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Upload Salary Slip</h1>
            <p className="text-sm text-gray-500">PDF, JPG or PNG • Max 5MB</p>
          </div>
        </div>

        {uploaded ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Salary Slip Uploaded</h3>
            <p className="text-sm text-gray-500 mb-1">
              {existingFile ? `File: ${existingFile}` : 'File uploaded successfully'}
            </p>
            <p className="text-sm text-gray-400 mb-6">Proceed to configure your loan.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setUploaded(false); setFile(null); }} className="btn-md btn-secondary">
                Replace File
              </button>
              <button onClick={() => router.push('/borrower/loan-config')} className="btn-md btn-primary">
                Continue to Loan Config <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                drag ? 'border-blue-500 bg-blue-50' :
                file ? 'border-emerald-400 bg-emerald-50' :
                'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={onFileChange} />
              {file ? (
                <div>
                  <FileText size={40} className="text-emerald-600 mx-auto mb-3" />
                  <p className="font-semibold text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mx-auto">
                    <X size={12} /> Remove
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-gray-700">Click or drag to upload</p>
                  <p className="text-sm text-gray-400 mt-1">PDF, JPG, PNG • Max 5MB</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => router.push('/borrower/personal-details')} className="btn-md btn-secondary">
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={handleUpload} disabled={!file || loading} className="btn-md btn-primary flex-1">
                {loading
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Uploading...</>
                  : 'Upload & Continue'
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
