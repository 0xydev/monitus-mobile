import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text as UIText } from '@/components/ui/text';
import { Timer } from 'lucide-react-native';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    clearError();
    try {
      await login(data.email, data.password);
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
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo */}
          <View className="items-center mb-8">
            <View className="bg-primary/10 p-4 rounded-full mb-4">
              <Timer size={48} className="text-primary" />
            </View>
            <Text className="text-3xl font-semibold text-foreground">
              Monitus
            </Text>
            <Text className="text-muted-foreground mt-2">
              Focus better, achieve more
            </Text>
          </View>

          {/* Title */}
          <Text className="text-2xl font-semibold text-foreground mb-6">
            Welcome Back
          </Text>

          {/* Error Display */}
          {error && (
            <View className="bg-destructive/10 p-3 rounded-lg mb-4 border border-destructive/20">
              <Text className="text-destructive">{error}</Text>
            </View>
          )}

          {/* Form */}
          <View className="gap-4">
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
                    placeholder="Enter your password"
                    secureTextEntry
                    autoComplete="password"
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

            <Button
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="mt-2"
            >
              <UIText className="text-primary-foreground font-semibold">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </UIText>
            </Button>
          </View>

          {/* Register Link */}
          <Pressable
            onPress={() => router.push('/(auth)/register')}
            className="mt-6"
          >
            <Text className="text-center text-muted-foreground">
              Don't have an account?{' '}
              <Text className="text-primary font-semibold">Sign Up</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
