'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { OpenfortProvider, AuthProvider, AccountTypeEnum } from '@openfort/react';
import { config } from '../config/wagmi';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OpenfortProvider
          publishableKey={process.env.NEXT_PUBLIC_OPENFORT_PUBLISHABLE_KEY!}
          uiConfig={{
            authProviders: [AuthProvider.GOOGLE, AuthProvider.WALLET],
          }}
          walletConfig={{
            accountType: AccountTypeEnum.EOA,  // Use EOA for custom chains
            shieldPublishableKey: process.env.NEXT_PUBLIC_SHIELD_PUBLISHABLE_KEY!,
          }}
        >
          {children}
        </OpenfortProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
