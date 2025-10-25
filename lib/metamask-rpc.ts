/**
 * Utility to configure MetaMask with Alchemy RPC endpoints
 * This ensures MetaMask uses Alchemy's reliable RPC instead of default public ones
 */

export interface AddEthereumChainParameter {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

/**
 * Adds or switches to Sepolia network in MetaMask with Alchemy RPC
 */
export async function addSepoliaWithAlchemy(): Promise<boolean> {
  if (!window.ethereum) {
    console.error('MetaMask not found');
    return false;
  }

  const alchemyRpc = process.env.NEXT_PUBLIC_ALCHEMY_RPC;
  if (!alchemyRpc) {
    console.warn('⚠️ Alchemy RPC not configured, using default Sepolia RPC');
  }

  const sepoliaParams: AddEthereumChainParameter = {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia (Alchemy)',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      alchemyRpc || 'https://ethereum-sepolia-rpc.publicnode.com',
      'https://rpc.sepolia.org',
    ],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  };

  try {
    // Try to switch to Sepolia first
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: sepoliaParams.chainId }],
    });
    console.log('✅ Switched to Sepolia network');
    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [sepoliaParams],
        });
        console.log('✅ Added Sepolia network with Alchemy RPC to MetaMask');
        return true;
      } catch (addError) {
        console.error('❌ Failed to add Sepolia network:', addError);
        return false;
      }
    }
    console.error('❌ Failed to switch to Sepolia network:', switchError);
    return false;
  }
}

/**
 * Check if user is on the correct network and prompt switch if needed
 */
export async function ensureCorrectNetwork(): Promise<boolean> {
  if (!window.ethereum) {
    return false;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // Check if already on Sepolia
    if (chainId === '0xaa36a7') {
      console.log('✅ Already on Sepolia network');
      return true;
    }

    // Not on Sepolia, try to switch
    console.log('⚠️ Not on Sepolia, attempting to switch...');
    return await addSepoliaWithAlchemy();
  } catch (error) {
    console.error('❌ Error checking network:', error);
    return false;
  }
}
