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
    const feed = await parser.parseURL(feedUrl);
    
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
