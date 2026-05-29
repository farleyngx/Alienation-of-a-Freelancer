import fs from 'fs';
import pkg from 'wavefile';
const { WaveFile } = pkg;

function generateBlip(frequency, durationMs, volume = 0.5) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * (durationMs / 1000));
  const samples = new Float32Array(numSamples);
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Fast decay envelope for crisp click
    const envelope = Math.max(0, 1 - (i / numSamples));
    samples[i] = Math.sin(2 * Math.PI * frequency * t) * volume * envelope;
  }
  
  const int16Samples = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    int16Samples[i] = samples[i] * 32767;
  }
  
  const wav = new WaveFile();
  wav.fromScratch(1, sampleRate, '16', int16Samples);
  return wav.toBuffer();
}

function generateSilence(durationMs) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * (durationMs / 1000));
  const int16Samples = new Int16Array(numSamples);
  const wav = new WaveFile();
  wav.fromScratch(1, sampleRate, '16', int16Samples);
  return wav.toBuffer();
}

if (!fs.existsSync('public/assets/audio')) {
  fs.mkdirSync('public/assets/audio', { recursive: true });
}

fs.writeFileSync('public/assets/audio/hover.wav', generateBlip(800, 30, 0.05));
fs.writeFileSync('public/assets/audio/click.wav', generateBlip(1200, 40, 0.1));
fs.writeFileSync('public/assets/audio/type.wav', generateBlip(600, 20, 0.05));
fs.writeFileSync('public/assets/audio/bgm-normal.wav', generateSilence(1000));
fs.writeFileSync('public/assets/audio/bgm-intense.wav', generateSilence(1000));

console.log('Sounds generated successfully.');
