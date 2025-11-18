import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useHaptics } from '@/hooks/useHaptics';
import { useRef } from 'react';

interface TimerSliderProps {
  value: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  isBreakTime?: boolean;
}

export function TimerSlider({
  value,
  onChange,
  disabled = false,
  min = 5,
  max = 120,
  step = 5,
  isBreakTime = false,
}: TimerSliderProps) {
  const haptics = useHaptics();
  const lastHapticValue = useRef(value);

  const handleValueChange = (newValue: number) => {
    const rounded = Math.round(newValue / step) * step;

    // Trigger haptic feedback when crossing step increments
    if (Math.abs(rounded - lastHapticValue.current) >= step) {
      haptics.light();
      lastHapticValue.current = rounded;
    }

    onChange(rounded);
  };

  return (
    <View className="items-center px-4">
      {/* Slider */}

      {/* Slider */}
      <View className="w-full">
        <Slider
          value={value}
          onValueChange={handleValueChange}
          minimumValue={min}
          maximumValue={max}
          step={step}
          disabled={disabled}
          minimumTrackTintColor="#8B5CF6"
          maximumTrackTintColor="#27272A"
          thumbTintColor="#A78BFA"
          style={{ width: '100%', height: 40 }}
        />

        {/* Min/Max Labels */}
        <View className="flex-row justify-between px-1 mt-1">
          <Text className="text-xs text-muted-foreground">{min}m</Text>
          <Text className="text-xs text-muted-foreground">{max}m</Text>
        </View>
      </View>
    </View>
  );
}
