import { createConfig, http, fallback } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export { sepolia };

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: fallback([
      // Primary: Your dedicated Alchemy RPC (high rate limit)
      http(process.env.NEXT_PUBLIC_ALCHEMY_RPC || 'https://ethereum-sepolia-rpc.publicnode.com'),
      // Fallback: Multiple public RPCs
      http('https://rpc.sepolia.org'),
      http('https://eth-sepolia.public.blastapi.io'),
      http('https://ethereum-sepolia-rpc.publicnode.com'),
      http('https://sepolia.gateway.tenderly.co'),
      http(), // Default fallback
    ]),
  },
  ssr: true,
});
