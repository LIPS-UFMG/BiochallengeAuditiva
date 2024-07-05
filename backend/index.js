import express from "express";
import multer from "multer";
import * as fs from "fs";
import { unlinkSync } from "fs";
import ffprobe from "ffprobe";
import ffprobeStatic from "ffprobe-static";
import { SpeechClient } from "@google-cloud/speech";
import { networkInterfaces } from "os";
import noble from "noble-winrt"; // Biblioteca BLE

const app = express();
const port = 3000;

let caracteristics;
let connectedDevice = null;

const DeviceUUID = "30aea40696aa"; // UUID do dispositivo ESP32 BLE (substituto do endereço MAC)
const ServiceUUID = "1111ffe1-0000-1000-8000-00805f9b34fa"; // UUID do serviço
const CharacteristicUUID = "0000ffe1-0000-1000-8000-00805f9b34fb"; // UUID da característica

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
    noble.startScanning([ServiceUUID], false);
  } else {
    noble.stopScanning();
  }
});

noble.on("discover", (peripheral) => {
  if (peripheral.uuid === DeviceUUID) {
    noble.stopScanning();
    peripheral.connect((error) => {
      if (error) {
        console.error("Connection error:", error);
        return;
      }
      console.log(`Connected to device: ${peripheral.uuid}`);
      connectedDevice = peripheral;

      peripheral.discoverSomeServicesAndCharacteristics(
        [ServiceUUID],
        [CharacteristicUUID],
        (err, services, characteristics) => {
          if (err) {
            console.error("Service discovery error:", err);
            return;
          }
          caracteristics = characteristics;
        }
      );
    });
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
    noble.startScanning([ServiceUUID], false);
    res.json({ message: "Scanning for device..." });
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

    const customCharacteristic = caracteristics.find(
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

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const audioInfo = await ffprobe(filePath, { path: ffprobeStatic.path });
    const sampleRate = parseInt(audioInfo.streams[0].sample_rate, 10);
    const codec = audioInfo.streams[0].codec_name;
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

    const [response] = await speechClient.recognize(request);

    console.log("Response received:", response.results);

    if (response.results && response.results.length > 0) {
      const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");

      res.json({ transcription: transcription });
    } else {
      res.json({ transcription: null });
    }
  } catch (error) {
    console.error("Error during transcription:", error);
    res.status(500).send("Error during transcription");
  } finally {
    if (req.file && req.file.path) {
      unlinkSync(req.file.path);
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://${results["Wi-Fi"]}:${port}`);
});

process.on("SIGINT", () => {
  noble.stopScanning();
  process.exit();
});
