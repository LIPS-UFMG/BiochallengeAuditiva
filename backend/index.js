import express from 'express';
import multer from 'multer';
import * as fs from 'fs';
import { unlinkSync } from 'fs';
import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';
import { SpeechClient } from '@google-cloud/speech';
import { networkInterfaces } from 'os';
import { exec } from 'child_process';

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

process.env.GOOGLE_APPLICATION_CREDENTIALS = 'credentials.json';

const speechClient = new SpeechClient();

const nets = networkInterfaces();
const results = Object.create(null);

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
    if (net.family === familyV4Value && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
}

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const filePath = req.file.path;

    const audioInfo = await ffprobe(filePath, { path: ffprobeStatic.path });
    const sampleRate = parseInt(audioInfo.streams[0].sample_rate, 10);
    const codec = audioInfo.streams[0].codec_name;

    const audioBytes = fs.readFileSync(filePath).toString('base64');

    const audio = {
      content: audioBytes,
    };

    const config = {
      encoding: codec === 'amr_nb' ? 'AMR' : 'LINEAR16',
      sampleRateHertz: sampleRate,
      languageCode: 'pt-BR',
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await speechClient.recognize(request);

    console.log('Response received:', response.results);

    if (response.results && response.results.length > 0) {
      const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join('\n');

      res.json({ transcription: transcription });
    } else {
      res.json({ transcription: null });
    }
  } catch (error) {
    console.error('Error during transcription:', error);
    res.status(500).send('Error during transcription');
  } finally {
    if (req.file && req.file.path) {
      unlinkSync(req.file.path);
    }
  }
});

app.post('/recognize_sound', upload.single('audio'), async (req, res) => {
  try {
    const filePath = req.file.path;

    exec(`python sound_recognition.py ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error calling Python sound recognition function:', error);
        res.status(500).send('Error calling Python sound recognition function');
        return;
      }
      if (stderr) {
        console.error('Error output from Python sound recognition function:', stderr);
        res.status(500).send('Error output from Python sound recognition function');
        return;
      }

      console.log('Python sound recognition output:', stdout);
      res.json({ soundRecognitionResult: stdout.trim() });
    });

  } catch (error) {
    console.error('Error calling Python sound recognition function:', error);
    res.status(500).send('Error calling Python sound recognition function');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://${results['Wi-Fi 4'][0]}:${port}`);
});
