import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  applyLoan, getMyLoans,
  getSalesLeads,
  getAppliedLoans, sanctionLoan,
  getSanctionedLoans, disburseLoan,
  getActiveLoans, recordPayment,
  getAllLoans, getLoanById,
} from '../controllers/loan.controller';

const router = Router();
router.use(authenticate);

// ── Borrower ──────────────────────────────
router.post('/apply',     authorize('borrower'), applyLoan);
router.get('/my-loans',   authorize('borrower'), getMyLoans);

// ── Sales ─────────────────────────────────
router.get('/sales/leads', authorize('admin', 'sales'), getSalesLeads);

// ── Sanction ──────────────────────────────
router.get('/sanction/applied',   authorize('admin', 'sanction'), getAppliedLoans);
router.patch('/sanction/:loanId', authorize('admin', 'sanction'), sanctionLoan);

// ── Disbursement ──────────────────────────
router.get('/disbursement/sanctioned',         authorize('admin', 'disbursement'), getSanctionedLoans);
router.patch('/disbursement/:loanId/disburse', authorize('admin', 'disbursement'), disburseLoan);

// ── Collection ────────────────────────────
router.get('/collection/active',              authorize('admin', 'collection'), getActiveLoans);
router.post('/collection/:loanId/payment',    authorize('admin', 'collection'), recordPayment);

// ── Admin / Shared ────────────────────────
router.get('/all',       authorize('admin', 'sales', 'sanction', 'disbursement', 'collection'), getAllLoans);
router.get('/:loanId',   authorize('admin', 'sales', 'sanction', 'disbursement', 'collection'), getLoanById);

export default router;
