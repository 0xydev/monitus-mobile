import { View, Text } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useHaptics } from '@/hooks/useHaptics';

interface CircularSliderProps {
  value: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  isBreakTime?: boolean;
}

export function CircularSlider({
  value,
  onChange,
  disabled = false,
  min = 5,
  max = 120,
  step = 5,
  isBreakTime = false,
}: CircularSliderProps) {
  const haptics = useHaptics();
  const size = 280;
  const strokeWidth = 24;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const lastHapticValue = useRef(value);

  // Convert minutes to angle (0-360)
  const valueToAngle = (minutes: number) => {
    const normalized = (minutes - min) / (max - min);
    return isBreakTime ? 360 - normalized * 360 : normalized * 360;
  };

  // Convert angle to minutes
  const angleToValue = (angle: number) => {
    let normalizedAngle = angle % 360;
    if (normalizedAngle < 0) normalizedAngle += 360;

    const normalized = isBreakTime
      ? (360 - normalizedAngle) / 360
      : normalizedAngle / 360;

    const minutes = Math.round((normalized * (max - min) + min) / step) * step;
    return Math.max(min, Math.min(max, minutes));
  };

  // Calculate angle from touch position
  const calculateAngle = (x: number, y: number) => {
    const dx = x - center;
    const dy = y - center;
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;
    return angle;
  };

  const angle = useSharedValue(valueToAngle(value));

  useEffect(() => {
    angle.value = withSpring(valueToAngle(value));
  }, [value, isBreakTime]);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((event) => {
      const newAngle = calculateAngle(event.x, event.y);
      angle.value = newAngle;

      const newValue = angleToValue(newAngle);

      // Trigger haptic feedback when crossing step increments
      if (Math.abs(newValue - lastHapticValue.current) >= step) {
        haptics.light();
        lastHapticValue.current = newValue;
      }

      onChange(newValue);
    });

  const animatedKnobStyle = useAnimatedStyle(() => {
    const rad = ((angle.value - 90) * Math.PI) / 180;
    const x = center + radius * Math.cos(rad);
    const y = center + radius * Math.sin(rad);

    return {
      transform: [{ translateX: x - 16 }, { translateY: y - 16 }],
    };
  });

  // Calculate progress arc
  const progress = ((value - min) / (max - min)) * circumference;
  const strokeDashoffset = isBreakTime
    ? progress
    : circumference - progress;

  // Generate tick marks every 15 minutes
  const tickMarks = [];
  for (let i = min; i <= max; i += 15) {
    const tickAngle = valueToAngle(i);
    const rad = ((tickAngle - 90) * Math.PI) / 180;
    const innerRadius = radius - 8;
    const outerRadius = radius + 8;

    const x1 = center + innerRadius * Math.cos(rad);
    const y1 = center + innerRadius * Math.sin(rad);
    const x2 = center + outerRadius * Math.cos(rad);
    const y2 = center + outerRadius * Math.sin(rad);

    tickMarks.push(
      <Path
        key={i}
        d={`M ${x1} ${y1} L ${x2} ${y2}`}
        stroke="#6B7280"
        strokeWidth="2"
        strokeLinecap="round"
      />
    );
  }

  return (
    <View className="items-center">
      <Text className="text-sm text-muted-foreground mb-4">
        {isBreakTime ? 'Break Duration' : 'Focus Duration'}
      </Text>

      <GestureDetector gesture={pan}>
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size}>
            {/* Background circle */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#374151"
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Progress arc */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#6366F1"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />

            {/* Tick marks */}
            {tickMarks}
          </Svg>

          {/* Center value display */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text className="text-6xl font-bold text-foreground">{value}</Text>
            <Text className="text-xl text-muted-foreground">minutes</Text>
            <Text className="text-sm text-muted-foreground mt-2">
              {isBreakTime ? '← Rotate left' : 'Rotate right →'}
            </Text>
          </View>

          {/* Draggable knob */}
          <Animated.View
            style={[
              animatedKnobStyle,
              {
                position: 'absolute',
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#6366F1',
                borderWidth: 4,
                borderColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              },
            ]}
          />
        </View>
      </GestureDetector>

      <View className="mt-4 flex-row items-center gap-4">
        <Text className="text-sm text-muted-foreground">
          Min: {min}m
        </Text>
        <Text className="text-sm text-muted-foreground">
          Max: {max}m
        </Text>
        <Text className="text-sm text-muted-foreground">
          Step: {step}m
        </Text>
      </View>
    </View>
  );
}
