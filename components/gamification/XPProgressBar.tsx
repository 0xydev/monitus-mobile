import { View, Text } from 'react-native';

interface XPProgressBarProps {
  currentXP: number;
  level: number;
  compact?: boolean;
}

export function XPProgressBar({ currentXP, level, compact = false }: XPProgressBarProps) {
  // XP needed for next level = level * 1000
  const xpForCurrentLevel = (level - 1) * 1000;
  const xpForNextLevel = level * 1000;
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progress = Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);

  if (compact) {
    return (
      <View>
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-xs font-medium text-foreground">Level {level}</Text>
          <Text className="text-[10px] text-muted-foreground">
            {xpInCurrentLevel}/{xpNeededForLevel} XP
          </Text>
        </View>
        <View className="h-1.5 bg-muted rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm text-muted-foreground">Level {level}</Text>
        <Text className="text-sm text-muted-foreground">
          {xpInCurrentLevel} / {xpNeededForLevel} XP
        </Text>
      </View>
      <View className="h-2 bg-muted rounded-full overflow-hidden">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  );
}
