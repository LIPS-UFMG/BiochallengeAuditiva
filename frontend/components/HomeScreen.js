import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Audio } from "expo-av";
import axios from "axios";
import 'regenerator-runtime/runtime'

const BACKEND_URL = "http://192.168.0.200:3000";

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
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        await recording.createNewLoadedSoundAsync();
        const fileUri = recording.getURI();
        transcribeAudio(fileUri);
        setRecording(null);
      }
    } catch (error) {
      console.error("Error stopping recording or sending audio:", error);
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

      const transcription = response.data.transcription;
      if (transcription) {
        setTranscriptions((prevTranscriptions) => [
          ...prevTranscriptions,
          transcription,
        ]);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
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
              <Text style={styles.transcriptionText}>{item}</Text>
            </View>
          )}
          keyExtractor={(index) => index.toString()}
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
