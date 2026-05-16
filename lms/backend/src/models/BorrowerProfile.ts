import mongoose, { Document, Schema } from 'mongoose';

export type EmploymentMode = 'salaried' | 'self_employed' | 'unemployed';
export type BREStatus = 'pending' | 'passed' | 'failed';

export interface IBorrowerProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fullName: string;
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  salarySlipUrl: string | null;
  salarySlipOriginalName: string | null;
  breStatus: BREStatus;
  breRejectionReasons: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BorrowerProfileSchema = new Schema<IBorrowerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    pan: { type: String, required: true, uppercase: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    monthlySalary: { type: Number, required: true, min: 0 },
    employmentMode: {
      type: String,
      enum: ['salaried', 'self_employed', 'unemployed'],
      required: true,
    },
    salarySlipUrl: { type: String, default: null },
    salarySlipOriginalName: { type: String, default: null },
    breStatus: { type: String, enum: ['pending', 'passed', 'failed'], default: 'pending' },
    breRejectionReasons: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IBorrowerProfile>('BorrowerProfile', BorrowerProfileSchema);
