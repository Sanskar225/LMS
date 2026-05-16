import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'LoanPro – Loan Management System',
  description: 'Full-stack Loan Management System with MERN + Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '10px', fontSize: '14px' },
              success: { style: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' } },
              error: { style: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
