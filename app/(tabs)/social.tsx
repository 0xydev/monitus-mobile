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
import { leaderboardService } from '@/services/api/leaderboards';
import { friendshipService } from '@/services/api/friendships';
import { userService } from '@/services/api/users';
import type {
  LeaderboardEntry,
  Friend,
  Friendship,
  UserSearchResult as UserSearchResultType,
} from '@/types/api';
import {
  Trophy,
  Medal,
  Award,
  Users,
  Search,
  UserPlus,
} from 'lucide-react-native';
import { FriendCard } from '@/components/social/FriendCard';
import { FriendRequestCard } from '@/components/social/FriendRequestCard';
import { UserSearchResult } from '@/components/social/UserSearchResult';

type TabType = 'leaderboard' | 'friends' | 'search';

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResultType[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [addingFriendId, setAddingFriendId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'leaderboard') {
        const data = await leaderboardService.getGlobal(20);
        setLeaderboard(data);
      } else if (activeTab === 'friends') {
        const [friendsData, pendingData] = await Promise.all([
          friendshipService.getFriends(),
          friendshipService.getPendingRequests(),
        ]);
        setFriends(friendsData);
        setPendingRequests(pendingData);
      }
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) {
      Alert.alert('Error', 'Please enter at least 2 characters');
      return;
    }

    setIsSearching(true);
    try {
      const results = await userService.search(searchQuery);
      setSearchResults(results);
    } catch {
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (userId: number) => {
    setAddingFriendId(userId);
    try {
      await friendshipService.sendRequest(userId);
      Alert.alert('Success', 'Friend request sent!');
      setSearchResults((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send request';
      Alert.alert('Error', message);
    } finally {
      setAddingFriendId(null);
    }
  };

  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      await friendshipService.acceptRequest(friendshipId);
      await loadData();
    } catch {
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (friendshipId: number) => {
    try {
      await friendshipService.rejectRequest(friendshipId);
      setPendingRequests((prev) =>
        prev.filter((r) => r.id !== friendshipId)
      );
    } catch {
      Alert.alert('Error', 'Failed to reject request');
    }
  };

  const handleRemoveFriend = async (friendshipId: number) => {
    Alert.alert('Remove Friend', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await friendshipService.removeFriend(friendshipId);
            setFriends((prev) => prev.filter((f) => f.id !== friendshipId));
          } catch {
            Alert.alert('Error', 'Failed to remove friend');
          }
        },
      },
    ]);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={24} color="#EAB308" />;
      case 2:
        return <Medal size={24} color="#9CA3AF" />;
      case 3:
        return <Award size={24} color="#D97706" />;
      default:
        return null;
    }
  };

  const formatMinutes = (minutes?: number) => {
    if (!minutes) return '0h';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const renderLeaderboard = () => (
    <View className="gap-3">
      {leaderboard.map((entry, index) => {
        const rank = index + 1;
        return (
          <View
            key={entry.id}
            className={`flex-row items-center p-4 rounded-xl border ${
              rank <= 3
                ? 'bg-primary/5 border-primary/20'
                : 'bg-card border-border'
            }`}
          >
            <View className="w-10 items-center">
              {getRankIcon(rank) || (
                <Text className="text-lg font-bold text-muted-foreground">
                  #{rank}
                </Text>
              )}
            </View>

            <View className="w-10 h-10 rounded-full bg-muted items-center justify-center ml-2">
              <Text className="font-semibold text-foreground">
                {entry.username.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View className="flex-1 ml-3">
              <Text className="font-semibold text-foreground">
                {entry.username}
              </Text>
              <Text className="text-sm text-muted-foreground">
                Level {entry.level}
              </Text>
            </View>

            <View className="items-end">
              <Text className="font-bold text-primary">
                {formatMinutes(entry.total_focus_minutes)}
              </Text>
              <Text className="text-xs text-muted-foreground">focus time</Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderFriends = () => (
    <View className="gap-4">
      {pendingRequests.length > 0 && (
        <View>
          <Text className="text-lg font-semibold text-foreground mb-3">
            Friend Requests ({pendingRequests.length})
          </Text>
          <View className="gap-3">
            {pendingRequests.map((request) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                type="incoming"
                onAccept={() => handleAcceptRequest(request.id)}
                onReject={() => handleRejectRequest(request.id)}
              />
            ))}
          </View>
        </View>
      )}

      <View>
        <Text className="text-lg font-semibold text-foreground mb-3">
          Friends ({friends.length})
        </Text>
        {friends.length === 0 ? (
          <View className="bg-card p-6 rounded-xl border border-border items-center">
            <Text className="text-muted-foreground">
              No friends yet. Search for users to add friends!
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {friends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onRemove={() => handleRemoveFriend(friend.id)}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderSearch = () => (
    <View className="gap-4">
      <View className="flex-row gap-2">
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by username..."
          className="flex-1 bg-card border border-border rounded-lg px-4 py-3 text-foreground"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
        />
        <Pressable
          onPress={handleSearch}
          disabled={isSearching}
          className="bg-primary px-4 rounded-lg items-center justify-center active:opacity-80"
        >
          <Search size={20} color="white" />
        </Pressable>
      </View>

      {isSearching ? (
        <View className="bg-card p-6 rounded-xl border border-border items-center">
          <Text className="text-muted-foreground">Searching...</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <View className="gap-3">
          {searchResults.map((user) => (
            <UserSearchResult
              key={user.id}
              user={user}
              onAddFriend={() => handleAddFriend(user.id)}
              isAdding={addingFriendId === user.id}
            />
          ))}
        </View>
      ) : searchQuery.length > 0 ? (
        <View className="bg-card p-6 rounded-xl border border-border items-center">
          <Text className="text-muted-foreground">No users found</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-4">
        <Text className="text-2xl font-bold text-foreground mb-4">Social</Text>

        {/* Tabs */}
        <View className="flex-row bg-muted rounded-lg p-1 mb-4">
          <Pressable
            onPress={() => setActiveTab('leaderboard')}
            className={`flex-1 flex-row items-center justify-center py-2 rounded-md ${
              activeTab === 'leaderboard' ? 'bg-background' : ''
            }`}
          >
            <Trophy
              size={16}
              className={
                activeTab === 'leaderboard'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }
            />
            <Text
              className={`ml-1 text-sm font-medium ${
                activeTab === 'leaderboard'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Board
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('friends')}
            className={`flex-1 flex-row items-center justify-center py-2 rounded-md ${
              activeTab === 'friends' ? 'bg-background' : ''
            }`}
          >
            <Users
              size={16}
              className={
                activeTab === 'friends'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }
            />
            <Text
              className={`ml-1 text-sm font-medium ${
                activeTab === 'friends'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Friends
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('search')}
            className={`flex-1 flex-row items-center justify-center py-2 rounded-md ${
              activeTab === 'search' ? 'bg-background' : ''
            }`}
          >
            <UserPlus
              size={16}
              className={
                activeTab === 'search'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }
            />
            <Text
              className={`ml-1 text-sm font-medium ${
                activeTab === 'search'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Add
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading && activeTab !== 'search' ? (
          <View className="bg-card p-6 rounded-xl border border-border items-center">
            <Text className="text-muted-foreground">Loading...</Text>
          </View>
        ) : activeTab === 'leaderboard' ? (
          renderLeaderboard()
        ) : activeTab === 'friends' ? (
          renderFriends()
        ) : (
          renderSearch()
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
