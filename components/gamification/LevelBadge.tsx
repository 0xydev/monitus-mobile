import { View, Text } from 'react-native';

interface LevelBadgeProps {
  level: number;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <View className="bg-primary/10 px-3 py-1 rounded-full">
      <Text className="text-primary font-semibold">Level {level}</Text>
    </View>
  );
}
