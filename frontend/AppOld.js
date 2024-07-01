import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Audio } from 'expo-av';
import axios from 'axios';

// Substitua pelo endereço IP e porta do seu backend
const BACKEND_URL = 'http://192.168.0.37:3000'; // Exemplo de endereço IP local

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  const [recording, setRecording] = React.useState(null);
  const [recordings, setRecordings] = React.useState([]);
  const [transcriptions, setTranscriptions] = React.useState([]);

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        });
        const { recording } = await Audio.Recording.createAsync({
          isMeteringEnabled: true,
          android: {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
            extension: '.wav',
          },
          ios: {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
            extension: '.wav',
          },
        });
        setRecording(recording);
      }

    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    try {
      if (!recording) {
        console.warn('Recording is undefined. Skipping stopRecording.');
        return;
      }

      await recording.stopAndUnloadAsync();

      const { sound, status } = await recording.createNewLoadedSoundAsync();
      const fileUri = recording.getURI();

      const allRecordings = [...recordings, {
        sound: sound,
        duration: getDurationFormatted(status.durationMillis),
        file: fileUri
      }];

      setRecordings(allRecordings);
      transcribeAudio(fileUri);
      setRecording(undefined);
    } catch (error) {
      console.error('Error stopping recording or sending audio:', error);
    }
  }

  async function transcribeAudio(uri) {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: uri,
        type: 'audio/wav',
        name: 'audio.wav'
      });

      const response = await axios.post(`${BACKEND_URL}/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const transcription = response.data.transcription;
      setTranscriptions([...transcriptions, transcription]);

    } catch (error) {
      console.error('Error transcribing audio:', error);
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
          <Button onPress={() => recordingLine.sound.replayAsync()} title="Play"></Button>
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
      <Button title={recording ? 'Stop Recording' : 'Start Recording'} onPress={recording ? stopRecording : startRecording} />
      {getRecordingLines()}
      <Button title={recordings.length > 0 ? 'Clear Recordings' : ''} onPress={clearRecordings} />
      <Button title="Go to Alerts" onPress={() => navigation.navigate('Alerts')} />
      <Button title="Go to Settings" onPress={() => navigation.navigate('Settings')} />
    </View>
  );
};

const AlertsScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={require('./path_to_your_image/5 - alertas.png')} style={styles.image} />
    </View>
  );
};

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={require('./path_to_your_image/7 - Configurações.png')} style={styles.image} />
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Alerts" component={AlertsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 40,
    marginTop: 10,
  },
  fill: {
    flex: 1,
    margin: 15,
  },
  transcription: {
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
    color: 'blue',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  }
});
