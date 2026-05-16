export type UserRole = 'admin' | 'sales' | 'sanction' | 'disbursement' | 'collection' | 'borrower';
export type LoanStatus = 'applied' | 'sanctioned' | 'rejected' | 'disbursed' | 'closed';
export type BREStatus = 'pending' | 'passed' | 'failed';
export type EmploymentMode = 'salaried' | 'self_employed' | 'unemployed';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface BorrowerProfile {
  _id: string;
  userId: string;
  fullName: string;
  pan: string;
  dateOfBirth: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  salarySlipUrl: string | null;
  salarySlipOriginalName: string | null;
  breStatus: BREStatus;
  breRejectionReasons: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  utrNumber: string;
  amount: number;
  date: string;
  recordedBy: User | string;
  createdAt: string;
}

export interface Loan {
  _id: string;
  borrowerId: User | string;
  principalAmount: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: LoanStatus;
  rejectionReason: string | null;
  sanctionedBy?: User | string;
  sanctionedAt?: string;
  disbursedBy?: User | string;
  disbursedAt?: string;
  closedAt?: string;
  payments: Payment[];
  totalPaid: number;
  outstandingBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface SalesLead {
  user: User;
  profile: BorrowerProfile | null;
  latestLoan: Loan | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
