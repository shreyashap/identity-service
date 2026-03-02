import { Router } from 'express';
import { identifyController } from '../controllers/identify.controller.js';

const router = Router();

router.post('/identify', identifyController);

export default router;
