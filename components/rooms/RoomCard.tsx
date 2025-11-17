import { View, Text, Pressable } from 'react-native';
import { Users, Clock, Play, Pause } from 'lucide-react-native';
import type { Room } from '@/types/api';

interface RoomCardProps {
  room: Room;
  onPress?: () => void;
}

export function RoomCard({ room, onPress }: RoomCardProps) {
  const getStateColor = () => {
    switch (room.current_state) {
      case 'running':
        return 'text-green-500';
      case 'paused':
        return 'text-yellow-500';
      case 'break':
        return 'text-cyan-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStateIcon = () => {
    switch (room.current_state) {
      case 'running':
        return <Play size={16} color="#22C55E" />;
      case 'paused':
        return <Pause size={16} color="#EAB308" />;
      case 'break':
        return <Clock size={16} color="#06B6D4" />;
      default:
        return null;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-card p-4 rounded-xl border border-border active:opacity-80"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-foreground flex-1">
          {room.name}
        </Text>
        <View className="bg-muted px-2 py-1 rounded">
          <Text className="text-xs font-mono text-muted-foreground">
            {room.room_code}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-3">
        <View className="flex-row items-center mr-4">
          <Clock size={14} className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground ml-1">
            {room.timer_duration}m focus / {room.break_duration}m break
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          {getStateIcon()}
          <Text className={`text-sm font-medium ml-1 capitalize ${getStateColor()}`}>
            {room.current_state}
          </Text>
        </View>

        {room.is_active ? (
          <View className="bg-green-500/20 px-2 py-1 rounded-full">
            <Text className="text-xs text-green-600 font-medium">Active</Text>
          </View>
        ) : (
          <View className="bg-muted px-2 py-1 rounded-full">
            <Text className="text-xs text-muted-foreground">Inactive</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
