from pydub import AudioSegment
from scipy.fftpack import fft
from scipy.io import wavfile
import numpy as np
import os

# Função para converter mp3 para wav
def mp3_to_wav(mp3_path, wav_path):
    audio = AudioSegment.from_mp3(mp3_path)
    audio.export(wav_path, format="wav")

# Função para analisar a frequência do áudio
def analyze_frequency(wav_path):
    sample_rate, data = wavfile.read(wav_path)
    if len(data.shape) == 2:  # Se áudio estéreo, pegar apenas um canal
        data = data[:, 0]

    # Executar FFT
    N = len(data)
    T = 1.0 / sample_rate
    yf = fft(data)
    xf = np.fft.fftfreq(N, T)[:N//2]

    # Encontrar a frequência dominante
    idx = np.argmax(2.0/N * np.abs(yf[:N//2]))
    freq = xf[idx]

    return freq

def recognize_sound(wav_path):
    freq = analyze_frequency(wav_path)

    if 650 <= freq < 850:
        return "Sirene de Ambulância"
    elif 850 <= freq < 1100:
        return "Alarme de Incêndio"
    elif 1100 <= freq or 200 <= freq < 650:
        return "Choro de Bebê"
    else:
        return "Outro som"

if __name__ == "__main__":
    uploaded_files = [f for f in os.listdir('.') if os.path.isfile(f) and f.endswith('.wav')]

    for file in uploaded_files:
        sound_type = recognize_sound(file)
        print(f"O áudio {file} é: {sound_type}")
