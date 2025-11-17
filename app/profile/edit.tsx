import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeft, Camera, Check } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfileScreen() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      avatar_url: user?.avatar_url || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await updateProfile({
        username: data.username,
        avatar_url: data.avatar_url || undefined,
      });
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} className="text-foreground" />
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">
            Edit Profile
          </Text>
        </View>
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSaving || !isDirty}
          className="bg-primary px-4 py-2 rounded-lg active:opacity-80 disabled:opacity-50"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Check size={20} color="white" />
          )}
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Avatar Preview */}
        <View className="items-center my-6">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center">
              <Text className="text-4xl font-bold text-primary">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Pressable className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center">
              <Camera size={16} color="white" />
            </Pressable>
          </View>
          <Text className="text-sm text-muted-foreground mt-2">
            Tap to change avatar
          </Text>
        </View>

        {/* Username Field */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">
            Username
          </Text>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter username"
                className="bg-card border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />
          {errors.username && (
            <Text className="text-destructive text-sm mt-1">
              {errors.username.message}
            </Text>
          )}
        </View>

        {/* Avatar URL Field */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">
            Avatar URL (Optional)
          </Text>
          <Controller
            control={control}
            name="avatar_url"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="https://example.com/avatar.png"
                className="bg-card border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            )}
          />
          {errors.avatar_url && (
            <Text className="text-destructive text-sm mt-1">
              {errors.avatar_url.message}
            </Text>
          )}
        </View>

        {/* Email (Read-only) */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">
            Email
          </Text>
          <View className="bg-muted border border-border rounded-lg px-4 py-3">
            <Text className="text-muted-foreground">{user?.email}</Text>
          </View>
          <Text className="text-xs text-muted-foreground mt-1">
            Email cannot be changed
          </Text>
        </View>

        {/* Account Info */}
        <View className="bg-card p-4 rounded-xl border border-border mt-4">
          <Text className="text-sm text-muted-foreground">
            Member since{' '}
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'N/A'}
          </Text>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
