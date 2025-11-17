import { View, Pressable, Text, ScrollView } from 'react-native';

interface DurationPickerProps {
  value: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
}

const FOCUS_DURATIONS = [15, 25, 30, 45, 60, 90];
const BREAK_DURATIONS = [5, 10, 15, 20];

export function DurationPicker({
  value,
  onChange,
  disabled = false,
}: DurationPickerProps) {
  const durations = value <= 20 ? BREAK_DURATIONS : FOCUS_DURATIONS;

  return (
    <View>
      <Text className="text-sm text-muted-foreground mb-2">Duration</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {durations.map((duration) => (
            <Pressable
              key={duration}
              onPress={() => onChange(duration)}
              disabled={disabled}
              className={`px-4 py-2 rounded-full border ${
                value === duration
                  ? 'bg-primary border-primary'
                  : 'bg-background border-border'
              } ${disabled ? 'opacity-50' : ''}`}
            >
              <Text
                className={`font-medium ${
                  value === duration
                    ? 'text-primary-foreground'
                    : 'text-foreground'
                }`}
              >
                {duration}m
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
