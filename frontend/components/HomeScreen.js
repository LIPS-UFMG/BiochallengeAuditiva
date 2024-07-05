import React, { useEffect, useState, useRef } from "react";
import * as FileSystem from "expo-file-system";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Vibration,
} from "react-native";
import { Audio } from "expo-av";
import axios from "axios";
import "regenerator-runtime";

const BACKEND_URL = "http://172.20.10.5:3000";

const HomeScreen = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [audioQueue, setAudioQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(async () => {
        if (recording) {
          await stopRecording();
          await startRecording();
        }
      }, 4000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRecording, recording]);

  useEffect(() => {
    if (audioQueue.length > 0 && !isProcessing) {
      processAudioQueue();
    }
  }, [audioQueue, isProcessing]);

  async function startRecording() {
    console.log("Starting recording...");
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync({
          isMeteringEnabled: true,
          android: {
            extension: ".3gp",
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_AMR_WB,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_WB,
            sampleRate: 16000,
          },
          ios: {
            extension: ".caf",
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        });
        setRecording(recording);
        setIsRecording(true);
        console.log("Recording started");
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording...");
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const fileUri = recording.getURI();
        console.log("Recording stopped, URI:", fileUri);
        setAudioQueue((prevQueue) => [...prevQueue, fileUri]);
        setRecording(null);
      }
    } catch (error) {
      console.error(
        "Error stopping recording or adding audio to queue:",
        error
      );
    }
  }

  async function processAudioQueue() {
    if (audioQueue.length === 0 || isProcessing) {
      return;
    }

    setIsProcessing(true);
    const [currentAudio, ...remainingQueue] = audioQueue;

    try {
      const transcriptionPromise = transcribeAudio(currentAudio);
      const analysisPromise = analyzeAudio(currentAudio);

      const [transcription, analysisResult] = await Promise.all([
        transcriptionPromise,
        analysisPromise,
      ]);

      setTranscriptions((prevTranscriptions) => [
        { text: transcription, analysis: analysisResult }, // Add new transcription at the top
        ...prevTranscriptions,
      ]);

      // Check the transcription for keywords and send the appropriate message to ESP32

      if (analysisResult.includes("campainha")) {
        Vibration.vibrate(); // Faz o dispositivo vibrar
        await sendMessageToESP32("4");
      } else if (analysisResult.includes("sirene")) {
        Vibration.vibrate(); // Faz o dispositivo vibrar
        await sendMessageToESP32("3");
      } else if (analysisResult.includes("bebe")) {
        Vibration.vibrate(); // Faz o dispositivo vibrar
        await sendMessageToESP32("2");
      }
    } catch (error) {
      console.error("Error processing audio queue:", error);
    } finally {
      try {
        await FileSystem.deleteAsync(currentAudio);
      } catch (deleteError) {
        console.error("Error deleting temporary file:", deleteError);
      }
      setAudioQueue(remainingQueue);
      setIsProcessing(false);
    }
  }

  async function sendMessageToESP32(message) {
    try {
      const response = await axios.post(`${BACKEND_URL}/send`, { message });
      console.log("Message sent successfully:", response.data);
    } catch (error) {
      console.error("Error sending message to ESP32:", error);
    }
  }

  async function transcribeAudio(uri) {
    try {
      const formData = new FormData();
      formData.append("audio", {
        uri: uri,
        type: "audio/3gpp",
        name: "audio.3gp",
      });

      const response = await axios.post(`${BACKEND_URL}/transcribe`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.transcription;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      return null;
    }
  }

  async function analyzeAudio(uri) {
    try {
      const formData = new FormData();
      formData.append("audio", {
        uri: uri,
        type: "audio/3gpp",
        name: "audio.3gp",
      });

      const response = await axios.post(`${BACKEND_URL}/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.analysis;
    } catch (error) {
      console.error("Error analyzing audio:", error);
      return null;
    }
  }

  function clearRecordings() {
    setTranscriptions([]);
  }

  function getAnalysisTextColor(analysis) {
    if (analysis.includes("bebe")) return "red";
    if (analysis.includes("incendio")) return "blue";
    if (analysis.includes("campainha")) return "orange";
    return "black";
  }

  function getBoxBackgroundColor(analysis) {
    if (analysis.includes("bebe")) return "#ffcccc"; // Light red
    if (analysis.includes("incendio")) return "#cceeff"; // Light blue
    if (analysis.includes("campainha")) return "#ffebcc"; // Light orange
    return "white";
  }

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <FlatList
          data={transcriptions}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.transcriptionBox,
                index === 0 && styles.latestTranscriptionBox,
                { backgroundColor: getBoxBackgroundColor(item.analysis) },
              ]}
            >
              <Text
                style={[
                  styles.analysisText,
                  index === 0 && styles.latestAnalysisText,
                ]}
              >
                {item.analysis || "-"}
              </Text>
              <Text
                style={[
                  styles.transcriptionText,
                  index === 0 && styles.latestTranscriptionText,
                  { color: getAnalysisTextColor(item.analysis) },
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={<Text style={styles.noTranscriptionText}>-</Text>}
          contentContainerStyle={styles.transcriptionsList}
          inverted // Invert the FlatList to show newest items at the top
        />
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            isRecording ? styles.stopButton : styles.startButton,
          ]}
          onPress={
            isRecording
              ? async () => {
                  setIsRecording(false);
                  await stopRecording();
                }
              : startRecording
          }
        >
          <Text style={styles.buttonText}>
            {isRecording ? "Parar Gravação" : "Iniciar Gravação"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearRecordings}
        >
          <Text style={styles.buttonText}>Limpar Transcrições</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  textContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#ffe1ad",
    borderColor: "#ffb22c",
    borderRadius: 30,
    borderWidth: 2,
    padding: 10,
  },
  transcriptionsList: {
    paddingBottom: 20,
  },
  transcriptionBox: {
    backgroundColor: "transparent",
    borderColor: "#ffb22c",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  latestTranscriptionBox: {
    padding: 15,
    marginVertical: 10,
  },
  transcriptionText: {
    color: "black",
    textAlign: "left",
    fontSize: 16,
    lineHeight: 22,
  },
  latestTranscriptionText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  analysisText: {
    color: "gray",
    textAlign: "left",
    fontSize: 14,
    marginBottom: 5,
  },
  latestAnalysisText: {
    fontSize: 16,
  },
  noTranscriptionText: {
    textAlign: "center",
    color: "#fcaa1b",
    fontStyle: "italic",
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    width: "40%",
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#F44336",
  },
  clearButton: {
    backgroundColor: "#FF9800",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;
