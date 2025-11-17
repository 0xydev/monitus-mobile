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
import { authService } from '@/services/api/auth';
import { ArrowLeft, Eye, EyeOff, Lock, Check } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ChangePasswordScreen() {
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword || '');

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-destructive';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  const onSubmit = async (data: PasswordFormData) => {
    setIsSaving(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to change password'
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
            Change Password
          </Text>
        </View>
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSaving}
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
        <View className="bg-card p-4 rounded-xl border border-border mb-6 mt-4">
          <View className="flex-row items-center">
            <Lock size={20} className="text-primary" />
            <Text className="text-sm text-muted-foreground ml-2 flex-1">
              For security, we recommend using a unique password that you don't
              use elsewhere.
            </Text>
          </View>
        </View>

        {/* Current Password */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">
            Current Password
          </Text>
          <View className="relative">
            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter current password"
                  className="bg-card border border-border rounded-lg px-4 py-3 text-foreground pr-12"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
              )}
            />
            <Pressable
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-4 top-3"
            >
              {showCurrentPassword ? (
                <EyeOff size={20} className="text-muted-foreground" />
              ) : (
                <Eye size={20} className="text-muted-foreground" />
              )}
            </Pressable>
          </View>
          {errors.currentPassword && (
            <Text className="text-destructive text-sm mt-1">
              {errors.currentPassword.message}
            </Text>
          )}
        </View>

        {/* New Password */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">
            New Password
          </Text>
          <View className="relative">
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter new password"
                  className="bg-card border border-border rounded-lg px-4 py-3 text-foreground pr-12"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
              )}
            />
            <Pressable
              onPress={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-3"
            >
              {showNewPassword ? (
                <EyeOff size={20} className="text-muted-foreground" />
              ) : (
                <Eye size={20} className="text-muted-foreground" />
              )}
            </Pressable>
          </View>
          {errors.newPassword && (
            <Text className="text-destructive text-sm mt-1">
              {errors.newPassword.message}
            </Text>
          )}

          {/* Password Strength Indicator */}
          {newPassword && (
            <View className="mt-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-muted-foreground">
                  Password Strength
                </Text>
                <Text className="text-xs font-medium text-foreground">
                  {getStrengthText()}
                </Text>
              </View>
              <View className="h-2 bg-muted rounded-full overflow-hidden">
                <View
                  className={`h-full ${getStrengthColor()}`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Confirm Password */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">
            Confirm New Password
          </Text>
          <View className="relative">
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Confirm new password"
                  className="bg-card border border-border rounded-lg px-4 py-3 text-foreground pr-12"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
              )}
            />
            <Pressable
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-3"
            >
              {showConfirmPassword ? (
                <EyeOff size={20} className="text-muted-foreground" />
              ) : (
                <Eye size={20} className="text-muted-foreground" />
              )}
            </Pressable>
          </View>
          {errors.confirmPassword && (
            <Text className="text-destructive text-sm mt-1">
              {errors.confirmPassword.message}
            </Text>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
