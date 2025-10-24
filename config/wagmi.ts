import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'wagmi/chains';
import { Chain } from 'viem';

// Custom localhost chain with correct Hardhat chain ID
const hardhatLocal: Chain = {
  id: 31337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
};

export const config = getDefaultConfig({
  appName: 'Artist Blockchain Platform',
  projectId: '1a6990d651f93baf1fe5dc4c9d729045',
  chains: [hardhatLocal, arbitrumSepolia],
  ssr: true,
});
