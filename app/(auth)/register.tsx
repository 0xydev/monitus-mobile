import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text as UIText } from '@/components/ui/text';
import { Timer, ArrowLeft } from 'lucide-react-native';

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    clearError();
    try {
      await register(data.username, data.email, data.password);
      router.replace('/(tabs)');
    } catch {
      // Error handled in store
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 py-12">
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center mb-6"
          >
            <ArrowLeft size={20} className="text-foreground" />
            <Text className="text-foreground ml-2">Back</Text>
          </Pressable>

          {/* Logo */}
          <View className="items-center mb-6">
            <View className="bg-primary/10 p-4 rounded-full mb-4">
              <Timer size={40} className="text-primary" />
            </View>
            <Text className="text-2xl font-semibold text-foreground">
              Create Account
            </Text>
            <Text className="text-muted-foreground mt-2 text-center">
              Join Monitus and start your focus journey
            </Text>
          </View>

          {/* Error Display */}
          {error && (
            <View className="bg-destructive/10 p-3 rounded-lg mb-4 border border-destructive/20">
              <Text className="text-destructive">{error}</Text>
            </View>
          )}

          {/* Form */}
          <View className="gap-4">
            <View>
              <UIText className="mb-2 text-foreground">Username</UIText>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Choose a username"
                    autoCapitalize="none"
                    autoComplete="username"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    className={errors.username ? 'border-destructive' : ''}
                  />
                )}
              />
              {errors.username && (
                <Text className="text-destructive text-sm mt-1">
                  {errors.username.message}
                </Text>
              )}
            </View>

            <View>
              <UIText className="mb-2 text-foreground">Email</UIText>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="your@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                )}
              />
              {errors.email && (
                <Text className="text-destructive text-sm mt-1">
                  {errors.email.message}
                </Text>
              )}
            </View>

            <View>
              <UIText className="mb-2 text-foreground">Password</UIText>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Create a strong password"
                    secureTextEntry
                    autoComplete="new-password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    className={errors.password ? 'border-destructive' : ''}
                  />
                )}
              />
              {errors.password && (
                <Text className="text-destructive text-sm mt-1">
                  {errors.password.message}
                </Text>
              )}
            </View>

            <View>
              <UIText className="mb-2 text-foreground">Confirm Password</UIText>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Confirm your password"
                    secureTextEntry
                    autoComplete="new-password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text className="text-destructive text-sm mt-1">
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>

            <Button
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="mt-2"
            >
              <UIText className="text-primary-foreground font-semibold">
                {isLoading ? 'Creating account...' : 'Create Account'}
              </UIText>
            </Button>
          </View>

          {/* Login Link */}
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            className="mt-6"
          >
            <Text className="text-center text-muted-foreground">
              Already have an account?{' '}
              <Text className="text-primary font-semibold">Sign In</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
