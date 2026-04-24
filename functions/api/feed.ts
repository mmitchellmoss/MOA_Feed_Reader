import Parser from 'rss-parser';

export async function onRequest(context: any) {
  try {
    const parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'content'],
        ],
      },
    });

    const feedUrl = 'https://forums.bmwmoa.org/forums/-/index.rss';
    
    // Cloudflare Workers fully support the modern fetch() API.
    // We fetch the raw XML first, then pass the string to rss-parser.
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from forums: ${response.status} ${response.statusText}`);
    }
    const xml = await response.text();
    const feed = await parser.parseString(xml);
    
    return new Response(JSON.stringify(feed), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch RSS feed', details: (error as Error).message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
