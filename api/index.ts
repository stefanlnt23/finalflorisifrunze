import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';
import { connectToMongoDB } from '../server/mongodb';
import { storage } from '../server/storage';
import { MongoDBStorage } from '../server/mongodb-storage';

let app: express.Application | null = null;

async function createApp() {
  if (app) return app;
  
  const expressApp = express();
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: false }));

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
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
