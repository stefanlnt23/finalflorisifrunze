import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadVideo() {
  try {
    console.log('Uploading video to Cloudinary...');
    
    const videoPath = path.resolve(__dirname, '../client/public/gardencut.mp4');
    
    const result = await cloudinary.uploader.upload(videoPath, {
      resource_type: 'video',
      public_id: 'garden-background-video',
      folder: 'garden-videos',
      quality: 'auto',
      format: 'mp4',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    
    console.log('Video uploaded successfully!');
    console.log('Video URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    
    // Generate optimized URL for web
    const optimizedUrl = cloudinary.url(result.public_id, {
      resource_type: 'video',
      quality: 'auto:good',
      format: 'mp4',
      fetch_format: 'auto'
    });
    
    console.log('Optimized URL:', optimizedUrl);
    
    return {
      url: result.secure_url,
      optimizedUrl: optimizedUrl,
      publicId: result.public_id
    };
    
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
}

// Run the upload
uploadVideo()
  .then((result) => {
    console.log('\nUpload completed successfully!');
    console.log('Use this URL in your video components:', result.optimizedUrl);
  })
  .catch((error) => {
    console.error('Upload failed:', error);
    process.exit(1);
  });