import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import BorrowerProfile from '../models/BorrowerProfile';
import { runBRE } from '../utils/bre';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await BorrowerProfile.findOne({ userId: req.user!.id });
    res.json({ success: true, data: profile });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const submitPersonalDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, pan, dateOfBirth, monthlySalary, employmentMode } = req.body;

    if (!fullName || !pan || !dateOfBirth || monthlySalary === undefined || !employmentMode) {
      res.status(400).json({ success: false, message: 'All fields are required.' });
      return;
    }

    const validModes = ['salaried', 'self_employed', 'unemployed'];
    if (!validModes.includes(employmentMode)) {
      res.status(400).json({ success: false, message: 'Invalid employment mode.' });
      return;
    }

    // BRE runs SERVER-SIDE to prevent bypass
    const breResult = runBRE({
      dateOfBirth: new Date(dateOfBirth),
      monthlySalary: Number(monthlySalary),
      pan: pan.toString().toUpperCase().trim(),
      employmentMode,
    });

    const profileData = {
      userId: req.user!.id,
      fullName: fullName.trim(),
      pan: pan.toString().toUpperCase().trim(),
      dateOfBirth: new Date(dateOfBirth),
      monthlySalary: Number(monthlySalary),
      employmentMode,
      breStatus: breResult.passed ? 'passed' : 'failed',
      breRejectionReasons: breResult.rejectionReasons,
      // Reset salary slip if re-submitting
      salarySlipUrl: null,
      salarySlipOriginalName: null,
    };

    const profile = await BorrowerProfile.findOneAndUpdate(
      { userId: req.user!.id },
      profileData,
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    if (!breResult.passed) {
      res.status(422).json({
        success: false,
        message: 'Eligibility check failed. Your application has been rejected.',
        data: { breStatus: 'failed', breRejectionReasons: breResult.rejectionReasons, profile },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Eligibility check passed! Please upload your salary slip.',
      data: profile,
    });
  } catch (err) {
    console.error('Personal details error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const uploadSalarySlip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Salary slip file is required.' });
      return;
    }

    const profile = await BorrowerProfile.findOne({ userId: req.user!.id });
    if (!profile) {
      res.status(404).json({ success: false, message: 'Complete personal details first.' });
      return;
    }
    if (profile.breStatus !== 'passed') {
      res.status(403).json({ success: false, message: 'Eligibility check must pass before uploading.' });
      return;
    }

    profile.salarySlipUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    profile.salarySlipOriginalName = req.file.originalname;
    await profile.save();

    res.json({
      success: true,
      message: 'Salary slip uploaded successfully!',
      data: { salarySlipUrl: profile.salarySlipUrl, originalName: profile.salarySlipOriginalName },
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
