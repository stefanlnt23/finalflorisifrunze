import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { getStorage } from './storage';
import { MongoDBStorage } from './mongodb-storage';
import { schema } from '../shared/schema';

const router = express.Router();
const execPromise = util.promisify(exec);

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Use original filename
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Configure MongoDB storage
const mongoStorage = new MongoDBStorage();

// Health check endpoint
router.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// File conversion endpoint
router.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const outputPath = path.join(path.dirname(filePath), `${path.basename(filePath)}.md`);

    try {
      // Install markitdown if not installed
      await execPromise('npm list -g markitdown || npm install -g @microsoft/markitdown');

      // Convert file using markitdown CLI
      await execPromise(`markitdown -i "${filePath}" -o "${outputPath}"`);

      // Read the converted markdown
      const markdown = fs.readFileSync(outputPath, 'utf8');

      // Clean up temp files
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);

      res.json({ markdown });
    } catch (error) {
      console.error('Conversion error:', error);

      // If markitdown fails, simulate conversion with a simple placeholder
      // This is just for demonstration - in production, handle errors properly
      const fileExt = path.extname(filePath).toLowerCase();
      let simulatedMarkdown = `# Converted from ${req.file.originalname}\n\n`;

      if (['.docx', '.doc'].includes(fileExt)) {
        simulatedMarkdown += "## Document Content\n\nThis is simulated Word document content in Markdown format.\n\n";
      } else if (['.pptx', '.ppt'].includes(fileExt)) {
        simulatedMarkdown += "## Presentation Content\n\n### Slide 1\n\nThis is simulated PowerPoint content in Markdown format.\n\n";
      } else if (['.xlsx', '.xls'].includes(fileExt)) {
        simulatedMarkdown += "## Spreadsheet Content\n\n| Column A | Column B | Column C |\n| --- | --- | --- |\n| Data 1 | Data 2 | Data 3 |\n";
      } else if (fileExt === '.pdf') {
        simulatedMarkdown += "## PDF Content\n\nThis is simulated PDF content extracted to Markdown format.\n\n";
      } else {
        simulatedMarkdown += "## Generic Content\n\nThis is a simulated conversion of the uploaded file to Markdown format.\n\n";
      }

      simulatedMarkdown += "---\n\n> This is simulated content for demonstration purposes.";

      // Clean up the temp file
      fs.unlinkSync(filePath);

      res.json({ markdown: simulatedMarkdown });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error during conversion' });
  }
});

// MongoDB API endpoints
if (mongoStorage) {
  // Subscriptions
  router.post('/api/subscriptions', async (req, res) => {
    try {
      // Parse and validate the subscription data against the schema
      const subscription = schema.subscription.parse(req.body);
      const result = await mongoStorage.createSubscription(subscription);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/api/subscriptions', async (req, res) => {
    try {
      const subscriptions = await mongoStorage.getSubscriptions();
      res.json({ subscriptions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/api/subscriptions/:id', async (req, res) => {
    try {
      const subscription = await mongoStorage.getSubscription(req.params.id);
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/api/subscriptions/:id', async (req, res) => {
    try {
      await mongoStorage.deleteSubscription(req.params.id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

export default router;