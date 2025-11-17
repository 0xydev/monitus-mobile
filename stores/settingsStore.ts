import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  // Timer settings
  defaultFocusDuration: number; // minutes
  defaultBreakDuration: number; // minutes
  autoStartBreaks: boolean;
  autoStartNextSession: boolean;

  // Notification settings
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showTimerNotifications: boolean;
  showAchievementNotifications: boolean;
  showFriendNotifications: boolean;

  // Display settings
  showSecondsInTimer: boolean;
  keepScreenAwake: boolean;

  // Actions
  updateSettings: (settings: Partial<SettingsState>) => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  defaultFocusDuration: 25,
  defaultBreakDuration: 5,
  autoStartBreaks: false,
  autoStartNextSession: false,
  soundEnabled: true,
  vibrationEnabled: true,
  showTimerNotifications: true,
  showAchievementNotifications: true,
  showFriendNotifications: true,
  showSecondsInTimer: true,
  keepScreenAwake: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSettings: (newSettings) => {
        set((state) => ({ ...state, ...newSettings }));
      },

      resetToDefaults: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'monitus-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
