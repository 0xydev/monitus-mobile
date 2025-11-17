import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoomStore } from '@/stores/roomStore';
import { useAuthStore } from '@/stores/authStore';
import { roomService } from '@/services/api/rooms';
import {
  ArrowLeft,
  Users,
  Play,
  Pause,
  Square,
  Coffee,
  Copy,
  LogOut,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import type { Room } from '@/types/api';

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    currentRoom,
    participants,
    joinRoom,
    leaveRoom,
    updateRoomState,
    fetchParticipants,
    setCurrentRoom,
    isJoining,
    error,
    clearError,
  } = useRoomStore();

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timerRemaining, setTimerRemaining] = useState(0);

  useEffect(() => {
    if (id) {
      loadRoom();
    }
  }, [id]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);

  // Timer countdown for synchronized timer
  useEffect(() => {
    if (!currentRoom || currentRoom.current_state !== 'running') {
      return;
    }

    const startTime = currentRoom.timer_started_at
      ? new Date(currentRoom.timer_started_at).getTime()
      : Date.now();
    const duration = currentRoom.timer_duration * 60 * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setTimerRemaining(Math.floor(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRoom]);

  const loadRoom = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const roomData = await roomService.getById(id);
      setRoom(roomData);
      setCurrentRoom(roomData);

      // If user is already in this room, fetch participants
      await fetchParticipants();
    } catch (error) {
      Alert.alert('Error', 'Failed to load room');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!room) return;

    try {
      await joinRoom(room.room_code);
      Alert.alert('Success', 'Joined room!');
      await loadRoom();
    } catch {
      // Error handled in store
    }
  };

  const handleLeave = () => {
    Alert.alert('Leave Room', 'Are you sure you want to leave?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          await leaveRoom();
          router.back();
        },
      },
    ]);
  };

  const handleStateChange = async (
    newState: 'idle' | 'running' | 'paused' | 'break'
  ) => {
    try {
      await updateRoomState(newState);
      await loadRoom();
    } catch {
      // Error handled in store
    }
  };

  const copyRoomCode = async () => {
    if (room) {
      await Clipboard.setStringAsync(room.room_code);
      Alert.alert('Copied', 'Room code copied to clipboard!');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCreator = room && user && room.creator_id === user.id;
  const isParticipant = participants.some((p) => p.id === user?.id);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">Loading room...</Text>
      </SafeAreaView>
    );
  }

  if (!room) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">Room not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-4">
          <Pressable onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} className="text-foreground" />
          </Pressable>
          <Text className="text-2xl font-bold text-foreground flex-1">
            {room.name}
          </Text>
        </View>

        {/* Room Code */}
        <Pressable
          onPress={copyRoomCode}
          className="bg-card p-4 rounded-xl border border-border mb-6 flex-row items-center justify-between"
        >
          <View>
            <Text className="text-sm text-muted-foreground">Room Code</Text>
            <Text className="text-2xl font-mono font-bold text-foreground tracking-widest">
              {room.room_code}
            </Text>
          </View>
          <Copy size={20} className="text-muted-foreground" />
        </Pressable>

        {/* Timer Status */}
        <View className="bg-card p-6 rounded-xl border border-border mb-6 items-center">
          <Text className="text-sm text-muted-foreground mb-2">
            {room.current_state === 'running'
              ? 'Focus Session'
              : room.current_state === 'break'
                ? 'Break Time'
                : room.current_state === 'paused'
                  ? 'Paused'
                  : 'Waiting to Start'}
          </Text>

          {room.current_state === 'running' ? (
            <Text className="text-5xl font-mono font-bold text-foreground">
              {formatTime(timerRemaining)}
            </Text>
          ) : (
            <Text className="text-5xl font-mono font-bold text-muted-foreground">
              {room.timer_duration}:00
            </Text>
          )}

          <Text className="text-sm text-muted-foreground mt-2">
            {room.timer_duration}m focus / {room.break_duration}m break
          </Text>
        </View>

        {/* Room Controls (Creator only) */}
        {isCreator && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Room Controls
            </Text>
            <View className="flex-row gap-3">
              {room.current_state === 'idle' && (
                <Pressable
                  onPress={() => handleStateChange('running')}
                  className="flex-1 bg-green-500 py-3 rounded-lg items-center flex-row justify-center"
                >
                  <Play size={20} color="white" />
                  <Text className="text-white font-medium ml-2">Start</Text>
                </Pressable>
              )}

              {room.current_state === 'running' && (
                <>
                  <Pressable
                    onPress={() => handleStateChange('paused')}
                    className="flex-1 bg-yellow-500 py-3 rounded-lg items-center flex-row justify-center"
                  >
                    <Pause size={20} color="white" />
                    <Text className="text-white font-medium ml-2">Pause</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleStateChange('break')}
                    className="flex-1 bg-cyan-500 py-3 rounded-lg items-center flex-row justify-center"
                  >
                    <Coffee size={20} color="white" />
                    <Text className="text-white font-medium ml-2">Break</Text>
                  </Pressable>
                </>
              )}

              {room.current_state === 'paused' && (
                <>
                  <Pressable
                    onPress={() => handleStateChange('running')}
                    className="flex-1 bg-green-500 py-3 rounded-lg items-center flex-row justify-center"
                  >
                    <Play size={20} color="white" />
                    <Text className="text-white font-medium ml-2">Resume</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleStateChange('idle')}
                    className="flex-1 bg-destructive py-3 rounded-lg items-center flex-row justify-center"
                  >
                    <Square size={20} color="white" />
                    <Text className="text-white font-medium ml-2">Stop</Text>
                  </Pressable>
                </>
              )}

              {room.current_state === 'break' && (
                <Pressable
                  onPress={() => handleStateChange('running')}
                  className="flex-1 bg-green-500 py-3 rounded-lg items-center flex-row justify-center"
                >
                  <Play size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Start Focus
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Participants */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Users size={20} className="text-foreground" />
            <Text className="text-lg font-semibold text-foreground ml-2">
              Participants ({participants.length})
            </Text>
          </View>

          {participants.length === 0 ? (
            <View className="bg-card p-4 rounded-xl border border-border">
              <Text className="text-muted-foreground">
                No participants yet
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {participants.map((participant) => (
                <View
                  key={participant.id}
                  className="bg-card p-3 rounded-lg border border-border flex-row items-center"
                >
                  <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                    <Text className="font-semibold text-primary">
                      {participant.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text className="ml-3 font-medium text-foreground flex-1">
                    {participant.username}
                  </Text>
                  {room.creator_id === participant.id && (
                    <View className="bg-primary/10 px-2 py-1 rounded">
                      <Text className="text-xs text-primary font-medium">
                        Creator
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Actions */}
        <View className="gap-3 mb-6">
          {!isParticipant && (
            <Pressable
              onPress={handleJoin}
              disabled={isJoining}
              className="bg-primary py-3 rounded-lg items-center"
            >
              <Text className="text-primary-foreground font-medium">
                {isJoining ? 'Joining...' : 'Join Room'}
              </Text>
            </Pressable>
          )}

          {isParticipant && (
            <Pressable
              onPress={handleLeave}
              className="bg-destructive/10 py-3 rounded-lg items-center flex-row justify-center"
            >
              <LogOut size={18} className="text-destructive" />
              <Text className="text-destructive font-medium ml-2">
                Leave Room
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
