import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  updateTransactionStatus,
} from '../controllers/transactionController.js';

const router = Router();

// GET  /api/transactions
router.get('/', getTransactions);

// GET  /api/transactions/:id
router.get('/:id', getTransactionById);

// PATCH /api/transactions/:id/status
router.patch('/:id/status', updateTransactionStatus);

export default router;
