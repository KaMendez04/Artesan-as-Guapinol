import { useState, useEffect } from 'react';
import { Network, type ConnectionStatus } from '@capacitor/network';

export function useNetwork() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);

  useEffect(() => {
    // Get initial status
    Network.getStatus().then(setStatus);

    let handler: any;

    // Listen for changes
    const setupListener = async () => {
      handler = await Network.addListener('networkStatusChange', (status) => {
        setStatus(status);
      });
    };

    setupListener();

    return () => {
      if (handler) {
        handler.remove();
      }
    };
  }, []);

  return {
    isOnline: status?.connected ?? true, // Assume online if status not yet known
    status
  };
}
