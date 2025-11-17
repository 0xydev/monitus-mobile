import { View } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: typeof width === 'number' ? width : undefined,
          height,
          borderRadius,
        },
        animatedStyle,
      ]}
      className={`bg-muted ${width === '100%' ? 'w-full' : ''} ${className}`}
    />
  );
}

// Preset skeletons for common use cases
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <View className="gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </View>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

export function SkeletonCard() {
  return (
    <View className="bg-card p-4 rounded-xl border border-border">
      <View className="flex-row items-center mb-3">
        <SkeletonAvatar />
        <View className="ml-3 flex-1">
          <Skeleton height={16} width="50%" className="mb-2" />
          <Skeleton height={12} width="30%" />
        </View>
      </View>
      <SkeletonText lines={2} />
    </View>
  );
}

export function SkeletonStatCard() {
  return (
    <View className="bg-card p-4 rounded-xl border border-border">
      <Skeleton height={24} width={24} borderRadius={4} className="mb-2" />
      <Skeleton height={28} width="60%" className="mb-1" />
      <Skeleton height={14} width="80%" />
    </View>
  );
}
