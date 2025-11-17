import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimerStore } from '@/stores/timerStore';
import { useTagStore } from '@/stores/tagStore';
import { sessionService } from '@/services/api/sessions';
import type { Session } from '@/types/api';
import { Clock, Calendar, Target, TrendingUp, Tag } from 'lucide-react-native';

export default function StatsScreen() {
  const { stats, fetchStats, isLoadingStats } = useTimerStore();
  const { tags, fetchTags } = useTagStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
    loadSessions();
    fetchTags();
  }, [fetchStats, fetchTags]);

  const loadSessions = async () => {
    try {
      const result = await sessionService.getAll(1, 10);
      setSessions(result.sessions);
    } catch {
      // Handle error
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), loadSessions(), fetchTags()]);
    setIsRefreshing(false);
  };

  const getTagName = (tagId?: string | null) => {
    if (!tagId) return null;
    const tag = tags.find((t) => t.id === tagId);
    return tag?.name || null;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          Statistics
        </Text>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="flex-1 min-w-[45%] bg-card p-4 rounded-xl border border-border">
            <Clock size={24} className="text-primary mb-2" />
            <Text className="text-2xl font-bold text-foreground">
              {formatDuration(stats.total_focus_minutes)}
            </Text>
            <Text className="text-sm text-muted-foreground">
              Total Focus Time
            </Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-card p-4 rounded-xl border border-border">
            <Calendar size={24} className="text-primary mb-2" />
            <Text className="text-2xl font-bold text-foreground">
              {stats.current_streak}
            </Text>
            <Text className="text-sm text-muted-foreground">Day Streak</Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-card p-4 rounded-xl border border-border">
            <Target size={24} className="text-primary mb-2" />
            <Text className="text-2xl font-bold text-foreground">
              {stats.weekly_sessions}
            </Text>
            <Text className="text-sm text-muted-foreground">
              Sessions This Week
            </Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-card p-4 rounded-xl border border-border">
            <TrendingUp size={24} className="text-primary mb-2" />
            <Text className="text-2xl font-bold text-foreground">
              {stats.monthly_sessions}
            </Text>
            <Text className="text-sm text-muted-foreground">
              Sessions This Month
            </Text>
          </View>
        </View>

        {/* Recent Sessions */}
        <Text className="text-xl font-semibold text-foreground mb-4">
          Recent Sessions
        </Text>

        {sessions.length === 0 ? (
          <View className="bg-card p-6 rounded-xl border border-border items-center">
            <Text className="text-muted-foreground">
              No sessions yet. Start your first focus session!
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {sessions.map((session) => {
              const tagName = getTagName(session.tag_id);
              return (
                <View
                  key={session.id}
                  className="bg-card p-4 rounded-xl border border-border"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <View
                        className={`w-3 h-3 rounded-full mr-2 ${
                          session.session_type === 'focus'
                            ? 'bg-red-500'
                            : 'bg-cyan-500'
                        }`}
                      />
                      <Text className="font-medium text-foreground capitalize">
                        {session.session_type}
                      </Text>
                    </View>
                    <Text
                      className={`text-sm font-medium ${
                        session.completed
                          ? 'text-green-500'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {session.completed ? 'Completed' : 'Cancelled'}
                    </Text>
                  </View>
                  {tagName && (
                    <View className="flex-row items-center mb-2">
                      <Tag size={12} className="text-primary" />
                      <Text className="text-xs text-primary ml-1">
                        {tagName}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted-foreground">
                      {formatDate(session.start_time)}
                    </Text>
                    <Text className="text-sm text-foreground font-medium">
                      {session.actual_duration}m / {session.planned_duration}m
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
