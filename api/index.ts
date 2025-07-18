import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes.js';
import { connectToMongoDB } from '../server/mongodb.js';
import { storage } from '../server/storage.js';
import { MongoDBStorage } from '../server/mongodb-storage.js';

let app: express.Application | null = null;

async function createApp() {
  if (app) return app;
  
  const expressApp = express();
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: false }));

  // Security headers middleware for API
  expressApp.use((req, res, next) => {
    // Content Security Policy
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://kit.fontawesome.com https://ka-f.fontawesome.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://kit.fontawesome.com https://ka-f.fontawesome.com; font-src 'self' https://fonts.gstatic.com https://ka-f.fontawesome.com; img-src 'self' data: https: blob:; media-src 'self' https: data: blob:; connect-src 'self' https: wss:; frame-ancestors 'self';");
    
    // X-Frame-Options
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    // X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
    
    next();
  });

  // Connect to MongoDB
  await connectToMongoDB();
  
  // Seed initial data if needed
  if (storage instanceof MongoDBStorage) {
    await (storage as any).seedDemoData();
  }
  
  // Register API routes
  await registerRoutes(expressApp);
  
  app = expressApp;
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await createApp();
    return expressApp(req, res);
  } catch (error) {
    console.error('API Error:', error);
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('connect')) {
      return res.status(500).json({ 
        error: 'Database connection failed. Please check environment variables.',
        message: 'A server error occurred while connecting to the database.'
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'A server error occurred. Please try again later.'
    });
  }
}
