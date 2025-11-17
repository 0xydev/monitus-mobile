import { View, Text } from 'react-native';

interface XPProgressBarProps {
  currentXP: number;
  level: number;
}

export function XPProgressBar({ currentXP, level }: XPProgressBarProps) {
  // XP needed for next level = level * 1000
  const xpForCurrentLevel = (level - 1) * 1000;
  const xpForNextLevel = level * 1000;
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progress = Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);

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
