import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Mask, Path } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTimerStore } from '@/stores/timerStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useEffect } from 'react';

interface TimerCircleProps {
  size?: number;
  onDurationChange?: (minutes: number) => void;
  currentDuration?: number;
  min?: number;
  max?: number;
}

// Create Animated Path outside component
const AnimatedPath = Animated.createAnimatedComponent(Path);

export function TimerCircle({
  size = 300,
  onDurationChange,
  currentDuration = 25,
  min = 5,
  max = 120,
}: TimerCircleProps) {
  const { timeRemaining, totalDuration, sessionType, isRunning } = useTimerStore();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  // Hybrid Scale Logic
  const getInitialProgress = () => {
    if (isRunning && totalDuration > 0) {
      return timeRemaining / totalDuration;
    }
    return currentDuration / max;
  };

  const progress = useSharedValue(getInitialProgress());
  const isDragging = useSharedValue(false);

  // Sync progress with state changes
  useEffect(() => {
    if (isRunning && totalDuration > 0) {
      progress.value = withTiming(timeRemaining / totalDuration, {
        duration: 1000,
        easing: Easing.linear,
      });
    } else if (!isDragging.value) {
      const targetProgress = currentDuration / max;
      progress.value = withSpring(targetProgress, { damping: 20, stiffness: 90 });
    }
  }, [isRunning, timeRemaining, totalDuration, currentDuration, max]);

  const radius = (size - 40) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Explicit Path Definition:
  // Start at Top Center (cx, cy - r)
  // Draw Clockwise (Sweep Flag 1)
  // Two arcs to form a full circle
  const startX = center;
  const startY = center - radius;
  const endX = center;
  const endY = center + radius;

  const circlePath = `
    M ${startX} ${startY}
    A ${radius} ${radius} 0 0 1 ${endX} ${endY}
    A ${radius} ${radius} 0 0 1 ${startX} ${startY}
  `;

  // Tick Logic
  const tickCount = 60;
  const dashLength = (circumference / tickCount) * 0.6;
  const gapLength = (circumference / tickCount) * 0.4;
  const strokeDasharray = `${dashLength} ${gapLength}`;

  // Animated props for the MASK Path (Solid)
  const animatedMaskProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference * (1 - progress.value),
    };
  });

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Colors
  const startColor = sessionType === 'focus' ? '#EF4444' : '#06B6D4';
  const endColor = sessionType === 'focus' ? '#FCA5A5' : '#A5F3FC';
  const bgStrokeColor = '#3F3F46';

  const triggerHaptic = () => {
    haptics.light();
  };

  const updateDuration = (newDuration: number) => {
    if (onDurationChange) {
      onDurationChange(newDuration);
    }
  };

  // Circular Gesture Worklet
  const panGesture = Gesture.Pan()
    .enabled(!isRunning)
    .onStart(() => {
      isDragging.value = true;
      scale.value = withSpring(1.02);
    })
    .onUpdate((event) => {
      const centerX = size / 2;
      const centerY = size / 2;

      // Calculate angle: 0 at Top
      // atan2(y, x) -> 0 is Right (0 rad)
      // Top is -PI/2 (-90 deg)

      let angle = Math.atan2(event.y - centerY, event.x - centerX);
      let degrees = (angle * 180) / Math.PI;

      // Adjust so Top (-90) is 0 degrees
      degrees += 90;

      // Normalize to 0-360
      if (degrees < 0) degrees += 360;

      const percentage = degrees / 360;
      progress.value = percentage;

      const rawDuration = Math.round(percentage * max);
      const snappedDuration = Math.round(rawDuration / 5) * 5;
      const finalDuration = Math.max(min, Math.min(max, snappedDuration));

      runOnJS(updateDuration)(finalDuration);
    })
    .onEnd(() => {
      isDragging.value = false;
      scale.value = withSpring(1);

      const finalRaw = Math.round(progress.value * max);
      const finalSnapped = Math.round(finalRaw / 5) * 5;
      const finalDuration = Math.max(min, Math.min(max, finalSnapped));

      progress.value = withSpring(finalDuration / max);

      runOnJS(updateDuration)(finalDuration);
      runOnJS(triggerHaptic)();
    });

  // Tap Gesture
  const tapGesture = Gesture.Tap()
    .enabled(!isRunning)
    .onEnd((event) => {
      const centerX = size / 2;
      const centerY = size / 2;
      let angle = Math.atan2(event.y - centerY, event.x - centerX);
      let degrees = (angle * 180) / Math.PI;
      degrees += 90;
      if (degrees < 0) degrees += 360;

      const percentage = degrees / 360;
      const finalRaw = Math.round(percentage * max);
      const finalSnapped = Math.round(finalRaw / 5) * 5;
      const finalDuration = Math.max(min, Math.min(max, finalSnapped));

      progress.value = withSpring(finalDuration / max);

      runOnJS(updateDuration)(finalDuration);
      runOnJS(triggerHaptic)();
    });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="tickGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={startColor} />
              <Stop offset="100%" stopColor={endColor} />
            </LinearGradient>

            {/* MASK */}
            <Mask id="tickMask">
              <AnimatedPath
                d={circlePath}
                stroke="white"
                strokeWidth={40}
                fill="transparent"
                strokeDasharray={`${circumference} ${circumference}`}
                animatedProps={animatedMaskProps}
                strokeLinecap="butt"
              />
            </Mask>
          </Defs>

          {/* Background Ticks */}
          <Path
            d={circlePath}
            stroke={bgStrokeColor}
            strokeWidth={30}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            opacity={0.3}
          />

          {/* Foreground Ticks (Masked) */}
          <Path
            d={circlePath}
            stroke="url(#tickGradient)"
            strokeWidth={30}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            mask="url(#tickMask)"
          />
        </Svg>

        <View className="absolute items-center pointer-events-none">
          <Text className="text-7xl font-bold text-foreground font-mono tracking-tighter">
            {isRunning ? timeString : currentDuration}
          </Text>

          {!isRunning && (
            <View className="items-center mt-2">
              <Text className="text-xs text-muted-foreground uppercase tracking-widest">
                MINUTES
              </Text>
              <Text className="text-[10px] text-muted-foreground/50 mt-1">
                DRAG TO SET
              </Text>
            </View>
          )}
          {isRunning && (
            <Text className="text-sm text-muted-foreground mt-2 uppercase tracking-widest">
              {sessionType === 'focus' ? 'FOCUS' : 'BREAK'}
            </Text>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
