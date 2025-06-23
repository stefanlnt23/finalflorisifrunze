import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Generate optimized video URL
const videoUrl = cloudinary.url('garden-videos/garden-background-video', {
  resource_type: 'video',
  quality: 'auto:good',
  format: 'mp4',
  fetch_format: 'auto',
  secure: true
});

console.log('Cloudinary Video URL:', videoUrl);