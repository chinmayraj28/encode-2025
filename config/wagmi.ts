import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';

const projectId = 'YOUR_PROJECT_ID'; // Get from cloud.walletconnect.com

export const config = getDefaultConfig({
  appName: 'Artist Blockchain Platform',
  projectId,
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http()
  }
});