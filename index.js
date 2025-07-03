const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('downloads'));

app.post('/convert', (req, res) => {
  const { url } = req.body;
  if (!url || !url.endsWith('.m3u8')) {
    return res.status(400).json({ error: 'URL inválida' });
  }

  const filename = `${uuidv4()}.mp4`;
  const output = path.join(__dirname, 'downloads', filename);

  ffmpeg(url)
    .outputOptions('-c copy', '-bsf:a aac_adtstoasc')
    .on('end', () => {
      return res.json({ url: `/downloads/${filename}` });
    })
    .on('error', (err) => {
      console.error(err);
      return res.status(500).json({ error: 'Erro na conversão' });
    })
    .save(output);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
