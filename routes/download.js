const express = require('express');
const axios = require('axios');
const router = express.Router();

const apiHeaders = {
  "accept": "*/*",
  "accept-language": "en-US,en;q=0.9",
  "content-type": "application/json",
  "priority": "u=1, i",
  "sec-ch-ua": "\"Google Chrome\";v=\"137\", \"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"Windows\"",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "Referer": "https://cnvmp3.com/v25",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

const checkDb = async (youtubeId, quality = 0) => {
  const response = await axios.post(
    "https://cnvmp3.com/check_database.php",
    { youtube_id: youtubeId, quality, formatValue: 1 },
    { headers: apiHeaders }
  );
  return response.data;
};

const convertAudio = async (url, title) => {
  const response = await axios.post(
    "https://cnvmp3.com/download_video_ucep.php",
    { url, quality: 0, title: title || "YouTube Audio", formatValue: 1 },
    { headers: apiHeaders }
  );
  return response.data;
};

const saveToDb = async (youtubeId, path, title, quality = 0) => {
  await axios.post(
    "https://cnvmp3.com/insert_to_database.php",
    { youtube_id: youtubeId, server_path: path, quality, title, formatValue: 1 },
    { headers: apiHeaders }
  );
};

const getAudioStream = async (url) => {
  const response = await axios.get(url, {
    responseType: 'stream',
    headers: { "Referer": "https://cnvmp3.com/", "origin": "https://cnvmp3.com" }
  });
  return response.data;
};

router.get('/', async (req, res) => {
  try {
    const { url, title } = req.query;
    const youtubeId = url.split('v=')[1];
    const filename = (title || 'audio').replace(/[^a-z0-9\-._]/gi, '_');

    const dbResult = await checkDb(youtubeId, 0);
    if (dbResult.success && dbResult.data?.server_path) {
      const audioStream = await getAudioStream(dbResult.data.server_path);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.mp3"`);
      res.setHeader('Content-Type', 'audio/mpeg');
      audioStream.pipe(res);
      return;
    }

    const convertResult = await convertAudio(url, title);
    if (!convertResult.success || !convertResult.download_link) {
      throw new Error('Conversion failed');
    }

    await saveToDb(youtubeId, convertResult.download_link, title, 0);
    const audioStream = await getAudioStream(convertResult.download_link);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    audioStream.pipe(res);

  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

module.exports = router;