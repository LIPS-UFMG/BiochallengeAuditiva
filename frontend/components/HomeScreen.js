import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import axios from "axios";

const BACKEND_URL = "exp://192.168.0.128:8081"; // Substitua pelo endereço IP do seu backend

const HomeScreen = () => {
  const [recording, setRecording] = React.useState(null);
  const [recordings, setRecordings] = React.useState([]);
  const [transcriptions, setTranscriptions] = React.useState([]);

  async function startRecording() {
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
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          },
          ios: {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          },
        });
        setRecording(recording);
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    try {
      if (!recording) {
        console.warn("Recording is undefined. Skipping stopRecording.");
        return;
      }

      await recording.stopAndUnloadAsync();

      const { sound, status } = await recording.createNewLoadedSoundAsync();
      const fileUri = recording.getURI();

      const allRecordings = [
        ...recordings,
        {
          sound: sound,
          duration: getDurationFormatted(status.durationMillis),
          file: fileUri,
        },
      ];

      setRecordings(allRecordings);
      transcribeAudio(fileUri);
      setRecording(undefined);
    } catch (error) {
      console.error("Error stopping recording or sending audio:", error);
    }
  }

  async function transcribeAudio(uri) {
    try {
      const formData = new FormData();
      formData.append("audio", {
        uri: uri,
        type: "audio/wav",
        name: "audio.wav",
      });

      const response = await axios.post(`${BACKEND_URL}/transcribe`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const transcription = response.data.transcription;
      setTranscriptions([...transcriptions, transcription]);
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }
  }

  function getDurationFormatted(milliseconds) {
    const minutes = Math.floor(milliseconds / 1000 / 60);
    const seconds = Math.round((milliseconds / 1000) % 60);
    return seconds < 10 ? `${minutes}:0${seconds}` : `${minutes}:${seconds}`;
  }

  function getRecordingLines() {
    return recordings.map((recordingLine, index) => {
      return (
        <View key={index} style={styles.row}>
          <Text style={styles.fill}>
            Recording #{index + 1} | {recordingLine.duration}
          </Text>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => recordingLine.sound.replayAsync()}
          >
            <Text style={styles.buttonText}>Play</Text>
          </TouchableOpacity>
          <Text style={styles.transcription}>{transcriptions[index]}</Text>
        </View>
      );
    });
  }

  function clearRecordings() {
    setRecordings([]);
    setTranscriptions([]);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          recording ? styles.stopButton : styles.startButton,
        ]}
        onPress={recording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>
          {recording ? "Stop Recording" : "Start Recording"}
        </Text>
      </TouchableOpacity>

      {getRecordingLines()}

      {recordings.length > 0 && (
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearRecordings}
        >
          <Text style={styles.buttonText}>Clear Recordings</Text>
        </TouchableOpacity>
      )}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  fill: {
    top: 130,
    position: "relative",
    flex: 1,
    marginHorizontal: 50,
  },
  transcription: {
    flex: 1,
    marginLeft: 15,
    color: "blue",
  },
  button: {
    top: 150,
    position: "absolute",
    padding: 15,
    borderRadius: 80,
    alignItems: "center",
    marginVertical: 0,
    width: 221,
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#F44336",
  },
  clearButton: {
    top: 100,
    position: "absolute",
    backgroundColor: "#FF9800",
  },
  playButton: {
    top: 130,
    position: "relative",
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 30,
    marginLeft: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;
