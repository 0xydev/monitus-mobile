import { View, Text, Pressable } from 'react-native';
import { UserPlus } from 'lucide-react-native';
import type { UserSearchResult as UserSearchResultType } from '@/types/api';

interface UserSearchResultProps {
  user: UserSearchResultType;
  onAddFriend?: () => void;
  isAdding?: boolean;
}

export function UserSearchResult({
  user,
  onAddFriend,
  isAdding,
}: UserSearchResultProps) {
  return (
    <View className="flex-row items-center p-3 bg-card rounded-lg border border-border">
      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
        <Text className="font-semibold text-primary">
          {user.username.charAt(0).toUpperCase()}
        </Text>
      </View>

      <Text className="flex-1 ml-3 font-medium text-foreground">
        {user.username}
      </Text>

      {onAddFriend && (
        <Pressable
          onPress={onAddFriend}
          disabled={isAdding}
          className={`p-2 rounded-lg ${
            isAdding ? 'bg-muted' : 'bg-primary/10 active:opacity-70'
          }`}
        >
          <UserPlus
            size={18}
            className={isAdding ? 'text-muted-foreground' : 'text-primary'}
          />
        </Pressable>
      )}
    </View>
  );
}
