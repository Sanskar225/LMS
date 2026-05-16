import mongoose, { Document, Schema } from 'mongoose';

export type LoanStatus = 'applied' | 'sanctioned' | 'rejected' | 'disbursed' | 'closed';

export interface IPayment {
  _id: mongoose.Types.ObjectId;
  utrNumber: string;
  amount: number;
  date: Date;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ILoan extends Document {
  _id: mongoose.Types.ObjectId;
  borrowerId: mongoose.Types.ObjectId;
  principalAmount: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: LoanStatus;
  rejectionReason: string | null;
  sanctionedBy: mongoose.Types.ObjectId | null;
  sanctionedAt: Date | null;
  disbursedBy: mongoose.Types.ObjectId | null;
  disbursedAt: Date | null;
  closedAt: Date | null;
  payments: IPayment[];
  totalPaid: number;
  outstandingBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    utrNumber: { type: String, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const LoanSchema = new Schema<ILoan>(
  {
    borrowerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    principalAmount: { type: Number, required: true, min: 50000, max: 500000 },
    tenureDays: { type: Number, required: true, min: 30, max: 365 },
    interestRate: { type: Number, default: 12 },
    simpleInterest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    status: {
      type: String,
      enum: ['applied', 'sanctioned', 'rejected', 'disbursed', 'closed'],
      default: 'applied',
    },
    rejectionReason: { type: String, default: null },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    sanctionedAt: { type: Date, default: null },
    disbursedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    disbursedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    payments: [PaymentSchema],
    totalPaid: { type: Number, default: 0 },
    outstandingBalance: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILoan>('Loan', LoanSchema);
