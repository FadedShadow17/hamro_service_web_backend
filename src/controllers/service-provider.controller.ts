import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { HttpError } from '../errors/http-error';
import { hashPassword } from '../services/auth.service';
import { getUserFileUrl } from '../services/upload.service';
import { USER_ROLES } from '../config/constants';

export class ServiceProviderController {

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await User.find({ role: USER_ROLES.USER }).select('-passwordHash').sort({ createdAt: -1 });
            res.status(200).json({ users });
        } catch (error) {
            next(error);
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await User.findById(req.params.id).select('-passwordHash');
            if (!user) {
                throw new HttpError(404, 'User not found');
            }
            res.status(200).json({ user });
        } catch (error) {
            next(error);
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, password, phone } = req.body;

            if (!name || !email || !password) {
                throw new HttpError(400, 'Name, email and password are required');
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new HttpError(409, 'Email already registered');
            }

            const hashedPassword = await hashPassword(password);

            const userData: any = {
                name,
                email,
                passwordHash: hashedPassword,
                phone,
                role: USER_ROLES.USER,
            };

            if (req.file) {
                userData.profileImageUrl = getUserFileUrl(req.file.filename);
            }

            const user = await User.create(userData);

            const userResponse = user.toObject();

            delete userResponse.passwordHash;

            res.status(201).json({ user: userResponse });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const updates: any = { ...req.body };

            delete updates.password;
            delete updates.passwordHash; // Ensure raw hash update isn't allowed directly

            if (req.file) {
                updates.profileImageUrl = getUserFileUrl(req.file.filename);
            }

            const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');

            if (!user) {
                throw new HttpError(404, 'User not found');
            }

            res.status(200).json({ user });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                throw new HttpError(404, 'User not found');
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}
