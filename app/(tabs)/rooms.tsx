import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoomStore } from '@/stores/roomStore';
import { RoomCard } from '@/components/rooms/RoomCard';
import { Plus, LogIn } from 'lucide-react-native';
import { router } from 'expo-router';

export default function RoomsScreen() {
  const {
    myRooms,
    activeRooms,
    isLoading,
    isJoining,
    isCreating,
    error,
    fetchMyRooms,
    fetchActiveRooms,
    joinRoom,
    createRoom,
    clearError,
  } = useRoomStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [timerDuration, setTimerDuration] = useState('25');
  const [breakDuration, setBreakDuration] = useState('5');

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);

  const loadRooms = async () => {
    await Promise.all([fetchMyRooms(), fetchActiveRooms()]);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadRooms();
    setIsRefreshing(false);
  };

  const handleJoinRoom = async () => {
    if (roomCode.length !== 6) {
      Alert.alert('Error', 'Room code must be 6 characters');
      return;
    }

    try {
      await joinRoom(roomCode.toUpperCase());
      setShowJoinModal(false);
      setRoomCode('');
      Alert.alert('Success', 'Joined room successfully!');
    } catch {
      // Error handled in store
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    const timer = parseInt(timerDuration, 10);
    const breakTime = parseInt(breakDuration, 10);

    if (isNaN(timer) || timer < 1 || timer > 180) {
      Alert.alert('Error', 'Timer duration must be between 1 and 180 minutes');
      return;
    }

    if (isNaN(breakTime) || breakTime < 1 || breakTime > 60) {
      Alert.alert('Error', 'Break duration must be between 1 and 60 minutes');
      return;
    }

    try {
      const room = await createRoom(newRoomName.trim(), timer, breakTime);
      setShowCreateModal(false);
      setNewRoomName('');
      setTimerDuration('25');
      setBreakDuration('5');
      Alert.alert(
        'Room Created!',
        `Share this code with friends: ${room.room_code}`
      );
      await loadRooms();
    } catch {
      // Error handled in store
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-foreground">Rooms</Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setShowJoinModal(true)}
              className="bg-muted p-2 rounded-lg active:opacity-80"
            >
              <LogIn size={20} className="text-foreground" />
            </Pressable>
            <Pressable
              onPress={() => setShowCreateModal(true)}
              className="bg-primary p-2 rounded-lg active:opacity-80"
            >
              <Plus size={20} color="white" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* My Rooms */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            My Rooms ({myRooms.length})
          </Text>
          {myRooms.length === 0 ? (
            <View className="bg-card p-6 rounded-xl border border-border items-center">
              <Text className="text-muted-foreground">
                No rooms yet. Create or join a room!
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {myRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onPress={() => {
                    router.push(`/room/${room.id}`);
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Active Public Rooms */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Active Rooms ({activeRooms.length})
          </Text>
          {activeRooms.length === 0 ? (
            <View className="bg-card p-6 rounded-xl border border-border items-center">
              <Text className="text-muted-foreground">
                No active rooms at the moment
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {activeRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onPress={() => {
                    router.push(`/room/${room.id}`);
                  }}
                />
              ))}
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* Join Room Modal */}
      {showJoinModal && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center px-6">
          <View className="bg-card w-full p-6 rounded-xl border border-border">
            <Text className="text-xl font-semibold text-foreground mb-4">
              Join Room
            </Text>
            <TextInput
              value={roomCode}
              onChangeText={(text) => setRoomCode(text.toUpperCase())}
              placeholder="Enter 6-character code"
              className="bg-background border border-border rounded-lg px-4 py-3 text-foreground mb-4 text-center text-lg font-mono tracking-widest"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              maxLength={6}
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setShowJoinModal(false);
                  setRoomCode('');
                }}
                className="flex-1 bg-muted py-3 rounded-lg active:opacity-80"
              >
                <Text className="text-center font-medium text-foreground">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleJoinRoom}
                disabled={isJoining}
                className="flex-1 bg-primary py-3 rounded-lg active:opacity-80"
              >
                <Text className="text-center font-medium text-primary-foreground">
                  {isJoining ? 'Joining...' : 'Join'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center px-6">
          <View className="bg-card w-full p-6 rounded-xl border border-border">
            <Text className="text-xl font-semibold text-foreground mb-4">
              Create Room
            </Text>

            <Text className="text-sm text-muted-foreground mb-2">
              Room Name
            </Text>
            <TextInput
              value={newRoomName}
              onChangeText={setNewRoomName}
              placeholder="Study Group"
              className="bg-background border border-border rounded-lg px-4 py-3 text-foreground mb-4"
              placeholderTextColor="#9CA3AF"
            />

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-2">
                  Focus (min)
                </Text>
                <TextInput
                  value={timerDuration}
                  onChangeText={setTimerDuration}
                  keyboardType="number-pad"
                  className="bg-background border border-border rounded-lg px-4 py-3 text-foreground text-center"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-2">
                  Break (min)
                </Text>
                <TextInput
                  value={breakDuration}
                  onChangeText={setBreakDuration}
                  keyboardType="number-pad"
                  className="bg-background border border-border rounded-lg px-4 py-3 text-foreground text-center"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setShowCreateModal(false);
                  setNewRoomName('');
                }}
                className="flex-1 bg-muted py-3 rounded-lg active:opacity-80"
              >
                <Text className="text-center font-medium text-foreground">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCreateRoom}
                disabled={isCreating}
                className="flex-1 bg-primary py-3 rounded-lg active:opacity-80"
              >
                <Text className="text-center font-medium text-primary-foreground">
                  {isCreating ? 'Creating...' : 'Create'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
