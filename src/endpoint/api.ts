import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint({
  id: 'iconify-proxy',
  handler: (router) => {
    // Get all collections
    router.get('/collections', async (req, res) => {
      try {
        const response = await fetch('https://api.iconify.design/collections');
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
      } catch (error) {
        console.error('Failed to fetch collections:', error);
        res.status(500).json({ 
          error: 'Failed to fetch collections',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Get icons from a specific collection
    router.get('/collection', async (req, res) => {
      const { prefix } = req.query;
      
      if (!prefix) {
        return res.status(400).json({ error: 'Prefix parameter is required' });
      }

      try {
        const response = await fetch(
          `https://api.iconify.design/collection?prefix=${prefix}`
        );
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
      } catch (error) {
        console.error('Failed to fetch icons:', error);
        res.status(500).json({ 
          error: 'Failed to fetch icons',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Search across all icon sets
    router.get('/search', async (req, res) => {
      const { query, limit = '100' } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      if (query.length < 2) {
        return res.json({ icons: [] });
      }

      try {
        const response = await fetch(
          `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=${limit}`
        );
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
      } catch (error) {
        console.error('Failed to search icons:', error);
        res.status(500).json({ 
          error: 'Failed to search icons',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Get a specific icon as SVG
    router.get('/icon/:collection/:icon', async (req, res) => {
      const { collection, icon } = req.params;
      const { height = '24' } = req.query;

      try {
        const response = await fetch(
          `https://api.iconify.design/${collection}:${icon}.svg?height=${height}`
        );
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const svg = await response.text();
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(svg);
      } catch (error) {
        console.error('Failed to fetch icon:', error);
        res.status(500).json({ 
          error: 'Failed to fetch icon',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  },
});
