import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
    });

    // Get initial state
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
    connectionType,
    isOffline: isConnected === false,
  };
}
