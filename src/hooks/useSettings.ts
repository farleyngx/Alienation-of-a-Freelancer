import { useState, useEffect } from 'react';

const SETTINGS_KEY = 'alienation_settings';

export interface GameSettings {
  soundEnabled: boolean;
  bgmEnabled: boolean;
  soundVolume: number; // 0.0 - 1.0
  bgmVolume: number; // 0.0 - 1.0
  typingSpeed: number; // in ms per character (lower is faster)
}

const defaultSettings: GameSettings = {
  soundEnabled: true,
  bgmEnabled: true,
  soundVolume: 0.5,
  bgmVolume: 0.5,
  typingSpeed: 20,
};

export function useSettings() {
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<GameSettings>) => setSettings(s => ({ ...s, ...newSettings }));

  const toggleSound = () => updateSettings({ soundEnabled: !settings.soundEnabled });
  const toggleBgm = () => updateSettings({ bgmEnabled: !settings.bgmEnabled });
  const setSoundVolume = (vol: number) => updateSettings({ soundVolume: vol });
  const setBgmVolume = (vol: number) => updateSettings({ bgmVolume: vol });
  const setTypingSpeed = (speed: number) => updateSettings({ typingSpeed: speed });

  return { settings, updateSettings, toggleSound, toggleBgm, setSoundVolume, setBgmVolume, setTypingSpeed };
}
