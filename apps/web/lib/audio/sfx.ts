import { useSettingsStore } from "@/lib/stores/settingsStore";

export type SoundName = "place" | "erase" | "note" | "mistake" | "solve" | "gameOver";

interface Note {
  frequency: number;
  start: number;
  duration: number;
  wave: OscillatorType;
  level: number;
}

const note = (frequency: number, start: number, duration: number, wave: OscillatorType = "triangle", level = 0.5): Note => ({
  frequency,
  start,
  duration,
  wave,
  level,
});

const SOUNDS: Record<SoundName, Note[]> = {
  place: [note(660, 0, 0.08), note(990, 0.02, 0.06, "sine", 0.25)],
  erase: [note(392, 0, 0.07, "sine", 0.4)],
  note: [note(1175, 0, 0.04, "sine", 0.25)],
  mistake: [note(196, 0, 0.16, "sawtooth", 0.35), note(147, 0.09, 0.2, "sawtooth", 0.35)],
  solve: [note(523, 0, 0.12), note(659, 0.1, 0.12), note(784, 0.2, 0.14), note(1047, 0.32, 0.28)],
  gameOver: [note(392, 0, 0.22), note(330, 0.2, 0.22), note(262, 0.4, 0.45)],
};

const MASTER_LEVEL = 0.35;
const VIBRATION_MS: Partial<Record<SoundName, number | number[]>> = { mistake: 90, gameOver: [80, 60, 160] };

let context: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  return context;
}

export function playSfx(name: SoundName) {
  const { sfxVolume, vibration } = useSettingsStore.getState();
  const pattern = VIBRATION_MS[name];
  if (vibration && pattern !== undefined && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  if (sfxVolume <= 0) return;
  const ctx = audioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  for (const { frequency, start, duration, wave, level } of SOUNDS[name]) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = wave;
    oscillator.frequency.value = frequency;
    const peak = level * sfxVolume * MASTER_LEVEL;
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(peak, now + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(now + start);
    oscillator.stop(now + start + duration + 0.02);
  }
}
