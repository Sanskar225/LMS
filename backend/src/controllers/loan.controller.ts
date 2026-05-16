import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Loan from '../models/Loan';
import BorrowerProfile from '../models/BorrowerProfile';
import User from '../models/User';
import { calculateLoanTerms } from '../utils/bre';

// ═══════════════════════════════════════
//  BORROWER
// ═══════════════════════════════════════

export const applyLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { principalAmount, tenureDays } = req.body;
    const principal = Number(principalAmount);
    const tenure = Number(tenureDays);

    if (!principal || !tenure) {
      res.status(400).json({ success: false, message: 'Principal amount and tenure are required.' });
      return;
    }
    if (principal < 50000 || principal > 500000) {
      res.status(400).json({ success: false, message: 'Loan amount must be between ₹50,000 and ₹5,00,000.' });
      return;
    }
    if (tenure < 30 || tenure > 365) {
      res.status(400).json({ success: false, message: 'Tenure must be between 30 and 365 days.' });
      return;
    }

    const profile = await BorrowerProfile.findOne({ userId: req.user!.id });
    if (!profile || profile.breStatus !== 'passed') {
      res.status(403).json({ success: false, message: 'Eligibility check must pass before applying.' });
      return;
    }
    if (!profile.salarySlipUrl) {
      res.status(403).json({ success: false, message: 'Please upload your salary slip first.' });
      return;
    }

    const existingActiveLoan = await Loan.findOne({
      borrowerId: req.user!.id,
      status: { $in: ['applied', 'sanctioned', 'disbursed'] },
    });
    if (existingActiveLoan) {
      res.status(409).json({ success: false, message: 'You already have an active loan application.' });
      return;
    }

    const { simpleInterest, totalRepayment } = calculateLoanTerms(principal, tenure);

    const loan = await Loan.create({
      borrowerId: req.user!.id,
      principalAmount: principal,
      tenureDays: tenure,
      simpleInterest,
      totalRepayment,
      outstandingBalance: totalRepayment,
    });

    res.status(201).json({ success: true, message: 'Loan application submitted successfully!', data: loan });
  } catch (err) {
    console.error('Apply loan error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const getMyLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ borrowerId: req.user!.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: loans });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ═══════════════════════════════════════
//  SALES
// ═══════════════════════════════════════

export const getSalesLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const borrowers = await User.find({ role: 'borrower' }).select('-password').sort({ createdAt: -1 });
    const profiles = await BorrowerProfile.find();
    const loans = await Loan.find().sort({ createdAt: -1 });

    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));
    const loanMap = new Map<string, typeof loans[0]>();
    for (const l of loans) {
      if (!loanMap.has(l.borrowerId.toString())) loanMap.set(l.borrowerId.toString(), l);
    }

    const leads = borrowers.map((b) => ({
      user: b,
      profile: profileMap.get(b._id.toString()) || null,
      latestLoan: loanMap.get(b._id.toString()) || null,
    }));

    res.json({ success: true, data: leads });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ═══════════════════════════════════════
//  SANCTION
// ═══════════════════════════════════════

export const getAppliedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: 'applied' })
      .populate('borrowerId', '-password')
      .sort({ createdAt: -1 });

    const borrowerIds = loans.map((l) => (l.borrowerId as any)._id);
    const profiles = await BorrowerProfile.find({ userId: { $in: borrowerIds } });
    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    const enriched = loans.map((l) => ({
      ...l.toObject(),
      borrowerProfile: profileMap.get(((l.borrowerId as any)._id).toString()) || null,
    }));

    res.json({ success: true, data: enriched });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const sanctionLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const { action, rejectionReason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ success: false, message: 'Action must be "approve" or "reject".' });
      return;
    }

    const loan = await Loan.findById(loanId);
    if (!loan) { res.status(404).json({ success: false, message: 'Loan not found.' }); return; }
    if (loan.status !== 'applied') {
      res.status(400).json({ success: false, message: `Cannot sanction: loan is in "${loan.status}" status.` });
      return;
    }

    if (action === 'approve') {
      loan.status = 'sanctioned';
      loan.sanctionedBy = req.user!.id as any;
      loan.sanctionedAt = new Date();
    } else {
      if (!rejectionReason || rejectionReason.trim().length < 5) {
        res.status(400).json({ success: false, message: 'Rejection reason must be at least 5 characters.' });
        return;
      }
      loan.status = 'rejected';
      loan.rejectionReason = rejectionReason.trim();
    }

    await loan.save();
    res.json({
      success: true,
      message: action === 'approve' ? 'Loan sanctioned successfully!' : 'Loan rejected.',
      data: loan,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ═══════════════════════════════════════
//  DISBURSEMENT
// ═══════════════════════════════════════

export const getSanctionedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: 'sanctioned' })
      .populate('borrowerId', '-password')
      .populate('sanctionedBy', 'name email')
      .sort({ sanctionedAt: -1 });
    res.json({ success: true, data: loans });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const disburseLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await Loan.findById(req.params.loanId);
    if (!loan) { res.status(404).json({ success: false, message: 'Loan not found.' }); return; }
    if (loan.status !== 'sanctioned') {
      res.status(400).json({ success: false, message: `Cannot disburse: loan is in "${loan.status}" status.` });
      return;
    }
    loan.status = 'disbursed';
    loan.disbursedBy = req.user!.id as any;
    loan.disbursedAt = new Date();
    await loan.save();
    res.json({ success: true, message: 'Loan disbursed! Funds released to borrower.', data: loan });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ═══════════════════════════════════════
