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
    <View className="flex-row items-center bg-card p-4 rounded-xl border border-border">
      <Flame size={28} color="#F59E0B" />
      <View className="ml-3">
        <Text className="text-lg font-semibold text-foreground">
          {currentStreak} day{currentStreak !== 1 ? 's' : ''}
        </Text>
        <Text className="text-sm text-muted-foreground">
          Best: {longestStreak} day{longestStreak !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );
}
