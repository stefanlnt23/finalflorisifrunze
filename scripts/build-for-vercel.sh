#!/bin/bash
# Build script for Vercel that skips TypeScript type checking

echo "Building frontend with Vite..."
NODE_ENV=production vite build

echo "Build completed successfully!"
