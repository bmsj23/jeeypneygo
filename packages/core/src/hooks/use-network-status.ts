import { useEffect, useState, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
}

interface UseNetworkStatusReturn {
  status: NetworkStatus;
  isOnline: boolean;
  refresh: () => Promise<void>;
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
  });

  const updateStatus = useCallback((state: NetInfoState) => {
    setStatus({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
    });
  }, []);

  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    updateStatus(state);
  }, [updateStatus]);

  useEffect(() => {
    // get initial state
    NetInfo.fetch().then(updateStatus);

    // subscribe to changes
    const unsubscribe = NetInfo.addEventListener(updateStatus);

    return () => {
      unsubscribe();
    };
  }, [updateStatus]);

  const isOnline = status.isConnected && status.isInternetReachable !== false;

  return {
    status,
    isOnline,
    refresh,
  };
}
