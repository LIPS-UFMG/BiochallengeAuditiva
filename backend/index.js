import express from "express";
import multer from "multer";
import * as fs from "fs";
import { unlinkSync } from "fs";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import ffprobe from "ffprobe";
import ffprobeStatic from "ffprobe-static";
import { SpeechClient } from "@google-cloud/speech";
import { networkInterfaces } from "os";

const app = express();
const port = 3000;

const upload = multer({ dest: "uploads/" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.GOOGLE_APPLICATION_CREDENTIALS = "credentials.json";

const speechClient = new SpeechClient();

const nets = networkInterfaces();
const results = Object.create(null);

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
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
    exec(
      `python ${path.join(__dirname, "analyze_audio.py")} "${filePath}"`,
      (error, stdout, stderr) => {
        if (error) {
          reject("Error calling Python function");
          return;
        }
        if (stderr) {
          reject("Error output from Python function");
          return;
        }
        resolve(stdout.trim());
      }
    );
  });
};

app.post("/analyze", upload.single("audio"), async (req, res) => {
  console.log("A: Received analysis request");
  try {
    const filePath = req.file.path;
    if (!filePath) throw new Error("A: No audio file uploaded");

    console.log(`A: Analyzing file at ${filePath}`);
    const analysisResult = await analyzeAudio(filePath);
    console.log(`A: Frequency Analysis Result: ${analysisResult}`); // Print the frequency result to console

    res.json({ analysis: analysisResult }); // Return the analysis result
  } catch (error) {
    console.error("A: Error during analysis:", error);
    res.status(500).send("A: Error during analysis");
  } finally {
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("A: Error deleting temporary file:", err);
      } else {
        console.log("A: Temporary file deleted:", req.file.path);
      }
    });
  }
  console.log("A: Analysis request completed");
});

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  console.log("Received transcription request");
  try {
    const filePath = req.file.path;

    console.log(`T: Transcribing file at ${filePath}`);
    const audioInfo = await ffprobe(filePath, { path: ffprobeStatic.path });
    const sampleRate = parseInt(audioInfo.streams[0].sample_rate, 10);
    const codec = audioInfo.streams[0].codec_name;

    // console.log('Audio Info:', audioInfo);

    const audioBytes = fs.readFileSync(filePath).toString("base64");

    const audio = {
      content: audioBytes,
    };

    const config = {
      encoding: codec === "amr_nb" ? "AMR" : "LINEAR16",
      sampleRateHertz: sampleRate,
      languageCode: "pt-BR",
    };

    const request = {
      audio: audio,
      config: config,
    };

    console.log("T: Sending request to Google Speech-to-Text API");
    const [response] = await speechClient.recognize(request);

    console.log("T: Response received from Google Speech-to-Text API");
    if (response.results && response.results.length > 0) {
      const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");

      console.log("T: Transcription:", transcription);
      res.json({ transcription: transcription });
    } else {
      res.json({ transcription: null });
    }
  } catch (error) {
    console.error("T: Error during transcription:", error);
    res.status(500).send("T: Error during transcription");
  } finally {
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("T: Error deleting temporary file:", err);
      } else {
        console.log("T: Temporary file deleted:", req.file.path);
      }
    });
  }
  console.log("T: Transcription request completed");
});

app.listen(port, () => {
  console.log(`Server is running on http://${results["Wi-Fi 4"]}:${port}`);
});
