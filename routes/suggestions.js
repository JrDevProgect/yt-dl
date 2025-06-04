const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const { q } = req.query;

  if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

  try {
    const config = {
      method: 'GET',
      url: 'https://suggestqueries-clients6.youtube.com/complete/search',
      params: {
        client: 'youtube',
        ds: 'yt',
        gl: 'GB',
        q: q,
        xhr: 't'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0',
        'Accept-Encoding': 'gzip',
        'origin': 'https://www.youtube.com',
        'referer': 'https://www.youtube.com',
        'accept-language': 'en-GB,en;q=0.9'
      }
    };

    const response = await axios.request(config);
    const suggestions = response.data[1].map(item => item[0]);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

module.exports = router;