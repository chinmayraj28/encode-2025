import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

export const chains = [arbitrumSepolia];

const { publicClient } = configureChains(chains, [publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: 'Artist Blockchain Platform',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Replace with actual projectId from cloud.walletconnect.com
  chains,
});

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});