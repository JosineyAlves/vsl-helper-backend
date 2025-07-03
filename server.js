const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

app.get('/convert', (req, res) => {
  const videoUrl = req.query.url;
  const title = (req.query.title || 'video').replace(/[^a-z0-9]/gi, '_').toLowerCase();

  if (!videoUrl || !videoUrl.includes('.m3u8')) {
    return res.status(400).send('URL inválida');
  }

  const output = path.resolve(__dirname, `${title}.mp4`);
  const command = `ffmpeg -y -i "${videoUrl}" -c copy -bsf:a aac_adtstoasc "${output}"`;

  exec(command, (err) => {
    if (err) {
      console.error('Erro ao converter:', err);
      return res.status(500).send('Erro ao converter o vídeo.');
    }

    res.download(output, `${title}.mp4`, () => {
      require('fs').unlinkSync(output); // Apaga após envio
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});
