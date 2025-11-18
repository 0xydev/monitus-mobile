import { View, Text, Alert, ScrollView, TextInput, Pressable } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import { TimerSlider } from '@/components/timer/TimerSlider';
import { TimerControls } from '@/components/timer/TimerControls';
import { SessionTypeToggle } from '@/components/timer/SessionTypeToggle';
import { TagSelector } from '@/components/timer/TagSelector';
import { StreakIndicator } from '@/components/gamification/StreakIndicator';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import { useTimerStore } from '@/stores/timerStore';
import { useTagStore } from '@/stores/tagStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAppState } from '@/hooks/useAppState';
import { useHaptics } from '@/hooks/useHaptics';

export default function TimerScreen() {
  const {
    isRunning,
    isPaused,
    sessionType,
    stats,
    selectedTagId,
    startTimer,
    pauseTimer,
    resumeTimer,
    tick,
    fetchStats,
    setTagId,
  } = useTimerStore();

  const { createTag } = useTagStore();
  const { defaultFocusDuration, defaultBreakDuration, keepScreenAwake } =
    useSettingsStore();
  const haptics = useHaptics();

  // Keep screen awake when timer is running (if enabled in settings)
  useKeepAwake(isRunning && keepScreenAwake ? 'timer-active' : undefined);

  // Handle app going to background - pause timer
  const handleBackground = useCallback(() => {
    if (isRunning && !isPaused) {
      pauseTimer();
    }
  }, [isRunning, isPaused, pauseTimer]);

  useAppState(undefined, handleBackground);

  const [selectedDuration, setSelectedDuration] = useState(25);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366F1');

  const TAG_COLORS = [
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#6B7280', // Gray
  ];

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Update duration when session type changes (use settings defaults)
  useEffect(() => {
    setSelectedDuration(
      sessionType === 'focus' ? defaultFocusDuration : defaultBreakDuration
    );
  }, [sessionType, defaultFocusDuration, defaultBreakDuration]);

  const handleStart = async () => {
    try {
      haptics.medium();
      await startTimer(selectedDuration, selectedTagId || undefined);
      haptics.success();
    } catch (error) {
      haptics.error();
      const message =
        error instanceof Error ? error.message : 'Failed to start session';
      Alert.alert('Error', message);
    }
  };

  const handleDurationChange = (minutes: number) => {
    setSelectedDuration(minutes);
    // Update the timer store duration if not running
    if (!isRunning) {
      useTimerStore.setState({
        timeRemaining: minutes * 60,
        totalDuration: minutes * 60,
      });
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }

    try {
      const tag = await createTag(newTagName.trim(), newTagColor);
      setTagId(tag.id);
      setShowCreateTag(false);
      setNewTagName('');
      setNewTagColor('#6366F1');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create tag';
      Alert.alert('Error', message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6 mt-4">
            <StreakIndicator
              currentStreak={stats.current_streak}
              longestStreak={stats.longest_streak}
            />
            <LevelBadge level={stats.level} />
          </View>

          {/* XP Progress */}
          <XPProgressBar currentXP={stats.xp} level={stats.level} />

          {/* Session Type Toggle */}
          <View className="mb-4">
            <SessionTypeToggle />
          </View>

          {/* Tag Selector */}
          <View className="mb-4">
            <TagSelector
              selectedTagId={selectedTagId}
              onSelect={setTagId}
              disabled={isRunning}
              onCreateTag={() => setShowCreateTag(true)}
            />
          </View>

          {/* Timer Slider */}
          <View className="mb-6">
            <TimerSlider
              value={selectedDuration}
              onChange={handleDurationChange}
              disabled={isRunning}
              min={sessionType === 'break' ? 5 : 15}
              max={sessionType === 'break' ? 30 : 120}
              step={5}
              isBreakTime={sessionType === 'break'}
            />
          </View>

          {/* Controls */}
          <TimerControls onStart={handleStart} />

          {/* Stats Summary */}
          <View className="mt-6 bg-card p-4 rounded-xl border border-border mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Your Stats
            </Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-2xl font-bold text-foreground">
                  {Math.round(stats.total_focus_hours)}h
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Total Focus
                </Text>
              </View>
              <View>
                <Text className="text-2xl font-bold text-foreground">
                  {stats.weekly_sessions}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  This Week
                </Text>
              </View>
              <View>
                <Text className="text-2xl font-bold text-foreground">
                  {stats.xp}
                </Text>
                <Text className="text-sm text-muted-foreground">Total XP</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Create Tag Modal */}
      {showCreateTag && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center px-6">
          <View className="bg-card w-full p-6 rounded-xl border border-border">
            <Text className="text-xl font-semibold text-foreground mb-4">
              Create Tag
            </Text>

            <Text className="text-sm text-muted-foreground mb-2">
              Tag Name
            </Text>
            <TextInput
              value={newTagName}
              onChangeText={setNewTagName}
              placeholder="e.g., Work, Study, Exercise"
              className="bg-background border border-border rounded-lg px-4 py-3 text-foreground mb-4"
              placeholderTextColor="#9CA3AF"
            />

            <Text className="text-sm text-muted-foreground mb-2">Color</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {TAG_COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setNewTagColor(color)}
                  className={`w-10 h-10 rounded-full ${
                    newTagColor === color ? 'border-4 border-foreground' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setShowCreateTag(false);
                  setNewTagName('');
                }}
                className="flex-1 bg-muted py-3 rounded-lg active:opacity-80"
              >
                <Text className="text-center font-medium text-foreground">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCreateTag}
                className="flex-1 bg-primary py-3 rounded-lg active:opacity-80"
              >
                <Text className="text-center font-medium text-primary-foreground">
                  Create
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
