import sys
from pydub import AudioSegment
from scipy.fftpack import fft
from scipy.io import wavfile
import numpy as np
import os

def analyze_audio(file_path):
    def convert_to_wav(file_path):
        audio = AudioSegment.from_file(file_path)
        wav_path = f'{os.path.splitext(file_path)[0]}.wav'
        audio.export(wav_path, format="wav")
        return wav_path

    def analyze_frequency(wav_path):
        sample_rate, data = wavfile.read(wav_path)
        if len(data.shape) == 2:
            data = data[:, 0]

        N = len(data)
        T = 1.0 / sample_rate
        yf = fft(data)
        xf = np.fft.fftfreq(N, T)[:N//2]

        idx = np.argmax(2.0/N * np.abs(yf[:N//2]))
        freq = xf[idx]

        return freq

    if not file_path.endswith('.wav'):
        wav_path = convert_to_wav(file_path)
    else:
        wav_path = file_path

    freq = analyze_frequency(wav_path)

    if 1120 <= freq < 1150:
        return (f"Sirene de incendio, {freq:.2f}Hz")
    elif 700 <= freq < 740:
        return (f"Tocou a campainha, {freq:.2f}Hz")
    elif freq <= 510:
        return (f"Conversa, {freq:.2f}Hz")
    else:
        return (f"Choro de bebe,{freq:.2f}Hz")

if __name__ == "__main__":
    file_path = sys.argv[1]
    print(analyze_audio(file_path))
