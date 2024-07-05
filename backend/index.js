import express from "express";
import multer from "multer";
import * as fs from "fs";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import ffprobe from "ffprobe";
import ffprobeStatic from "ffprobe-static";
import { SpeechClient } from "@google-cloud/speech";
import { networkInterfaces } from "os";
import noble from "noble-winrt"; // Biblioteca BLE

const app = express();
const port = 3000;

let characteristics;
let connectedDevice = null;

const DeviceUUID = "30aea40696aa"; // UUID do dispositivo ESP32 BLE (substituto do endereço MAC)
const ServiceUUID = "1111ffe1-0000-1000-8000-00805f9b34fa"; // UUID do serviço
const CharacteristicUUID = "0000ffe1-0000-1000-8000-00805f9b34fb"; // UUID da característica
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: "uploads/" });

process.env.GOOGLE_APPLICATION_CREDENTIALS = "credentials.json";

const speechClient = new SpeechClient();

const nets = networkInterfaces();
const results = Object.create(null);

app.use(express.json());

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

noble.on("stateChange", (state) => {
  if (state === "poweredOn") {
    console.log("BLE state powered on, ready to connect.");
  } else {
    console.log("BLE state not powered on, stopping scanning.");
    noble.stopScanning();
  }
});

app.get("/status", (req, res) => {
  res.json({
    isConnected: !!connectedDevice,
    device: connectedDevice ? connectedDevice.uuid : null,
  });
});

app.post("/connect", (req, res) => {
  if (!connectedDevice) {
    console.log("Starting BLE scan...");
    noble.startScanning([ServiceUUID], false);

    const onDiscover = (peripheral) => {
      if (peripheral.uuid === DeviceUUID) {
        noble.stopScanning();
        peripheral.connect((error) => {
          if (error) {
            console.error("Connection error:", error);
            return res.status(500).json({ message: "Connection error." });
          }
          console.log(`Connected to device: ${peripheral.uuid}`);
          connectedDevice = peripheral;

          peripheral.discoverSomeServicesAndCharacteristics(
            [ServiceUUID],
            [CharacteristicUUID],
            (err, services, characteristics) => {
              if (err) {
                console.error("Service discovery error:", err);
                return res
                  .status(500)
                  .json({ message: "Service discovery error." });
              }
              characteristics = characteristics;
              noble.removeListener("discover", onDiscover); // Remove listener after connecting
              res.json({
                message: "Connected successfully.",
                device: peripheral.uuid,
              });
            }
          );
        });
      }
    };

    noble.on("discover", onDiscover);
  } else {
    res.json({
      message: "Already connected.",
      device: connectedDevice.uuid,
    });
  }
});

app.post("/disconnect", (req, res) => {
  if (connectedDevice) {
    connectedDevice.disconnect((error) => {
      if (error) {
        console.error("Disconnection error:", error);
        res.status(500).json({ message: "Disconnection error." });
      } else {
        connectedDevice = null;
        console.log("Disconnected from device.");
        res.json({ message: "Disconnected successfully." });
      }
    });
  } else {
    res.json({ message: "No device connected." });
  }
});

app.post("/send", (req, res) => {
  console.log("Request body:", req.body);

  if (connectedDevice) {
    const { message } = req.body;
    if (!message) {
      console.log("No message provided");
      return res.status(400).json({ error: "No message provided." });
    }

    const messageBuffer = Buffer.from(message, "utf-8");
    console.log("Message to send:", message);

    const customCharacteristic = characteristics.find(
      (char) => char.uuid === CharacteristicUUID
    );

    if (!customCharacteristic) {
      console.log("Custom characteristic not found");
      return res
        .status(404)
        .json({ error: "Custom characteristic not found." });
    }

    console.log("Writing to characteristic:", customCharacteristic.uuid);
    customCharacteristic.write(messageBuffer, false, (error) => {
      if (error) {
        console.error("Write error:", error);
        return res
          .status(500)
          .json({ error: "Error writing to characteristic." });
      }

      console.log("Message written successfully to characteristic");
      res.json({ message: "Message sent successfully." });
    });
  } else {
    console.log("No device connected");
    res.status(400).json({ error: "No device connected." });
  }
});

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
  console.log(`Server is running on http://${results["Wi-Fi"]}:${port}`);
});

process.on("SIGINT", () => {
  noble.stopScanning();
  process.exit();
});
