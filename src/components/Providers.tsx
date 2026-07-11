"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http, useConnect, useAccount } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { ReactNode, useEffect } from 'react';

const queryClient = new QueryClient();

export const config = createConfig({
  chains: [celo, celoAlfajores],
  connectors: [
    injected(),
  ],
  transports: {
    [celo.id]: http(),
    [celoAlfajores.id]: http(),
  },
});

function AutoConnect({ children }: { children: ReactNode }) {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  
  useEffect(() => {
    // Only attempt to auto-connect if we aren't already connected
    if (!isConnected && typeof window !== 'undefined' && window.ethereum) {
      // Find the injected provider (which MiniPay uses)
      const injectedConnector = connectors.find((c) => c.id === 'injected' || c.type === 'injected');
      if (injectedConnector) {
        connect({ connector: injectedConnector });
      }
    }
  }, [connect, connectors, isConnected]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AutoConnect>
          {children}
        </AutoConnect>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
