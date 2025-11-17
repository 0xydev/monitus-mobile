import { View, Pressable, Text } from 'react-native';
import { useTimerStore } from '@/stores/timerStore';

export function SessionTypeToggle() {
  const { sessionType, setSessionType, isRunning } = useTimerStore();

  return (
    <View className="flex-row bg-muted rounded-lg p-1">
      <Pressable
        onPress={() => setSessionType('focus')}
        disabled={isRunning}
        className={`flex-1 py-2 rounded-md ${
          sessionType === 'focus' ? 'bg-background' : ''
        } ${isRunning ? 'opacity-50' : ''}`}
      >
        <Text
          className={`text-center font-medium ${
            sessionType === 'focus' ? 'text-red-500' : 'text-muted-foreground'
          }`}
        >
          Focus
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setSessionType('break')}
        disabled={isRunning}
        className={`flex-1 py-2 rounded-md ${
          sessionType === 'break' ? 'bg-background' : ''
        } ${isRunning ? 'opacity-50' : ''}`}
      >
        <Text
          className={`text-center font-medium ${
            sessionType === 'break' ? 'text-cyan-500' : 'text-muted-foreground'
          }`}
        >
          Break
        </Text>
      </Pressable>
    </View>
  );
}
