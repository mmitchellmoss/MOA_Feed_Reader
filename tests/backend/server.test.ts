import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createServerApp } from '../../server';
import Parser from 'rss-parser';

// Mock rss-parser to avoid hitting the actual network during tests
vi.mock('rss-parser');

describe('Backend API Tests', () => {
  it('GET /api/feed should return the feed successfully', async () => {
    // Setup the mock to return a fake feed
    const mockFeed = {
      title: 'Mock BMW MOA Feed',
      items: [
        {
          title: 'Test Post 1',
          creator: 'Test User',
          pubDate: new Date().toISOString(),
          link: 'https://forums.bmwmoa.org/test1'
        }
      ]
    };
    
    Parser.prototype.parseURL = vi.fn().mockResolvedValue(mockFeed);

    const app = await createServerApp();
    const response = await request(app).get('/api/feed');

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Mock BMW MOA Feed');
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].title).toBe('Test Post 1');
  });

  it('GET /api/feed should return 500 on parse error', async () => {
    Parser.prototype.parseURL = vi.fn().mockRejectedValue(new Error('Network error'));

    const app = await createServerApp();
    const response = await request(app).get('/api/feed');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Failed to fetch RSS feed');
  });
});
