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

  if (fetching) return (
    <div className="min-h-[60vh] flex justify-center items-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 bg-indigo-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header with gradient accent */}
        <div className="relative bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-5 border-b border-orange-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-20"></div>
          <div className="flex items-center gap-3 relative">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Upload size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Salary Slip</h1>
              <p className="text-sm text-gray-600">PDF, JPG or PNG • Max 5MB</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {uploaded ? (
            <div className="text-center py-12">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 size={40} className="text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">Salary Slip Uploaded!</h3>
              <p className="text-sm text-gray-600 mb-1">
                {existingFile ? `📄 ${existingFile}` : 'File uploaded successfully'}
              </p>
              <p className="text-sm text-gray-400 mb-8">Your document is ready for verification</p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => { setUploaded(false); setFile(null); }} 
                  className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 flex items-center gap-2"
                >
                  <X size={16} /> Replace File
                </button>
                <button 
                  onClick={() => router.push('/borrower/loan-config')} 
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-medium text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  Continue <ChevronRight size={16} />
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
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  drag ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' :
                  file ? 'border-emerald-400 bg-emerald-50' :
                  'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/30'
                }`}
              >
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={onFileChange} />
                
                {file ? (
                  <div className="animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <FileText size={32} className="text-white" />
                    </div>
                    <p className="font-semibold text-gray-800 text-lg">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="mt-3 text-sm text-red-500 hover:text-red-700 flex items-center gap-1 mx-auto transition-colors"
                    >
                      <X size={14} /> Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Upload size={40} className="text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-700 text-lg">Click or drag to upload</p>
                    <p className="text-sm text-gray-400 mt-2">PDF, JPG, PNG • Max 5MB</p>
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <span className="text-xs text-gray-400">🔒 Secure upload</span>
                      <span className="text-xs text-gray-400">⚡ Instant processing</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => router.push('/borrower/personal-details')} 
                  className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button 
                  onClick={handleUpload} 
                  disabled={!file || loading} 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-medium text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Upload & Continue
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {/* Help text */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  ⚡ Files are encrypted and securely stored
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}