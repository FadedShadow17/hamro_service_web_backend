import { Response, NextFunction } from 'express';
import { ProviderProfileRepository } from '../repositories/provider-profile.repository';
import { VERIFICATION_STATUS } from '../config/constants';
import { AuthRequest } from './auth.middleware';
import { HttpError } from '../errors/http-error';


export async function requireVerification(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const providerProfileRepo = new ProviderProfileRepository();
    const profile = await providerProfileRepo.findByUserId(req.user.id);

    if (!profile) {
      res.status(404).json({ message: 'Provider profile not found' });
      return;
    }

    if (profile.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
      const statusMessages: Record<string, string> = {
        [VERIFICATION_STATUS.NOT_SUBMITTED]: 'Please submit your verification documents first',
        [VERIFICATION_STATUS.PENDING_REVIEW]: 'Your verification is pending review. Please wait for approval.',
        [VERIFICATION_STATUS.REJECTED]: profile.rejectionReason 
          ? `Verification rejected: ${profile.rejectionReason}. Please resubmit with corrected documents.`
          : 'Your verification was rejected. Please resubmit with corrected documents.',
      };

      res.status(403).json({
        message: statusMessages[profile.verificationStatus] || 'Provider verification required',
        verificationStatus: profile.verificationStatus,
        rejectionReason: profile.rejectionReason,
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
