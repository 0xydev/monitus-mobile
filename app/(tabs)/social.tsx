import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/lib/api-endpoints';
import type { ApiSuccessResponse, LeaderboardEntry } from '@/types/api';
import { Trophy, Medal, Award } from 'lucide-react-native';

export default function SocialScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await apiClient.request<
        ApiSuccessResponse<LeaderboardEntry[]>
      >(`${endpoints.globalLeaderboard}?limit=20`, { skipAuth: true });
      setLeaderboard(response.data);
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadLeaderboard();
    setIsRefreshing(false);
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-2xl font-bold text-foreground mt-4 mb-6">
          Global Leaderboard
        </Text>

        {isLoading ? (
          <View className="bg-card p-6 rounded-xl border border-border items-center">
            <Text className="text-muted-foreground">
              Loading leaderboard...
            </Text>
          </View>
        ) : leaderboard.length === 0 ? (
          <View className="bg-card p-6 rounded-xl border border-border items-center">
            <Text className="text-muted-foreground">
              No leaderboard data available
            </Text>
          </View>
        ) : (
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
                    <Text className="text-xs text-muted-foreground">
                      focus time
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
