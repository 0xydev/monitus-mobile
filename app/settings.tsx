import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  ArrowLeft,
  Timer,
  Bell,
  Volume2,
  Vibrate,
  Trophy,
  Users,
  Eye,
  RotateCcw,
  ChevronRight,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const settings = useSettingsStore();

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            settings.resetToDefaults();
            Alert.alert('Success', 'Settings reset to defaults');
          },
        },
      ]
    );
  };

  const SettingRow = ({
    icon,
    label,
    value,
    onValueChange,
    description,
  }: {
    icon: React.ReactNode;
    label: string;
    value: boolean;
    onValueChange: (val: boolean) => void;
    description?: string;
  }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-border">
      <View className="flex-row items-center flex-1 mr-4">
        {icon}
        <View className="ml-3 flex-1">
          <Text className="text-foreground font-medium">{label}</Text>
          {description && (
            <Text className="text-xs text-muted-foreground mt-1">
              {description}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#9CA3AF', true: '#6366F1' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const DurationSetting = ({
    label,
    value,
    onIncrease,
    onDecrease,
    min,
    max,
  }: {
    label: string;
    value: number;
    onIncrease: () => void;
    onDecrease: () => void;
    min: number;
    max: number;
  }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-border">
      <Text className="text-foreground font-medium">{label}</Text>
      <View className="flex-row items-center">
        <Pressable
          onPress={onDecrease}
          disabled={value <= min}
          className="bg-muted w-8 h-8 rounded-lg items-center justify-center active:opacity-80"
        >
          <Text className="text-foreground text-lg font-bold">-</Text>
        </Pressable>
        <Text className="text-foreground font-mono text-lg mx-4 min-w-[60px] text-center">
          {value} min
        </Text>
        <Pressable
          onPress={onIncrease}
          disabled={value >= max}
          className="bg-muted w-8 h-8 rounded-lg items-center justify-center active:opacity-80"
        >
          <Text className="text-foreground text-lg font-bold">+</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-4 pb-2 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} className="text-foreground" />
        </Pressable>
        <Text className="text-2xl font-bold text-foreground">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Timer Settings */}
        <Text className="text-lg font-semibold text-foreground mt-4 mb-3">
          Timer Defaults
        </Text>
        <View className="bg-card rounded-xl border border-border mb-6">
          <DurationSetting
            label="Focus Duration"
            value={settings.defaultFocusDuration}
            min={1}
            max={180}
            onIncrease={() =>
              settings.updateSettings({
                defaultFocusDuration: Math.min(
                  settings.defaultFocusDuration + 5,
                  180
                ),
              })
            }
            onDecrease={() =>
              settings.updateSettings({
                defaultFocusDuration: Math.max(
                  settings.defaultFocusDuration - 5,
                  1
                ),
              })
            }
          />
          <DurationSetting
            label="Break Duration"
            value={settings.defaultBreakDuration}
            min={1}
            max={60}
            onIncrease={() =>
              settings.updateSettings({
                defaultBreakDuration: Math.min(
                  settings.defaultBreakDuration + 5,
                  60
                ),
              })
            }
            onDecrease={() =>
              settings.updateSettings({
                defaultBreakDuration: Math.max(
                  settings.defaultBreakDuration - 5,
                  1
                ),
              })
            }
          />
          <SettingRow
            icon={<Timer size={20} className="text-primary" />}
            label="Auto-start Breaks"
            description="Automatically start break timer after focus session"
            value={settings.autoStartBreaks}
            onValueChange={(val) =>
              settings.updateSettings({ autoStartBreaks: val })
            }
          />
          <SettingRow
            icon={<RotateCcw size={20} className="text-primary" />}
            label="Auto-start Next Session"
            description="Automatically start next focus session after break"
            value={settings.autoStartNextSession}
            onValueChange={(val) =>
              settings.updateSettings({ autoStartNextSession: val })
            }
          />
        </View>

        {/* Notification Settings */}
        <Text className="text-lg font-semibold text-foreground mb-3">
          Notifications
        </Text>
        <View className="bg-card rounded-xl border border-border mb-6">
          <SettingRow
            icon={<Volume2 size={20} className="text-primary" />}
            label="Sound"
            description="Play sound when timer completes"
            value={settings.soundEnabled}
            onValueChange={(val) =>
              settings.updateSettings({ soundEnabled: val })
            }
          />
          <SettingRow
            icon={<Vibrate size={20} className="text-primary" />}
            label="Vibration"
            description="Vibrate when timer completes"
            value={settings.vibrationEnabled}
            onValueChange={(val) =>
              settings.updateSettings({ vibrationEnabled: val })
            }
          />
          <SettingRow
            icon={<Bell size={20} className="text-primary" />}
            label="Timer Notifications"
            description="Show notification when timer ends"
            value={settings.showTimerNotifications}
            onValueChange={(val) =>
              settings.updateSettings({ showTimerNotifications: val })
            }
          />
          <SettingRow
            icon={<Trophy size={20} className="text-yellow-500" />}
            label="Achievement Notifications"
            description="Notify when you unlock achievements"
            value={settings.showAchievementNotifications}
            onValueChange={(val) =>
              settings.updateSettings({ showAchievementNotifications: val })
            }
          />
          <SettingRow
            icon={<Users size={20} className="text-cyan-500" />}
            label="Friend Notifications"
            description="Notify on friend requests and activity"
            value={settings.showFriendNotifications}
            onValueChange={(val) =>
              settings.updateSettings({ showFriendNotifications: val })
            }
          />
        </View>

        {/* Display Settings */}
        <Text className="text-lg font-semibold text-foreground mb-3">
          Display
        </Text>
        <View className="bg-card rounded-xl border border-border mb-6">
          <SettingRow
            icon={<Eye size={20} className="text-primary" />}
            label="Show Seconds"
            description="Display seconds in timer countdown"
            value={settings.showSecondsInTimer}
            onValueChange={(val) =>
              settings.updateSettings({ showSecondsInTimer: val })
            }
          />
          <SettingRow
            icon={<Eye size={20} className="text-primary" />}
            label="Keep Screen Awake"
            description="Prevent screen from sleeping during timer"
            value={settings.keepScreenAwake}
            onValueChange={(val) =>
              settings.updateSettings({ keepScreenAwake: val })
            }
          />
        </View>

        {/* Reset */}
        <Pressable
          onPress={handleReset}
          className="bg-destructive/10 p-4 rounded-xl mb-6 items-center"
        >
          <Text className="text-destructive font-medium">
            Reset to Defaults
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
