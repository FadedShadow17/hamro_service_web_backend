import { Router } from 'express';
import { RatingsController } from '../controllers/ratings.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const ratingsController = new RatingsController();

router.post('/', requireAuth, (req, res, next) =>
  ratingsController.create(req, res, next)
);

export default router;
