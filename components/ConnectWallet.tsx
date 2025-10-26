'use client';

import { useAccount, useDisconnect, useBalance, useSwitchChain } from 'wagmi';
import { useUI, useSignOut } from '@openfort/react';
import { useState, useEffect } from 'react';
import { sepolia } from '@/config/wagmi';
import { ensureCorrectNetwork, addSepoliaWithAlchemy } from '@/lib/metamask-rpc';

const SUPPORTED_CHAINS = [sepolia];

export default function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { switchChain } = useSwitchChain();
  const { signOut } = useSignOut();
  const { open } = useUI();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConfiguringRPC, setIsConfiguringRPC] = useState(false);
  const [showRPCHelper, setShowRPCHelper] = useState(false);

  // Check if user might have RPC issues
  useEffect(() => {
    if (isConnected && chain?.id === sepolia.id) {
      // Show helper if they're on Sepolia but might have RPC issues
      const hasShownHelper = sessionStorage.getItem('rpc-helper-shown');
      if (!hasShownHelper) {
        setShowRPCHelper(true);
        sessionStorage.setItem('rpc-helper-shown', 'true');
      }
    }
  }, [isConnected, chain?.id]);

  // Ensure MetaMask is configured with Alchemy RPC when connected
  useEffect(() => {
    if (isConnected && chain?.id === sepolia.id) {
      ensureCorrectNetwork().catch(console.error);
    }
  }, [isConnected, chain?.id]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
      setShowNetworkMenu(false);
    };
    
    if (showDropdown || showNetworkMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown, showNetworkMenu]);

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = async () => {
    await signOut();
    setShowDropdown(false);
  };

  const handleSwitchNetwork = async (chainId: number) => {
    // First ensure MetaMask has Alchemy RPC configured
    await ensureCorrectNetwork();
    // Then switch using wagmi
    switchChain({ chainId });
    setShowNetworkMenu(false);
  };

  const handleConfigureRPC = async () => {
    setIsConfiguringRPC(true);
    try {
      const success = await addSepoliaWithAlchemy();
      if (success) {
        alert('✅ MetaMask configured with Alchemy RPC! Please refresh the page.');
        setShowRPCHelper(false);
      } else {
        alert('❌ Failed to configure MetaMask. Please add the network manually.');
      }
    } catch (error) {
      console.error('Error configuring RPC:', error);
      alert('❌ Error configuring MetaMask. Please try again or add manually.');
    } finally {
      setIsConfiguringRPC(false);
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const getNetworkColor = (chainId: number) => {
    switch (chainId) {
      case 11155111: return 'bg-purple-500'; // Sepolia
      default: return 'bg-gray-500';
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="px-6 py-2.5 bg-white text-gray-900 rounded-full font-semibold text-sm hover:bg-gray-100 transition-all shadow-md hover:shadow-lg hover:scale-105"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* RPC Configuration Helper */}
      {showRPCHelper && isConnected && (
        <div className="fixed bottom-4 right-4 bg-yellow-900/90 border border-yellow-600 rounded-lg p-4 max-w-md shadow-2xl z-50">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚡</div>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-200 mb-1">Optimize Your Connection</h3>
              <p className="text-sm text-yellow-100 mb-3">
                Configure MetaMask with Alchemy RPC for faster, more reliable transactions and avoid circuit breaker errors.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfigureRPC}
                  disabled={isConfiguringRPC}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg text-sm font-semibold transition-all"
                >
                  {isConfiguringRPC ? '⏳ Configuring...' : '🚀 Auto-Configure'}
                </button>
                <button
                  onClick={() => setShowRPCHelper(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowRPCHelper(false)}
              className="text-yellow-200 hover:text-yellow-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Network Selector */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowNetworkMenu(!showNetworkMenu);
            setShowDropdown(false);
          }}
          className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-700/30 transition-all text-sm"
        >
          <div className={`w-2 h-2 rounded-full ${getNetworkColor(chain?.id || 0)}`} />
          <span className="text-xs font-medium text-gray-300">{chain?.name || 'Unknown'}</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Network Dropdown */}
        {showNetworkMenu && (
          <div className="absolute top-full mt-2 right-0 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl min-w-[200px] z-50">
            <div className="p-2">
              <div className="text-xs text-gray-400 px-3 py-2 font-semibold">Select Network</div>
              {SUPPORTED_CHAINS.map((supportedChain) => (
                <button
                  key={supportedChain.id}
                  onClick={() => handleSwitchNetwork(supportedChain.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-all text-sm ${
                    chain?.id === supportedChain.id ? 'bg-gray-800/50' : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${getNetworkColor(supportedChain.id)}`} />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{supportedChain.name}</div>
                    <div className="text-xs text-gray-400">Chain ID: {supportedChain.id}</div>
                  </div>
                  {chain?.id === supportedChain.id && (
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Wallet Info & Dropdown */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown(!showDropdown);
            setShowNetworkMenu(false);
          }}
          className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-700/30 transition-all"
        >
          {/* Balance */}
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-white">
              {balance ? `${Number(balance.formatted).toFixed(3)} ${balance.symbol}` : '0.000 ETH'}
            </div>
          </div>
          
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {address ? address.substring(2, 4).toUpperCase() : '??'}
            </span>
          </div>

          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Wallet Dropdown */}
        {showDropdown && (
          <div className="absolute top-full mt-2 right-0 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl min-w-[280px] z-50">
            <div className="p-4 border-b border-gray-700/50">
              <div className="text-xs text-gray-400 mb-2">Wallet Address</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/30 font-mono text-gray-300">
                  {address}
                </code>
                <button
                  onClick={handleCopyAddress}
                  className="p-2 hover:bg-gray-700 rounded transition-all"
                  title="Copy address"
                >
                  {copied ? (
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              {copied && (
                <div className="text-xs text-green-400 mt-2">✓ Copied to clipboard!</div>
              )}
            </div>

            <div className="p-4 border-b border-gray-700/50">
              <div className="text-xs text-gray-400 mb-2">Balance</div>
              <div className="text-2xl font-bold text-white">
                {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 ETH'}
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
