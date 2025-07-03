const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/api/download', (req, res) => {
  const { url, title = 'vsl-video' } = req.query;
  if (!url || !url.endsWith('.m3u8')) {
    return res.status(400).json({ error: 'URL inválida' });
  }

  const sanitizedTitle = title.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '-').toLowerCase();
  const outputFile = `${sanitizedTitle}.mp4`;

  const command = `ffmpeg -i "${url}" -c copy -bsf:a aac_adtstoasc "${outputFile}"`;

  exec(command, { cwd: __dirname }, (error) => {
    if (error) {
      return res.status(500).json({ error: 'Erro ao baixar vídeo' });
    }

    const filePath = path.join(__dirname, outputFile);
    res.download(filePath, outputFile, (err) => {
      if (err) {
        console.error('Erro ao enviar arquivo:', err.message);
      }
    });
  });
});

app.get('/', (req, res) => {
  res.send('🟢 VSL Helper Backend Online');
});

app.listen(PORT, () => {
  console.log(`✅ VSL Helper rodando em http://localhost:${PORT}`);
});
