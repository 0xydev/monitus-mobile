import { View, Text, Pressable, Dimensions } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Timer,
  Trophy,
  Users,
  Target,
  Flame,
  ChevronRight,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    title: 'Focus Timer',
    description:
      'Stay productive with customizable Pomodoro sessions. Track your focus time and build better work habits.',
    icon: <Timer size={64} color="#6366F1" />,
    color: '#6366F1',
  },
  {
    title: 'Earn XP & Level Up',
    description:
      'Complete focus sessions to earn experience points. Level up and unlock achievements as you progress.',
    icon: <Trophy size={64} color="#F59E0B" />,
    color: '#F59E0B',
  },
  {
    title: 'Build Streaks',
    description:
      'Maintain daily streaks to stay consistent. The longer your streak, the more rewards you earn.',
    icon: <Flame size={64} color="#EF4444" />,
    color: '#EF4444',
  },
  {
    title: 'Study Together',
    description:
      'Create or join rooms to focus with friends. Compete on leaderboards and stay motivated.',
    icon: <Users size={64} color="#10B981" />,
    color: '#10B981',
  },
  {
    title: 'Track Your Progress',
    description:
      'View detailed statistics about your focus sessions. Organize with tags and achieve your goals.',
    icon: <Target size={64} color="#06B6D4" />,
    color: '#06B6D4',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Mark onboarding as completed
      await AsyncStorage.setItem('onboarding_completed', 'true');
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    router.replace('/(tabs)');
  };

  const currentSlide = slides[currentIndex];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Skip Button */}
        <View className="px-6 pt-4">
          <Pressable onPress={handleSkip} className="self-end">
            <Text className="text-muted-foreground">Skip</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View className="flex-1 items-center justify-center px-8">
          <View
            className="w-32 h-32 rounded-full items-center justify-center mb-8"
            style={{ backgroundColor: `${currentSlide.color}20` }}
          >
            {currentSlide.icon}
          </View>
          <Text className="text-3xl font-bold text-foreground text-center mb-4">
            {currentSlide.title}
          </Text>
          <Text className="text-lg text-muted-foreground text-center leading-7">
            {currentSlide.description}
          </Text>
        </View>

        {/* Pagination & Next */}
        <View className="px-6 pb-6">
          {/* Dots */}
          <View className="flex-row justify-center mb-8">
            {slides.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </View>

          {/* Next Button */}
          <Pressable
            onPress={handleNext}
            className="bg-primary py-4 rounded-xl flex-row items-center justify-center active:opacity-80"
          >
            <Text className="text-primary-foreground font-semibold text-lg mr-2">
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <ChevronRight size={20} color="white" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
