import express from 'express';
import multer from 'multer';
import * as fs from 'fs';
import { unlinkSync } from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url'; // Importar para obter __dirname

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

// Obter __dirname usando import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do cliente Speech-to-Text do Google Cloud
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'credentials.json';

import { SpeechClient } from '@google-cloud/speech';

const speechClient = new SpeechClient();

// Função para obter endereços IP
import { networkInterfaces } from 'os';
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

// Endpoint para transcrever áudio
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

// Endpoint para análise de áudio usando script Python
app.post('/analyze', upload.single('audio'), (req, res) => {
    try {
        console.log('Endpoint /analyze accessed');
        const filePath = req.file.path;

        // Verificar se o arquivo existe antes de processá-lo
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found: ' + filePath);
        }

        // Log para verificação do caminho do arquivo
        console.log('File path:', filePath);

        // Usar path.join para garantir que o caminho do arquivo esteja corretamente formatado
        const normalizedFilePath = path.join(__dirname, filePath);
        console.log('Normalized file path:', normalizedFilePath);

        // Chamar o script Python para análise de áudio
        exec(`python ${path.join(__dirname, 'analyze_audio.py')} "${normalizedFilePath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error calling Python function:', error);
                res.status(500).send('Error calling Python function');
                return;
            }
            if (stderr) {
                console.error('Error output from Python function:', stderr);
                res.status(500).send('Error output from Python function');
                return;
            }

            console.log('Python script output:', stdout);
            res.json({ analysis: stdout.trim() }); // Enviar resposta para o frontend
        });
    } catch (error) {
        console.error('Error calling Python function:', error);
        res.status(500).send('Error calling Python function');
    } finally {
        // Excluir o arquivo de áudio após o processamento
        if (req.file && req.file.path) {
            unlinkSync(req.file.path);
        }
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Server is running on http://${results['Wi-Fi 4']}:${port}`);
});
