import { Response, NextFunction } from 'express';
import { ProviderProfileRepository } from '../../infrastructure/db/mongoose/repositories/provider-profile.repository';
import { VERIFICATION_STATUS } from '../../shared/constants';
import { AuthRequest } from './auth.middleware';
import { HttpError } from '../../shared/errors/http-error';

/**
 * Middleware to check if provider is verified
 * Blocks unverified providers from accepting/confirming bookings
 */
export async function requireVerification(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const providerProfileRepo = new ProviderProfileRepository();
    const profile = await providerProfileRepo.findByUserId(req.user.id);

    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    if (profile.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
      const statusMessages: Record<string, string> = {
        [VERIFICATION_STATUS.NOT_SUBMITTED]: 'Please submit your verification documents first',
        [VERIFICATION_STATUS.PENDING_REVIEW]: 'Your verification is pending review. Please wait for approval.',
        [VERIFICATION_STATUS.REJECTED]: profile.rejectionReason 
          ? `Verification rejected: ${profile.rejectionReason}. Please resubmit with corrected documents.`
          : 'Your verification was rejected. Please resubmit with corrected documents.',
      };

      return res.status(403).json({
        message: statusMessages[profile.verificationStatus] || 'Provider verification required',
        verificationStatus: profile.verificationStatus,
        rejectionReason: profile.rejectionReason,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}

