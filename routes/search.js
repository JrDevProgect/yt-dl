const express = require('express');
const axios = require('axios');
const router = express.Router();

const youtubeConfig = (query) => ({
  method: 'POST',
  url: 'https://www.youtube.com/youtubei/v1/search',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0',
    'Content-Type': 'application/json',
    'origin': 'https://www.youtube.com',
    'referer': 'https://www.youtube.com'
  },
  data: JSON.stringify({
    query: query + ' official audio',
    context: {
      client: {
        clientName: 'WEB',
        clientVersion: '2.20250602.01.01',
        hl: 'en',
        gl: 'US'
      }
    },
    params: 'EgWKAQIIAWoKEAMQBBAJEAoQBQ%3D%3D'
  })
});

const parseResults = (data) => {
  const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents;
  return contents?.filter(item => item.videoRenderer).map(video => ({
    id: video.videoRenderer.videoId,
    title: video.videoRenderer.title.runs[0].text,
    thumbnail: video.videoRenderer.thumbnail.thumbnails[0].url,
    duration: video.videoRenderer.lengthText?.simpleText || 'N/A',
    channel: video.videoRenderer.ownerText.runs[0].text,
    url: `https://www.youtube.com/watch?v=${video.videoRenderer.videoId}`
  })) || [];
};

router.post('/', async (req, res) => {
  try {
    const response = await axios(youtubeConfig(req.body.query));
    res.json(parseResults(response.data).slice(0, 10));
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;