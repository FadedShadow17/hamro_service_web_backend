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

    if (profile.verificationStatus !== VERIFICATION_STATUS.VERIFIED) {
      const statusMessages: Record<string, string> = {
        [VERIFICATION_STATUS.NOT_SUBMITTED]: 'Please submit your verification documents first',
        [VERIFICATION_STATUS.PENDING]: 'Your verification is pending. Please wait for admin approval.',
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
