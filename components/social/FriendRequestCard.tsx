import { View, Text, Pressable } from 'react-native';
import { Check, X } from 'lucide-react-native';
import type { Friendship } from '@/types/api';

interface FriendRequestCardProps {
  request: Friendship;
  type: 'incoming' | 'outgoing';
  username?: string;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
}

export function FriendRequestCard({
  request,
  type,
  username,
  onAccept,
  onReject,
  onCancel,
}: FriendRequestCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View className="bg-card p-4 rounded-xl border border-border">
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
          <Text className="font-semibold text-foreground">
            {username?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>

        <View className="flex-1 ml-3">
          <Text className="font-medium text-foreground">
            {username || `User #${type === 'incoming' ? request.requester_id : request.addressee_id}`}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {type === 'incoming' ? 'Wants to be your friend' : 'Request sent'} •{' '}
            {formatDate(request.created_at)}
          </Text>
        </View>

        {type === 'incoming' ? (
          <View className="flex-row gap-2">
            <Pressable
              onPress={onAccept}
              className="p-2 bg-green-500/20 rounded-lg active:opacity-70"
            >
              <Check size={18} color="#22C55E" />
            </Pressable>
            <Pressable
              onPress={onReject}
              className="p-2 bg-destructive/10 rounded-lg active:opacity-70"
            >
              <X size={18} className="text-destructive" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={onCancel}
            className="px-3 py-1.5 bg-muted rounded-lg active:opacity-70"
          >
            <Text className="text-sm text-muted-foreground">Cancel</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
