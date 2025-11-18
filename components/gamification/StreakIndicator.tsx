import { View, Text } from 'react-native';
import { Flame } from 'lucide-react-native';

interface StreakIndicatorProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakIndicator({
  currentStreak,
  longestStreak,
}: StreakIndicatorProps) {
  return (
    <View className="flex-row items-center bg-card px-3 py-2 rounded-lg border border-border">
      <Flame size={18} color="#F59E0B" />
      <View className="ml-2">
        <Text className="text-sm font-semibold text-foreground">
          {currentStreak} day{currentStreak !== 1 ? 's' : ''}
        </Text>
        <Text className="text-[10px] text-muted-foreground leading-tight">
          Best: {longestStreak}
        </Text>
      </View>
    </View>
  );
}
