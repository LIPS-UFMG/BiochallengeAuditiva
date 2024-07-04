import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from "react-native";
import { Audio } from "expo-av";
import axios from "axios";
import "regenerator-runtime/runtime";

const BACKEND_URL = 'http://192.168.0.84:3000'; // Substitua pelo seu IP local

const HomeScreen = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [analysis, setAnalysis] = useState("");

  useEffect(() => {
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
      if (perm.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync({
          isMeteringEnabled: true,
          android: {
            extension: '.3gp',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_AMR_WB,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_WB,
            sampleRate: 16000,
          },
          ios: {
            extension: '.caf',
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
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        await recording.createNewLoadedSoundAsync();
        const fileUri = recording.getURI();
        transcribeAudio(fileUri);
        analyzeAudio(fileUri);
        setRecording(null);
      }
    } catch (error) {
      console.error('Error stopping recording or sending audio:', error);
    }
  }

  async function transcribeAudio(uri) {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: uri,
        type: 'audio/3gpp',
        name: 'audio.3gp',
      });

      const response = await axios.post(`${BACKEND_URL}/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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
      console.error('Error transcribing audio:', error);
    }
  }

  async function analyzeAudio(uri) {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: uri,
        type: 'audio/3gpp',
        name: 'audio.3gp',
      });

      const response = await axios.post(`${BACKEND_URL}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const analysisResult = response.data.analysis;
      if (analysisResult) {
        setAnalysis(analysisResult);
        console.log('Análise de frequência:', analysisResult); // Printar a frequência no console
      }
    } catch (error) {
      console.error('Error analyzing audio:', error);
    }
  }

  function clearRecordings() {
    setTranscriptions([]);
    setAnalysis("");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.analysisText}>{analysis}</Text>
      <View style={styles.textContainer}>
        <FlatList
          data={transcriptions}
          renderItem={({ item }) => (
            <View style={styles.transcriptionBox}>
              <Text style={styles.transcriptionText}>{item}</Text>
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
          }>
          <Text style={styles.buttonText}>
            {isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearRecordings}>
          <Text style={styles.buttonText}>Limpar Transcrições</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  textContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#AAAAAA',
    padding: '5%',
  },
  transcriptionsList: {},
  transcriptionBox: {
    backgroundColor: 'transparent',
    borderColor: 'blue',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  transcriptionText: {
    color: 'black',
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 22,
  },
  noTranscriptionText: {
    color: 'gray',
    fontStyle: 'italic',
    fontSize: 16,
  },
  analysisText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '30%',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  clearButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
