import { Router } from 'express';
import multer from 'multer';
import {
  uploadFiles,
  startReconciliation,
  getHistory,
  getHistoryById,
  deleteHistoryBatch,
} from '../controllers/reconciliationController.js';

const router  = Router();
const storage = multer.memoryStorage(); // keep files as Buffer in memory
const upload  = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = ['text/csv', 'application/pdf', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'application/octet-stream'];
    const ext = file.originalname.toLowerCase();
    if (allowed.includes(file.mimetype) || ext.endsWith('.csv') || ext.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// POST /api/reconciliation/upload  — accepts 3 named file fields
router.post(
  '/upload',
  upload.fields([
    { name: 'bankStatement',  maxCount: 1 },
    { name: 'invoices',       maxCount: 1 },
    { name: 'paymentRecords', maxCount: 1 },
  ]),
  uploadFiles
);

// POST /api/reconciliation/start
router.post('/start', startReconciliation);

// GET  /api/reconciliation/history
router.get('/history', getHistory);

// GET  /api/reconciliation/history/:id
router.get('/history/:id', getHistoryById);

// DELETE /api/reconciliation/history/:id
router.delete('/history/:id', deleteHistoryBatch);

export default router;
