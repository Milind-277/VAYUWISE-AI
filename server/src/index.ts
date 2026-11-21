import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route Imports
import aqiRoutes from './routes/aqiRoutes.js';
import routineRoutes from './routes/routineRoutes.js';
import indoorRoutes from './routes/indoorRoutes.js';
import simulatorRoutes from './routes/simulatorRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import communityRoutes from './routes/communityRoutes.js';

// Load environment variables with fallback resolution for monorepo roots
dotenv.config();
if (!process.env.GEMINI_API_KEY) {
  const possibleEnvPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'server/.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../server/.env'),
  ];
  for (const envPath of possibleEnvPaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      if (process.env.GEMINI_API_KEY) break;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Proxy Trust Configuration for Render reverse proxy
// Setting 'trust proxy' to 1 informs Express that it is behind a single reverse proxy (Render).
// This enables reliable extraction of client IPs for rate limiting while preventing client-side spoofing.
app.set('trust proxy', 1);

// CORS Configuration & Origin Validator
export function isOriginAllowed(origin: string | undefined): boolean {
  // Allow requests with no origin (e.g. same-origin fetches, curl, mobile apps, server-to-server)
  if (!origin) {
    return true;
  }

  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:4173',
    'http://127.0.0.1:4173'
  ];

  if (process.env.CLIENT_URL) {
    process.env.CLIENT_URL.split(',').forEach(url => {
      const trimmed = url.trim();
      if (trimmed && !allowedOrigins.includes(trimmed)) {
        allowedOrigins.push(trimmed);
      }
    });
  }

  if (process.env.RENDER_EXTERNAL_URL) {
    const renderUrl = process.env.RENDER_EXTERNAL_URL.trim();
    if (renderUrl && !allowedOrigins.includes(renderUrl)) {
      allowedOrigins.push(renderUrl);
    }
  }

  return allowedOrigins.includes(origin);
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Cross-Origin Request Blocked: Origin '${origin}' is not authorized by CORS policy.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));

// API Routes
app.use('/api/aqi', aqiRoutes);
app.use('/api/routine', routineRoutes);
app.use('/api/indoor', indoorRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/community', communityRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    appName: 'VAYUWISE AI',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '')
  });
});

// Serve static React client in production
const possibleDistPaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(__dirname, '../client/dist'),
];
const clientDistPath = possibleDistPaths.find(p => fs.existsSync(p)) || possibleDistPaths[0];
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // If client is not built yet (dev mode), return friendly JSON
      res.json({
        message: 'VAYUWISE AI Backend API Server is running.',
        apiDocs: '/api/health',
        hint: 'Start the Vite client in development mode on port 5173'
      });
    }
  });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err.message);
  if (err.message && err.message.includes('CORS')) {
    res.status(403).json({
      success: false,
      error: 'CORS Forbidden',
      message: err.message
    });
    return;
  }
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again later.' 
      : err.message
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  VAYUWISE AI Server running on http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Gemini AI API: ${process.env.GEMINI_API_KEY ? 'Configured (Active)' : 'Not Set (Using Offline Clean-Air Intelligence)'}`);
    console.log(`====================================================`);
  });
}

export default app;
export { app };
