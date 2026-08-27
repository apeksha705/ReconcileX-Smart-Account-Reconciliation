import { Router } from 'express';
import { getReportSummary, exportCSV } from '../controllers/reportController.js';

const router = Router();

// GET /api/reports/summary
router.get('/summary', getReportSummary);

// GET /api/reports/export  → CSV download
router.get('/export', exportCSV);

export default router;
