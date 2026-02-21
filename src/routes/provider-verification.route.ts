import { Router } from 'express';
import { ProviderVerificationController } from '../controllers/provider-verification.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { USER_ROLES } from '../config/constants';
import { upload } from '../services/upload.service';

const router = Router();
const verificationController = new ProviderVerificationController();

const uploadFields = upload.fields([
  { name: 'citizenshipFront', maxCount: 1 },
  { name: 'citizenshipBack', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]);

router.post(
  '/',
  requireAuth,
  requireRole(USER_ROLES.PROVIDER),
  uploadFields,
  (req, res, next) => verificationController.submitVerification(req, res, next)
);

router.get(
  '/',
  requireAuth,
  requireRole(USER_ROLES.PROVIDER),
  (req, res, next) => verificationController.getVerificationStatus(req, res, next)
);

router.get(
  '/me/verification',
  requireAuth,
  requireRole(USER_ROLES.PROVIDER),
  (req, res, next) => verificationController.getVerificationSummary(req, res, next)
);

router.patch(
  '/:providerId',
  requireAuth,

  (req, res, next) => verificationController.reviewVerification(req, res, next)
);

export default router;
