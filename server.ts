import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Parser from 'rss-parser';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const parser = new Parser({
    customFields: {
      item: [
        ['content:encoded', 'content'],
      ],
    },
  });

  app.use(cors());
  app.use(express.json());

  // API Route to fetch RSS feed
  app.get('/api/feed', async (req, res) => {
    try {
      const feedUrl = 'https://forums.bmwmoa.org/forums/-/index.rss';
      const feed = await parser.parseURL(feedUrl);
      // Debug log first item to see available fields
      if (feed.items.length > 0) {
        console.log('Sample Feed Item Fields:', Object.keys(feed.items[0]));
        console.log('Sample contentSnippet:', feed.items[0].contentSnippet?.substring(0, 50));
        console.log('Sample content:', feed.items[0].content?.substring(0, 50));
      }
      res.json(feed);
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      res.status(500).json({ error: 'Failed to fetch RSS feed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
