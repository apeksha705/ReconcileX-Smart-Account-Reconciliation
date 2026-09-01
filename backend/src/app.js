/**
 * app.js — Express application setup
 * Security middleware, routing, and global error handler.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import reconciliationRoutes from './routes/reconciliationRoutes.js';
import transactionRoutes    from './routes/transactionRoutes.js';
import exceptionRoutes      from './routes/exceptionRoutes.js';
import reportRoutes         from './routes/reportRoutes.js';
import dashboardRoutes      from './routes/dashboardRoutes.js';
import settingsRoutes       from './routes/settingsRoutes.js';

const app = express();

// ─── Security & Utility Middleware ────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow CSV downloads
}));

// Accept localhost dev + any Vercel deployment URL + explicit CLIENT_ORIGIN
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Render health checks, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any *.vercel.app subdomain automatically
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
  credentials: true,
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// JSON body parser — multer handles multipart, so we only need JSON/urlencoded here
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'reconcilex-api',
    version: '1.0.0',
    ts:      new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/transactions',   transactionRoutes);
app.use('/api/exceptions',     exceptionRoutes);
app.use('/api/reports',        reportRoutes);
app.use('/api/dashboard',      dashboardRoutes);
app.use('/api/settings',       settingsRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[Express Error]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error:   err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

export default app;
