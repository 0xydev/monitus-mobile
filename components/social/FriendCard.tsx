import { View, Text, Pressable } from 'react-native';
import { UserMinus, MessageCircle } from 'lucide-react-native';
import type { Friend } from '@/types/api';

interface FriendCardProps {
  friend: Friend;
  onRemove?: () => void;
  onMessage?: () => void;
}

export function FriendCard({ friend, onRemove, onMessage }: FriendCardProps) {
  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  return (
    <View className="bg-card p-4 rounded-xl border border-border">
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
          <Text className="text-lg font-semibold text-primary">
            {friend.username.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View className="flex-1 ml-3">
          <Text className="font-semibold text-foreground">
            {friend.username}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-sm text-muted-foreground">
              Level {friend.level}
            </Text>
            <Text className="text-muted-foreground mx-2">•</Text>
            <Text className="text-sm text-muted-foreground">
              {formatMinutes(friend.total_focus_minutes)} focus
            </Text>
            <Text className="text-muted-foreground mx-2">•</Text>
            <Text className="text-sm text-muted-foreground">
              {friend.current_streak} day streak
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          {onMessage && (
            <Pressable
              onPress={onMessage}
              className="p-2 bg-muted rounded-lg active:opacity-70"
            >
              <MessageCircle size={18} className="text-foreground" />
            </Pressable>
          )}
          {onRemove && (
            <Pressable
              onPress={onRemove}
              className="p-2 bg-destructive/10 rounded-lg active:opacity-70"
            >
              <UserMinus size={18} className="text-destructive" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
