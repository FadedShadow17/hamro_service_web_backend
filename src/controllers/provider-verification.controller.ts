import { Response, NextFunction } from 'express';
import { ProviderProfileRepository } from '../repositories/provider-profile.repository';
import { submitVerificationSchema, reviewVerificationSchema } from '../dtos/provider-verification.dto';
import { VERIFICATION_STATUS, KATHMANDU_AREAS, CITY } from '../config/constants';
import { AuthRequest } from '../middlewares/auth.middleware';
import { HttpError } from '../errors/http-error';
import { getFileUrl } from '../services/upload.service';

export class ProviderVerificationController {
  
  async submitVerification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const providerProfileRepo = new ProviderProfileRepository();
      let profile = await providerProfileRepo.findByUserId(req.user.id);

      let address;
      try {
        address = req.body.address 
          ? (typeof req.body.address === 'string' ? JSON.parse(req.body.address) : req.body.address)
          : undefined;
      } catch (error) {
        res.status(422).json({
          message: 'Invalid address format',
          errors: { address: ['Address must be a valid JSON object'] },
        });
        return;
      }

      const phoneNumber = req.body.phoneNumber ? String(req.body.phoneNumber).trim().replace(/\s+/g, '') : undefined;

      const body = {
        fullName: req.body.fullName?.trim(),
        phoneNumber: phoneNumber,
        citizenshipNumber: req.body.citizenshipNumber?.trim(),
        serviceRole: req.body.serviceRole,
        address: address,

        ...(req.files && typeof req.files === 'object' && 'citizenshipFront' in req.files && Array.isArray(req.files.citizenshipFront) && req.files.citizenshipFront[0] && { citizenshipFrontImage: getFileUrl(req.files.citizenshipFront[0].filename) }),
        ...(req.files && typeof req.files === 'object' && 'citizenshipBack' in req.files && Array.isArray(req.files.citizenshipBack) && req.files.citizenshipBack[0] && { citizenshipBackImage: getFileUrl(req.files.citizenshipBack[0].filename) }),
        ...(req.files && typeof req.files === 'object' && 'profileImage' in req.files && Array.isArray(req.files.profileImage) && req.files.profileImage[0] && { profileImage: getFileUrl(req.files.profileImage[0].filename) }),
        ...(req.files && typeof req.files === 'object' && 'selfie' in req.files && Array.isArray(req.files.selfie) && req.files.selfie[0] && { selfieImage: getFileUrl(req.files.selfie[0].filename) }),
      };

      const dto = submitVerificationSchema.parse(body);

      if (!profile) {

        const area = dto.address?.district && KATHMANDU_AREAS.includes(dto.address.district as any) 
          ? dto.address.district 
          : KATHMANDU_AREAS[0]; // Default to first area if not found

        profile = await providerProfileRepo.create({
          userId: req.user.id,
          city: CITY,
          area: area as any,
          phone: dto.phoneNumber,
          active: true,
          verificationStatus: VERIFICATION_STATUS.PENDING,
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          citizenshipNumber: dto.citizenshipNumber,
          serviceRole: dto.serviceRole as any,
          address: dto.address,
          citizenshipFrontImage: dto.citizenshipFrontImage || undefined,
          citizenshipBackImage: dto.citizenshipBackImage || undefined,
          profileImage: dto.profileImage || undefined,
          selfieImage: dto.selfieImage || undefined,
        });
      } else {

        const updateData: any = {
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          citizenshipNumber: dto.citizenshipNumber,
          serviceRole: dto.serviceRole as any,
          address: dto.address,
          verificationStatus: VERIFICATION_STATUS.PENDING,
          verifiedAt: undefined,
          rejectionReason: undefined,
        };
        if (dto.citizenshipFrontImage) updateData.citizenshipFrontImage = dto.citizenshipFrontImage;
        if (dto.citizenshipBackImage) updateData.citizenshipBackImage = dto.citizenshipBackImage;
        if (dto.profileImage) updateData.profileImage = dto.profileImage;
        if (dto.selfieImage) updateData.selfieImage = dto.selfieImage;

        const updated = await providerProfileRepo.update(profile.id, updateData);

        if (!updated) {
          res.status(404).json({ message: 'Provider profile not found' });
        return;
        }
        profile = updated;
      }

      res.status(200).json({
        message: 'Verification documents submitted successfully. Your verification is being processed by admin.',
        profile: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  
  async getVerificationStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);

      if (!profile) {
        res.status(200).json({
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
        return;
      }

      const hasDocuments = !!(
        profile.citizenshipFrontImage ||
        profile.citizenshipBackImage ||
        profile.profileImage ||
        profile.selfieImage
      );

      const status = hasDocuments ? profile.verificationStatus : VERIFICATION_STATUS.NOT_SUBMITTED;

      res.status(200).json({
        verificationStatus: status,
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

  
  async getVerificationSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
      }

      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);

      if (!profile) {
        res.status(200).json({
          status: VERIFICATION_STATUS.NOT_SUBMITTED,
          fullName: undefined,
          phoneNumber: undefined,
          citizenshipNumber: undefined,
          serviceRole: undefined,
          address: undefined,
          verifiedAt: undefined,
          rejectionReason: undefined,
        });
        return;
      }

      const hasDocuments = !!(
        profile.citizenshipFrontImage ||
        profile.citizenshipBackImage ||
        profile.profileImage ||
        profile.selfieImage
      );

      const status = hasDocuments ? profile.verificationStatus : VERIFICATION_STATUS.NOT_SUBMITTED;

      res.status(200).json({
        status: status,
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        citizenshipNumber: profile.citizenshipNumber,
        serviceRole: profile.serviceRole,
        address: profile.address,
        verifiedAt: profile.verifiedAt ? profile.verifiedAt.toISOString() : undefined,
        rejectionReason: profile.rejectionReason,
      });
    } catch (error) {
      next(error);
    }
  }

  
  async reviewVerification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }





      const { providerId } = req.params;
      const dto = reviewVerificationSchema.parse(req.body);

      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findById(providerId);
      
      if (!profile) {
        res.status(404).json({ message: 'Provider profile not found' });
        return;
      }

      const updateData: any = {
        verificationStatus: dto.status,
      };

      if (dto.status === VERIFICATION_STATUS.VERIFIED) {
        updateData.verifiedAt = new Date();
        updateData.rejectionReason = undefined;
      } else if (dto.status === VERIFICATION_STATUS.PENDING) {
        updateData.rejectionReason = undefined;
        updateData.verifiedAt = undefined;
      }

      const updated = await providerProfileRepo.update(providerId, updateData);

      if (!updated) {
        res.status(404).json({ message: 'Provider profile not found' });
        return;
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
