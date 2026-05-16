import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, authorize } from '../middleware/auth';
import { getProfile, submitPersonalDetails, uploadSalarySlip } from '../controllers/borrower.controller';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `salary-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only PDF, JPG, PNG allowed.'));
};

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single('salarySlip')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large. Max 5MB.' : err.message });
    }
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

router.use(authenticate);
router.use(authorize('borrower'));

router.get('/profile', getProfile);
router.post('/personal-details', submitPersonalDetails);
router.post('/upload-salary-slip', handleUpload, uploadSalarySlip);

export default router;
