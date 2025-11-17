import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useTimerStore } from '@/stores/timerStore';
import { achievementService } from '@/services/api/achievements';
import { router } from 'expo-router';
import {
  Mail,
  Calendar,
  LogOut,
  Moon,
  Sun,
  Trophy,
  Flame,
  Target,
  Settings,
  Edit3,
  ChevronRight,
  KeyRound,
  Trash2,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { setAndroidNavigationBar } from '@/lib/android-navigation-bar';
import { setItem } from '@/lib/storage';
import { AchievementCard } from '@/components/gamification/AchievementCard';
import { authService } from '@/services/api/auth';
import type { AchievementDefinition, UserAchievement } from '@/types/api';

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const { stats, fetchStats } = useTimerStore();
  const { colorScheme, setColorScheme } = useColorScheme();

  const [achievements, setAchievements] = useState<
    Record<string, AchievementDefinition>
  >({});
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    []
  );
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);

  useEffect(() => {
    loadAchievements();
    fetchStats();
  }, [fetchStats]);

  const loadAchievements = async () => {
    try {
      const [definitions, unlocked] = await Promise.all([
        achievementService.getDefinitions(),
        achievementService.getUserAchievements(),
      ]);
      setAchievements(definitions);
      setUserAchievements(unlocked);
    } catch {
      // Handle error silently
    } finally {
      setIsLoadingAchievements(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const toggleTheme = () => {
    const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newTheme);
    setAndroidNavigationBar(newTheme);
    setItem('theme', newTheme);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. Your account will be scheduled for deletion and you will have 30 days to restore it. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion. This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Delete',
                  style: 'destructive',
                  onPress: async () => {
                    setIsDeleting(true);
                    try {
                      await authService.deleteAccount();
                      Alert.alert(
                        'Account Scheduled for Deletion',
                        'Your account has been scheduled for deletion. You have 30 days to restore it by logging in again.',
                        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
                      );
                    } catch (error) {
                      Alert.alert(
                        'Error',
                        error instanceof Error
                          ? error.message
                          : 'Failed to delete account'
                      );
                    } finally {
                      setIsDeleting(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isAchievementUnlocked = (achievementId: string) => {
    return userAchievements.some((ua) => ua.achievement_id === achievementId);
  };

  const getUnlockedAt = (achievementId: string) => {
    const ua = userAchievements.find(
      (ua) => ua.achievement_id === achievementId
    );
    return ua?.unlocked_at;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6">
        <Text className="text-2xl font-bold text-foreground mt-4 mb-6">
          Profile
        </Text>

        {/* User Info Card */}
        <View className="bg-card p-6 rounded-xl border border-border mb-6">
          <View className="items-center mb-4">
            <Pressable
              onPress={() => router.push('/profile/edit')}
              className="relative"
            >
              <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-3">
                <Text className="text-3xl font-bold text-primary">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View className="absolute bottom-2 right-0 bg-primary w-6 h-6 rounded-full items-center justify-center">
                <Edit3 size={12} color="white" />
              </View>
            </Pressable>
            <Text className="text-xl font-semibold text-foreground">
              {user?.username || 'User'}
            </Text>
            <Text className="text-sm text-muted-foreground">
              Level {stats.level}
            </Text>
          </View>

          <View className="gap-3">
            <View className="flex-row items-center">
              <Mail size={18} className="text-muted-foreground" />
              <Text className="ml-3 text-foreground">{user?.email}</Text>
            </View>
            <View className="flex-row items-center">
              <Calendar size={18} className="text-muted-foreground" />
              <Text className="ml-3 text-foreground">
                Joined {formatDate(user?.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Summary */}
        <View className="bg-card p-6 rounded-xl border border-border mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Your Stats
          </Text>
          <View className="gap-4">
            <View className="flex-row items-center">
              <Trophy size={24} className="text-yellow-500" />
              <View className="ml-3">
                <Text className="font-medium text-foreground">
                  {stats.xp} XP
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Total Experience
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Flame size={24} color="#F59E0B" />
              <View className="ml-3">
                <Text className="font-medium text-foreground">
                  {stats.longest_streak} days
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Longest Streak
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Target size={24} className="text-primary" />
              <View className="ml-3">
                <Text className="font-medium text-foreground">
                  {Math.round(stats.total_focus_hours)} hours
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Total Focus Time
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Achievements ({userAchievements.length}/
            {Object.keys(achievements).length})
          </Text>
          {isLoadingAchievements ? (
            <View className="bg-card p-6 rounded-xl border border-border items-center">
              <Text className="text-muted-foreground">
                Loading achievements...
              </Text>
            </View>
          ) : Object.keys(achievements).length === 0 ? (
            <View className="bg-card p-6 rounded-xl border border-border items-center">
              <Text className="text-muted-foreground">
                No achievements available
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {Object.values(achievements).map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={isAchievementUnlocked(achievement.id)}
                  unlockedAt={getUnlockedAt(achievement.id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Settings */}
        <View className="bg-card rounded-xl border border-border mb-6">
          <Pressable
            onPress={() => router.push('/settings')}
            className="flex-row items-center justify-between p-4 border-b border-border"
          >
            <View className="flex-row items-center">
              <Settings size={20} className="text-foreground" />
              <Text className="ml-3 text-foreground">Settings</Text>
            </View>
            <ChevronRight size={20} className="text-muted-foreground" />
          </Pressable>

          <Pressable
            onPress={() => router.push('/profile/change-password')}
            className="flex-row items-center justify-between p-4 border-b border-border"
          >
            <View className="flex-row items-center">
              <KeyRound size={20} className="text-foreground" />
              <Text className="ml-3 text-foreground">Change Password</Text>
            </View>
            <ChevronRight size={20} className="text-muted-foreground" />
          </Pressable>

          <Pressable
            onPress={toggleTheme}
            className="flex-row items-center justify-between p-4 border-b border-border"
          >
            <View className="flex-row items-center">
              {colorScheme === 'dark' ? (
                <Moon size={20} className="text-foreground" />
              ) : (
                <Sun size={20} className="text-foreground" />
              )}
              <Text className="ml-3 text-foreground">Theme</Text>
            </View>
            <Text className="text-muted-foreground capitalize">
              {colorScheme}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            disabled={isLoading}
            className="flex-row items-center p-4"
          >
            <LogOut size={20} className="text-destructive" />
            <Text className="ml-3 text-destructive">
              {isLoading ? 'Logging out...' : 'Logout'}
            </Text>
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-destructive mb-3">
            Danger Zone
          </Text>
          <View className="bg-destructive/5 rounded-xl border border-destructive/20 p-4">
            <View className="flex-row items-start mb-3">
              <Trash2 size={20} color="#EF4444" />
              <View className="ml-3 flex-1">
                <Text className="font-medium text-foreground">
                  Delete Account
                </Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Permanently delete your account and all associated data. You
                  have 30 days to restore your account after deletion.
                </Text>
              </View>
            </View>
            <Pressable
              onPress={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive py-3 rounded-lg active:opacity-80 disabled:opacity-50"
            >
              <Text className="text-center font-medium text-white">
                {isDeleting ? 'Deleting...' : 'Delete My Account'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
