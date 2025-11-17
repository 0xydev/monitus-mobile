import { View, Text, Pressable } from 'react-native';
import type { AchievementDefinition } from '@/types/api';

interface AchievementCardProps {
  achievement: AchievementDefinition;
  isUnlocked: boolean;
  unlockedAt?: string;
  onPress?: () => void;
}

export function AchievementCard({
  achievement,
  isUnlocked,
  unlockedAt,
  onPress,
}: AchievementCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={`w-full p-4 rounded-xl border ${
        isUnlocked
          ? 'bg-card border-primary/30'
          : 'bg-muted/50 border-border opacity-60'
      }`}
    >
      <View className="flex-row items-center">
        <Text className="text-3xl mr-3">{achievement.icon}</Text>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text
              className={`font-semibold ${
                isUnlocked ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {achievement.name}
            </Text>
            {isUnlocked && (
              <View className="ml-2 bg-green-500/20 px-2 py-0.5 rounded-full">
                <Text className="text-green-600 text-xs font-medium">
                  Unlocked
                </Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-muted-foreground mt-1">
            {achievement.description}
          </Text>
          {isUnlocked && unlockedAt && (
            <Text className="text-xs text-muted-foreground mt-1">
              {formatDate(unlockedAt)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
