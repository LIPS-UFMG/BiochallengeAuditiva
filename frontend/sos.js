
import fft from 'fft-js';

async function analyzeAudio(fileUri) {

  // Get the audio buffer
  const status = await sound.getStatusAsync();
  const buffer = await sound.getBufferAsync();

  // Get the sample rate and audio data
  const sampleRate = status.sampleRate;
  const audioData = buffer._buffer;

  // Apply FFT to the audio data
  const phasors = fft.fft(audioData);
  const magnitudes = phasors.map(complex => Math.sqrt(complex[0]*2 + complex[1]*2));
  const frequencies = fft.util.fftFreq(phasors, sampleRate);

  // Find the dominant frequency
  const maxMagnitudeIndex = magnitudes.reduce((maxIndex, magnitude, index, arr) => magnitude > arr[maxIndex] ? index : maxIndex, 0);
  const dominantFrequency = frequencies[maxMagnitudeIndex];

  // Determine the type of audio based on the dominant frequency
  let result;
  if (650 <= dominantFrequency && dominantFrequency < 850) {
    result = "sirene de ambulância";
  } else if (850 <= dominantFrequency && dominantFrequency < 1100) {
    result = "alarme de incêndio";
  } else if (1100 <= dominantFrequency || (200 <= dominantFrequency && dominantFrequency < 650)) {
    result = "choro de bebê";
  } else {
    result = "conversa";
  }

  return result;
}
