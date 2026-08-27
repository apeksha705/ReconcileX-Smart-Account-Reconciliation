import { Router } from 'express';
import { getExceptions } from '../controllers/exceptionController.js';

const router = Router();

// GET /api/exceptions
router.get('/', getExceptions);

export default router;
