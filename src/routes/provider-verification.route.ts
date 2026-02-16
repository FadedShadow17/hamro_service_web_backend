import { Router } from 'express';
import { ProviderVerificationController } from '../controllers/provider-verification.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { USER_ROLES } from '../config/constants';
import { upload } from '../services/upload.service';

const router = Router();
const verificationController = new ProviderVerificationController();

// Configure multer for multiple file fields
const uploadFields = upload.fields([
  { name: 'citizenshipFront', maxCount: 1 },
  { name: 'citizenshipBack', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]);

// POST /api/provider/verification - Submit verification documents
router.post(
  '/',
  requireAuth,
  requireRole(USER_ROLES.PROVIDER),
  uploadFields,
  (req, res, next) => verificationController.submitVerification(req, res, next)
);

// GET /api/provider/verification - Get verification status
router.get(
  '/',
  requireAuth,
  requireRole(USER_ROLES.PROVIDER),
  (req, res, next) => verificationController.getVerificationStatus(req, res, next)
);

// GET /api/provider/me/verification - Get verification summary (status and role only)
router.get(
  '/me/verification',
  requireAuth,
  requireRole(USER_ROLES.PROVIDER),
  (req, res, next) => verificationController.getVerificationSummary(req, res, next)
);

// PATCH /api/admin/provider-verification/:providerId - Review verification (Admin)
router.patch(
  '/:providerId',
  requireAuth,
  // TODO: Add admin role check
  (req, res, next) => verificationController.reviewVerification(req, res, next)
);

export default router;
