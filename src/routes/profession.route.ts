import { Router } from 'express';
import { ProfessionController } from '../controllers/profession.controller';

const router = Router();
const professionController = new ProfessionController();

router.get('/', (req, res, next) => professionController.getAllProfessions(req, res, next));

export default router;
