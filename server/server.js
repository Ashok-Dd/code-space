import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import { connectDB } from "./config/database.js";
import codeRoutes from "./routes/codeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { limiter } from "./middleware/rateLimiter.js";
import { sanitizeBody } from "./middleware/sanitize.js";
import { optionalAuth } from "./middleware/auth.js";
import { registerCodeSocket } from "./sockets/codeSocket.js";
import { CodeSpace } from "./models/codeModel.js";

dotenv.config();

const app = express();

// Render/Vercel/most PaaS hosts sit behind exactly one reverse proxy; trusting
// it lets express-rate-limit key on each visitor's real IP instead of the
// proxy's IP (which would otherwise bucket every visitor together).
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// credentials: true is required so the auth cookie travels with both REST
// calls and the Socket.IO handshake — the origin allowlist above is what
// keeps that safe (no wildcard origin is used alongside it).
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

// ✅ Security Middleware
app.use(helmet()); // Security headers
app.use(cors(corsOptions));
app.use(cookieParser());

// ✅ Performance Middleware
app.use(compression()); // Compress responses
app.use(express.json({ limit: '1mb' })); // JSON parser with limit
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ✅ Strip Mongo operators from parsed JSON bodies (must run after the body parsers above)
app.use(sanitizeBody);

// ✅ Rate Limiting
app.use(limiter);

// ✅ Health Check
app.get('/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'OK' : 'DB_DISCONNECTED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/', optionalAuth, codeRoutes);

// ✅ Error Handler (must be last)
app.use(errorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: corsOptions });
registerCodeSocket(io);

connectDB().then(async () => {
  // Schema changes to indexes (e.g. the TTL field move from lastAccessed to
  // expiresAt) aren't dropped automatically by Mongoose — sync them so a
  // stale index can't silently keep expiring owned snippets.
  await CodeSpace.syncIndexes();
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

// ✅ Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});
