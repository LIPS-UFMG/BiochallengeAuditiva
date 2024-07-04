import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Audio } from "expo-av";
import axios from "axios";
import "regenerator-runtime/runtime";

const BACKEND_URL = "http://192.168.0.84:3000";

const HomeScreen = () => {
  const [recording, setRecording] = React.useState(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [transcriptions, setTranscriptions] = React.useState([]);

  React.useEffect(() => {
    if (isRecording) {
      const interval = setInterval(async () => {
        if (recording) {
          await stopRecording();
          await startRecording();
        }
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [isRecording, recording]);

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
        await recording.createNewLoadedSoundAsync();
        const fileUri = recording.getURI();
        console.log("Recording stopped, URI:", fileUri);
        await handleAudioProcessing(fileUri);
        setRecording(null);
      }
    } catch (error) {
      console.error("Error stopping recording or sending audio:", error);
    }
  }

  async function handleAudioProcessing(uri) {
    console.log("Starting audio processing for URI:", uri);
    try {
      const transcriptionPromise = transcribeAudio(uri);
      const analysisPromise = analyzeAudio(uri);

      const [transcription, analysisResult] = await Promise.all([
        transcriptionPromise,
        analysisPromise,
      ]);

      console.log("Audio processing completed");

      if (transcription) {
        setTranscriptions((prevTranscriptions) => [
          ...prevTranscriptions,
          { text: transcription, analysis: analysisResult },
        ]);
        console.log("Transcription:", transcription);
        console.log("Analysis result:", analysisResult);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      // Excluir o arquivo temporário após o processamento
      try {
        await FileSystem.deleteAsync(uri);
        console.log("Temporary file deleted:", uri);
      } catch (deleteError) {
        console.error("Error deleting temporary file:", deleteError);
      }
    }
  }

  async function transcribeAudio(uri) {
    console.log("Starting transcription for URI:", uri);
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

      console.log("Transcription response received");
      return response.data.transcription;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      return null;
    }
  }

  async function analyzeAudio(uri) {
    console.log("Starting analysis for URI:", uri);
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

      console.log("Analysis response received");
      return response.data.analysis;
    } catch (error) {
      console.error("Error analyzing audio:", error);
      return null;
    }
  }

  function clearRecordings() {
    setTranscriptions([]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <FlatList
          data={transcriptions}
          renderItem={({ item }) => (
            <View style={styles.transcriptionBox}>
              <Text style={styles.transcriptionText}>{item.text}</Text>
              {item.analysis && (
                <Text style={styles.analysisText}>{item.analysis}</Text>
              )}
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            <Text style={styles.noTranscriptionText}>
              Nenhuma transcrição disponível
            </Text>
          }
          contentContainerStyle={styles.transcriptionsList}
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
    backgroundColor: "#AAAAAA",
    padding: "5%",
  },
  transcriptionsList: {},
  transcriptionBox: {
    backgroundColor: "transparent",
    borderColor: "blue",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  transcriptionText: {
    color: "black",
    textAlign: "left",
    fontSize: 16,
    lineHeight: 22,
  },
  analysisText: {
    color: "black",
    textAlign: "left",
    fontSize: 14,
    marginTop: 5,
  },
  noTranscriptionText: {
    color: "gray",
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
    borderRadius: 5,
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
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;
