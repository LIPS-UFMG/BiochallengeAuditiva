import express from 'express';
import multer from 'multer';
import * as fs from 'fs';
import { unlinkSync } from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { SpeechClient } from '@google-cloud/speech';
import { networkInterfaces } from 'os';
import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const analyzeAudio = (filePath) => {
    return new Promise((resolve, reject) => {
        exec(`python ${path.join(__dirname, 'analyze_audio.py')} "${filePath}"`, (error, stdout, stderr) => {
            if (error) {
                reject('Error calling Python function');
                return;
            }
            if (stderr) {
                reject('Error output from Python function');
                return;
            }
            resolve(stdout.trim());
        });
    });
};

app.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        const filePath = req.file.path;

        // Verificar se o arquivo de áudio foi enviado
        if (!filePath) {
            throw new Error('No audio file uploaded');
        }

        // Obter informações do áudio usando ffprobe
        const audioInfo = await ffprobe(filePath, { path: ffprobeStatic.path });
        const sampleRate = parseInt(audioInfo.streams[0].sample_rate, 10);
        const codec = audioInfo.streams[0].codec_name;

        // Ler o arquivo de áudio e converter para base64
        const audioBytes = fs.readFileSync(filePath).toString('base64');

        // Configuração para o reconhecimento de fala
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

        // Realizar a transcrição usando o cliente Speech-to-Text do Google Cloud
        const [response] = await speechClient.recognize(request);

        console.log('Response received:', response.results);

        // Verificar se há resultados de transcrição e enviar para o frontend
        if (response.results && response.results.length > 0) {
            const transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');

            res.json({ transcription: transcription });
        } else {
            res.json({ transcription: null });
        }
    } catch (error) {
        console.error('Error during transcription:', error);
        res.status(500).send('Error during transcription');
    } finally {
        // Excluir o arquivo de áudio após o processamento
        if (req.file && req.file.path) {
            unlinkSync(req.file.path);
        }
    }
});

app.post('/analyze', upload.single('audio'), async (req, res) => {
    try {
        const filePath = req.file.path;
        if (!filePath) throw new Error('No audio file uploaded');

        const analysisResult = await analyzeAudio(filePath);
        console.log(`Frequency Analysis Result: ${analysisResult}`); // Print the frequency result to console

        res.json({ analysis: analysisResult }); // Return the analysis result
    } catch (error) {
        console.error('Error during analysis:', error);
        res.status(500).send('Error during analysis');
    } finally {
        if (req.file && req.file.path) unlinkSync(req.file.path);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://${results['Wi-Fi 4'][0]}:${port}`);
});
