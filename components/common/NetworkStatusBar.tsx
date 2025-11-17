import { View, Text } from 'react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react-native';

export function NetworkStatusBar() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <View className="bg-destructive px-4 py-2 flex-row items-center justify-center">
      <WifiOff size={16} color="white" />
      <Text className="text-white font-medium ml-2">
        You're offline. Some features may be unavailable.
      </Text>
    </View>
  );
}
