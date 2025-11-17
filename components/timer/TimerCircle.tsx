import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTimerStore } from '@/stores/timerStore';

interface TimerCircleProps {
  size?: number;
}

export function TimerCircle({ size = 280 }: TimerCircleProps) {
  const { timeRemaining, totalDuration, sessionType } = useTimerStore();

  const progress = totalDuration > 0 ? (totalDuration - timeRemaining) / totalDuration : 0;
  const radius = (size - 32) / 2; // Account for stroke width
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const strokeColor = sessionType === 'focus' ? '#EF4444' : '#06B6D4';
  const bgStrokeColor = '#E5E7EB';

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgStrokeColor}
          strokeWidth={16}
          fill="transparent"
          opacity={0.3}
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={16}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View className="absolute items-center">
        <Text className="text-6xl font-bold text-foreground font-mono">
          {timeString}
        </Text>
        <Text className="text-muted-foreground mt-2">
          {sessionType === 'focus' ? 'Focus Time' : 'Break Time'}
        </Text>
      </View>
    </View>
  );
}
