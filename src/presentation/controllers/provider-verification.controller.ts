import { Response, NextFunction } from 'express';
import { ProviderProfileRepository } from '../../infrastructure/db/mongoose/repositories/provider-profile.repository';
import { submitVerificationSchema, reviewVerificationSchema } from '../../application/dtos/provider-verification.dto';
import { VERIFICATION_STATUS } from '../../shared/constants';
import { AuthRequest } from '../middlewares/auth.middleware';
import { HttpError } from '../../shared/errors/http-error';
import { getFileUrl } from '../../infrastructure/storage/upload';

export class ProviderVerificationController {
  /**
   * Submit verification documents
   * POST /api/provider/verification
   */
  async submitVerification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      
      if (!profile) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      // Parse form data (files are already uploaded via multer)
      const body = {
        fullName: req.body.fullName,
        phoneNumber: req.body.phoneNumber,
        citizenshipNumber: req.body.citizenshipNumber,
        address: req.body.address ? JSON.parse(req.body.address) : undefined,
        citizenshipFrontImage: req.files?.['citizenshipFront']?.[0] ? getFileUrl((req.files as any)['citizenshipFront'][0].filename) : undefined,
        citizenshipBackImage: req.files?.['citizenshipBack']?.[0] ? getFileUrl((req.files as any)['citizenshipBack'][0].filename) : undefined,
        profileImage: req.files?.['profileImage']?.[0] ? getFileUrl((req.files as any)['profileImage'][0].filename) : undefined,
        selfieImage: req.files?.['selfie']?.[0] ? getFileUrl((req.files as any)['selfie'][0].filename) : undefined,
      };

      // Validate
      const dto = submitVerificationSchema.parse(body);

      // Update provider profile with verification data
      const updated = await providerProfileRepo.update(profile.id, {
        ...dto,
        verificationStatus: VERIFICATION_STATUS.PENDING_REVIEW,
      });

      if (!updated) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      res.status(200).json({
        message: 'Verification documents submitted successfully',
        profile: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get verification status
   * GET /api/provider/verification
   */
  async getVerificationStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      
      if (!profile) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      res.status(200).json({
        verificationStatus: profile.verificationStatus,
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        citizenshipNumber: profile.citizenshipNumber,
        address: profile.address,
        citizenshipFrontImage: profile.citizenshipFrontImage,
        citizenshipBackImage: profile.citizenshipBackImage,
        profileImage: profile.profileImage,
        selfieImage: profile.selfieImage,
        verifiedAt: profile.verifiedAt,
        rejectionReason: profile.rejectionReason,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Review verification (Admin only)
   * PATCH /api/admin/provider-verification/:providerId
   */
  async reviewVerification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // TODO: Add admin role check
      // if (req.user.role !== USER_ROLES.ADMIN) {
      //   return res.status(403).json({ message: 'Admin access required' });
      // }

      const { providerId } = req.params;
      const dto = reviewVerificationSchema.parse(req.body);

      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findById(providerId);
      
      if (!profile) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      const updateData: any = {
        verificationStatus: dto.status,
      };

      if (dto.status === VERIFICATION_STATUS.APPROVED) {
        updateData.verifiedAt = new Date();
        updateData.rejectionReason = undefined;
      } else if (dto.status === VERIFICATION_STATUS.REJECTED) {
        updateData.rejectionReason = dto.rejectionReason;
        updateData.verifiedAt = undefined;
      }

      const updated = await providerProfileRepo.update(providerId, updateData);

      if (!updated) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      res.status(200).json({
        message: `Verification ${dto.status.toLowerCase()}`,
        profile: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

