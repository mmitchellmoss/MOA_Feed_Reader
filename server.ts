import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Parser from 'rss-parser';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Creates and configures the Express application.
 * Defines API routes and Vite middleware for SPA serving.
 * 
 * @returns {Promise<express.Express>} The configured Express application
 */
export async function createServerApp() {
  const app = express();
  
  /**
   * RSS Parser instance configured to map 'content:encoded' to 'content'
   * for standardizing feed item bodies.
   */
  const parser = new Parser({
    customFields: {
      item: [
        ['content:encoded', 'content'],
      ],
    },
  });

  app.use(cors());
  app.use(express.json());

  /**
   * GET /api/feed
   * Fetches the latest BMW MOA forum RSS feed, parses it, and returns it as JSON.
   */
  app.get('/api/feed', async (req, res) => {
    try {
      const feedUrl = 'https://forums.bmwmoa.org/forums/-/index.rss';
      const feed = await parser.parseURL(feedUrl);
      res.json(feed);
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      res.status(500).json({ error: 'Failed to fetch RSS feed' });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === 'production') {
    // Production serving
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

/**
 * Starts the HTTP server on the specified port.
 */
async function startServer() {
  const PORT = 3000;
  const app = await createServerApp();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

// Only start the server if this file is run directly (not imported in a test)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}
