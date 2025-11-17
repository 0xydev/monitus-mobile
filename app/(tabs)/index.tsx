import { View, Text, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TimerCircle } from '@/components/timer/TimerCircle';
import { TimerControls } from '@/components/timer/TimerControls';
import { SessionTypeToggle } from '@/components/timer/SessionTypeToggle';
import { DurationPicker } from '@/components/timer/DurationPicker';
import { StreakIndicator } from '@/components/gamification/StreakIndicator';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import { useTimerStore } from '@/stores/timerStore';

export default function TimerScreen() {
  const {
    isRunning,
    sessionType,
    stats,
    startTimer,
    tick,
    fetchStats,
  } = useTimerStore();

  const [selectedDuration, setSelectedDuration] = useState(25);

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

  // Update duration when session type changes
  useEffect(() => {
    setSelectedDuration(sessionType === 'focus' ? 25 : 5);
  }, [sessionType]);

  const handleStart = async () => {
    try {
      await startTimer(selectedDuration);
    } catch (error) {
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

  return (
    <SafeAreaView className="flex-1 bg-background">
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
        <View className="mb-6">
          <SessionTypeToggle />
        </View>

        {/* Duration Picker */}
        <View className="mb-8">
          <DurationPicker
            value={selectedDuration}
            onChange={handleDurationChange}
            disabled={isRunning}
          />
        </View>

        {/* Timer */}
        <View className="items-center mb-8">
          <TimerCircle />
        </View>

        {/* Controls */}
        <TimerControls onStart={handleStart} />

        {/* Stats Summary */}
        <View className="mt-8 bg-card p-4 rounded-xl border border-border">
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
    </SafeAreaView>
  );
}