//  COLLECTION
// ═══════════════════════════════════════

export const getActiveLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: { $in: ['disbursed', 'closed'] } })
      .populate('borrowerId', '-password')
      .populate('disbursedBy', 'name email')
      .sort({ disbursedAt: -1 });
    res.json({ success: true, data: loans });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const { utrNumber, amount, date } = req.body;

    if (!utrNumber || !amount || !date) {
      res.status(400).json({ success: false, message: 'UTR number, amount, and date are required.' });
      return;
    }

    const payAmt = Number(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      res.status(400).json({ success: false, message: 'Payment amount must be a positive number.' });
      return;
    }

    const utr = utrNumber.toString().trim();
    if (utr.length < 3) {
      res.status(400).json({ success: false, message: 'Invalid UTR number.' });
      return;
    }

    const loan = await Loan.findById(loanId);
    if (!loan) { res.status(404).json({ success: false, message: 'Loan not found.' }); return; }
    if (loan.status !== 'disbursed') {
      res.status(400).json({ success: false, message: `Payments only allowed on disbursed loans. Current: "${loan.status}"` });
      return;
    }

    // UTR must be globally unique across ALL payments in ALL loans
    const utrExists = await Loan.findOne({ 'payments.utrNumber': utr });
    if (utrExists) {
      res.status(409).json({ success: false, message: `UTR "${utr}" already used. Each payment must have a unique UTR number.` });
      return;
    }

    if (payAmt > loan.outstandingBalance + 0.01) {
      res.status(400).json({
        success: false,
        message: `Payment ₹${payAmt.toLocaleString('en-IN')} exceeds outstanding balance ₹${loan.outstandingBalance.toLocaleString('en-IN')}.`,
      });
      return;
    }

    loan.payments.push({ utrNumber: utr, amount: payAmt, date: new Date(date), recordedBy: req.user!.id as any } as any);
    loan.totalPaid = Math.round((loan.totalPaid + payAmt) * 100) / 100;
    loan.outstandingBalance = Math.round((loan.totalRepayment - loan.totalPaid) * 100) / 100;

    // Auto-close on full repayment
    if (loan.outstandingBalance <= 0.01) {
      loan.status = 'closed';
      loan.closedAt = new Date();
      loan.outstandingBalance = 0;
    }

    await loan.save();
    res.json({
      success: true,
      message: loan.status === 'closed'
        ? '🎉 Payment recorded. Loan is now fully CLOSED!'
        : 'Payment recorded successfully.',
      data: loan,
    });
  } catch (err) {
    console.error('Record payment error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ═══════════════════════════════════════
//  ADMIN / SHARED
// ═══════════════════════════════════════

export const getAllLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    const loans = await Loan.find(filter).populate('borrowerId', '-password').sort({ createdAt: -1 });
    res.json({ success: true, data: loans });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const getLoanById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await Loan.findById(req.params.loanId)
      .populate('borrowerId', '-password')
      .populate('sanctionedBy', 'name email')
      .populate('disbursedBy', 'name email')
      .populate('payments.recordedBy', 'name email');
    if (!loan) { res.status(404).json({ success: false, message: 'Loan not found.' }); return; }
    res.json({ success: true, data: loan });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
