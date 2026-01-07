import { Response, NextFunction } from 'express';
import { ProviderProfileRepository } from '../../infrastructure/db/mongoose/repositories/provider-profile.repository';
import { submitVerificationSchema, reviewVerificationSchema } from '../../application/dtos/provider-verification.dto';
import { VERIFICATION_STATUS, KATHMANDU_AREAS, CITY } from '../../shared/constants';
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
      let profile = await providerProfileRepo.findByUserId(req.user.id);

      // Parse form data (files are already uploaded via multer)
      let address;
      try {
        address = req.body.address 
          ? (typeof req.body.address === 'string' ? JSON.parse(req.body.address) : req.body.address)
          : undefined;
      } catch (error) {
        return res.status(422).json({
          message: 'Invalid address format',
          errors: { address: ['Address must be a valid JSON object'] },
        });
      }

      // Clean phone number - remove any spaces
      const phoneNumber = req.body.phoneNumber ? String(req.body.phoneNumber).trim().replace(/\s+/g, '') : undefined;

      const body = {
        fullName: req.body.fullName?.trim(),
        phoneNumber: phoneNumber,
        citizenshipNumber: req.body.citizenshipNumber?.trim(),
        serviceRole: req.body.serviceRole,
        address: address,
        // Images are optional - only include if uploaded
        ...(req.files?.['citizenshipFront']?.[0] && { citizenshipFrontImage: getFileUrl((req.files as any)['citizenshipFront'][0].filename) }),
        ...(req.files?.['citizenshipBack']?.[0] && { citizenshipBackImage: getFileUrl((req.files as any)['citizenshipBack'][0].filename) }),
        ...(req.files?.['profileImage']?.[0] && { profileImage: getFileUrl((req.files as any)['profileImage'][0].filename) }),
        ...(req.files?.['selfie']?.[0] && { selfieImage: getFileUrl((req.files as any)['selfie'][0].filename) }),
      };

      // Validate
      const dto = submitVerificationSchema.parse(body);

      // If profile doesn't exist, create it with verification data
      if (!profile) {
        // Get area from address district if it matches a Kathmandu area, otherwise use first area as default
        const area = dto.address?.district && KATHMANDU_AREAS.includes(dto.address.district as any) 
          ? dto.address.district 
          : KATHMANDU_AREAS[0]; // Default to first area if not found

        profile = await providerProfileRepo.create({
          userId: req.user.id,
          city: CITY,
          area: area as any,
          phone: dto.phoneNumber,
          active: true,
          verificationStatus: VERIFICATION_STATUS.APPROVED,
          verifiedAt: new Date(),
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          citizenshipNumber: dto.citizenshipNumber,
          serviceRole: dto.serviceRole,
          address: dto.address,
          citizenshipFrontImage: dto.citizenshipFrontImage,
          citizenshipBackImage: dto.citizenshipBackImage,
          profileImage: dto.profileImage,
          selfieImage: dto.selfieImage,
        });
      } else {
        // Update existing profile with verification data - Auto-approve upon submission
        const updated = await providerProfileRepo.update(profile.id, {
          ...dto,
          verificationStatus: VERIFICATION_STATUS.APPROVED,
          verifiedAt: new Date(),
          rejectionReason: undefined, // Clear any previous rejection reason
        });

        if (!updated) {
          return res.status(404).json({ message: 'Provider profile not found' });
        }
        profile = updated;
      }

      res.status(200).json({
        message: 'Verification documents submitted successfully. You are now verified!',
        profile: profile,
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
      
      // If profile doesn't exist, return default NOT_SUBMITTED status
      if (!profile) {
        return res.status(200).json({
          verificationStatus: VERIFICATION_STATUS.NOT_SUBMITTED,
          fullName: undefined,
          phoneNumber: undefined,
          citizenshipNumber: undefined,
          serviceRole: undefined,
          address: undefined,
          citizenshipFrontImage: undefined,
          citizenshipBackImage: undefined,
          profileImage: undefined,
          selfieImage: undefined,
          verifiedAt: undefined,
          rejectionReason: undefined,
        });
      }

      res.status(200).json({
        verificationStatus: profile.verificationStatus,
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        citizenshipNumber: profile.citizenshipNumber,
        serviceRole: profile.serviceRole,
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
   * Get verification summary (status and role only)
   * GET /api/provider/me/verification
   */
  async getVerificationSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      
      // If profile doesn't exist, return default NOT_SUBMITTED status
      if (!profile) {
        return res.status(200).json({
          status: VERIFICATION_STATUS.NOT_SUBMITTED,
          role: null,
        });
      }

      res.status(200).json({
        status: profile.verificationStatus,
        role: profile.serviceRole || null,
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

