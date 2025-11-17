import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';

export function useHaptics() {
  const { vibrationEnabled } = useSettingsStore();

  const impact = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    if (!vibrationEnabled || Platform.OS === 'web') return;
    Haptics.impactAsync(style);
  };

  const notification = (type: Haptics.NotificationFeedbackType) => {
    if (!vibrationEnabled || Platform.OS === 'web') return;
    Haptics.notificationAsync(type);
  };

  const selection = () => {
    if (!vibrationEnabled || Platform.OS === 'web') return;
    Haptics.selectionAsync();
  };

  // Convenience methods
  const light = () => impact(Haptics.ImpactFeedbackStyle.Light);
  const medium = () => impact(Haptics.ImpactFeedbackStyle.Medium);
  const heavy = () => impact(Haptics.ImpactFeedbackStyle.Heavy);

  const success = () => notification(Haptics.NotificationFeedbackType.Success);
  const warning = () => notification(Haptics.NotificationFeedbackType.Warning);
  const error = () => notification(Haptics.NotificationFeedbackType.Error);

  return {
    impact,
    notification,
    selection,
    light,
    medium,
    heavy,
    success,
    warning,
    error,
  };
}
