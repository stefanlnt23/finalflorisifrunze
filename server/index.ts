import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToMongoDB } from "./mongodb";
import { storage } from "./storage";
import { MongoDBStorage } from "./mongodb-storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// WWW redirect middleware for Replit deployment
app.use((req, res, next) => {
  const host = req.get('host');
  if (host && host.startsWith('www.')) {
    const newHost = host.slice(4); // Remove 'www.'
    const protocol = req.get('x-forwarded-proto') || 'http';
    return res.redirect(301, `${protocol}://${newHost}${req.originalUrl}`);
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        // For service detail endpoints, log more data
        if (path.includes('/services/') && capturedJsonResponse.service) {
          console.log(`API Response for ${path}:`, JSON.stringify(capturedJsonResponse));
        } else {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Connect to MongoDB first
    await connectToMongoDB();
    
    // Seed initial data if needed
    if (storage instanceof MongoDBStorage) {
      await (storage as any).seedDemoData();
    }
    
    // Then register API routes
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Use PORT environment variable for deployment platforms like Render
    // Fall back to 5000 for local development
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    server.listen({
      port,
      host: "0.0.0.0"
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    log(`Error starting server: ${error}`, 'server');
  }
})();
