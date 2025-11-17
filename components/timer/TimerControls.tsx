import { View, Pressable, ActivityIndicator } from 'react-native';
import { Play, Pause, Square, RotateCcw } from 'lucide-react-native';
import { useTimerStore } from '@/stores/timerStore';

interface TimerControlsProps {
  onStart?: () => void;
}

export function TimerControls({ onStart }: TimerControlsProps) {
  const {
    isRunning,
    isPaused,
    isStartingSession,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
  } = useTimerStore();

  if (isStartingSession) {
    return (
      <View className="flex-row justify-center items-center gap-4">
        <View className="bg-primary w-16 h-16 rounded-full items-center justify-center">
          <ActivityIndicator color="white" />
        </View>
      </View>
    );
  }

  if (!isRunning) {
    return (
      <View className="flex-row justify-center items-center gap-4">
        <Pressable
          onPress={onStart}
          className="bg-primary w-16 h-16 rounded-full items-center justify-center active:opacity-80"
        >
          <Play size={32} color="white" fill="white" />
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-row justify-center items-center gap-4">
      <Pressable
        onPress={isPaused ? resumeTimer : pauseTimer}
        className="bg-yellow-500 w-16 h-16 rounded-full items-center justify-center active:opacity-80"
      >
        {isPaused ? (
          <Play size={32} color="white" fill="white" />
        ) : (
          <Pause size={32} color="white" />
        )}
      </Pressable>
      <Pressable
        onPress={stopTimer}
        className="bg-destructive w-16 h-16 rounded-full items-center justify-center active:opacity-80"
      >
        <Square size={32} color="white" fill="white" />
      </Pressable>
      {isPaused && (
        <Pressable
          onPress={resetTimer}
          className="bg-muted w-16 h-16 rounded-full items-center justify-center active:opacity-80"
        >
          <RotateCcw size={32} className="text-muted-foreground" />
        </Pressable>
      )}
    </View>
  );
}
