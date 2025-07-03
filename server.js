const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

app.post('/convert', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.endsWith('.m3u8')) {
    return res.status(400).json({ error: 'URL inválida' });
  }

  const tempFile = path.join(__dirname, 'output.mp4');
  try {
    ffmpeg(url)
      .outputOptions([
        '-c copy',
        '-bsf:a aac_adtstoasc'
      ])
      .on('end', () => {
        res.download(tempFile, 'video-vsl.mp4', () => {
          fs.unlinkSync(tempFile); // remove o arquivo temporário
        });
      })
      .on('error', (err) => {
        console.error('Erro FFmpeg:', err);
        res.status(500).json({ error: 'Erro na conversão' });
      })
      .save(tempFile);
  } catch (e) {
    console.error('Erro geral:', e.message);
    res.status(500).json({ error: 'Erro inesperado' });
  }
});

app.get('/', (_, res) => {
  res.send('✅ VSL Helper API ativa.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
