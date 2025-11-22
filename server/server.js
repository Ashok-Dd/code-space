import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./config/database.js";
import codeRoutes from "./routes/codeRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { limiter } from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();

// ✅ Security Middleware
app.use(helmet()); // Security headers
app.use(cors({ 
  origin: "*",
  credentials: true 
}));

// ✅ Performance Middleware
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); // JSON parser with limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Rate Limiting
app.use(limiter);

// ✅ Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ✅ Routes
app.use('/', codeRoutes);

// ✅ Error Handler (must be last)
app.use(errorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

connectDB().then(() => {
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

