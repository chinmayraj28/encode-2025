# 🔐 Openfort Integration Guide

## What is Openfort?

**Openfort** is a platform that provides:
- 🎯 **Embedded Wallets** - Users don't need MetaMask
- ⛽ **Gasless Transactions** - You sponsor gas fees for better UX
- 🔑 **Smart Accounts** - Account abstraction (ERC-4337)
- 🎮 **Gaming-Ready** - Perfect for NFT marketplaces
- 📱 **Social Login** - Google, Twitter, Email authentication

## Why Add Openfort to Your Marketplace?

### Current Flow (MetaMask):
```
User needs MetaMask → Install extension → Create wallet → Buy crypto → Connect → Sign transactions
```
**Problem**: 5+ steps before they can even browse!

### With Openfort:
```
User clicks "Login with Google" → Done!
```
**Benefit**: Instant access, you cover gas fees!

---

## 🏗️ Architecture

### Current Setup:
```
Your App ↔ RainbowKit ↔ Wagmi ↔ MetaMask ↔ Hardhat/Blockchain
```

### With Openfort:
```
Your App ↔ Openfort SDK ↔ Smart Wallet ↔ Hardhat/Blockchain
           ↕
    RainbowKit (optional, for power users)
```

**Strategy**: Keep both! 
- Openfort for beginners (gasless, easy)
- MetaMask for crypto users (they pay their own gas)

---

## 📋 Prerequisites

1. **Openfort Account**: Sign up at [openfort.xyz](https://www.openfort.xyz/)
2. **API Keys**: Get your publishable and secret keys
3. **Smart Account Setup**: Configure account abstraction
4. **Paymaster**: Fund your paymaster for gas sponsorship

---

## 🚀 Step-by-Step Integration

### Step 1: Install Openfort SDK

```bash
npm install @openfort/openfort-js @openfort/openfort-node
# or
yarn add @openfort/openfort-js @openfort/openfort-node
```

### Step 2: Environment Variables

Add to `.env.local`:

```bash
# Openfort Configuration
NEXT_PUBLIC_OPENFORT_PUBLIC_KEY=pk_test_xxxxx
OPENFORT_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_OPENFORT_SHIELD_PUBLISHABLE_KEY=shield_pk_test_xxxxx
NEXT_PUBLIC_OPENFORT_SHIELD_ENCRYPTION_SHARE=xxxxx

# Existing variables
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PINATA_JWT=...
```

### Step 3: Create Openfort Configuration

Create `config/openfort.ts`:

```typescript
import Openfort from '@openfort/openfort-js';

export const openfort = new Openfort({
  baseConfiguration: {
    publishableKey: process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!,
    shieldPublishableKey: process.env.NEXT_PUBLIC_OPENFORT_SHIELD_PUBLISHABLE_KEY!,
    shieldEncryptionShare: process.env.NEXT_PUBLIC_OPENFORT_SHIELD_ENCRYPTION_SHARE!,
  }
});

// Chain configuration (Hardhat local)
export const SUPPORTED_CHAINS = {
  hardhat: {
    id: 31337,
    name: 'Hardhat',
    rpcUrl: 'http://127.0.0.1:8545',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  // Add more chains as needed
  arbitrumSepolia: {
    id: 421614,
    name: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

export const DEFAULT_CHAIN = SUPPORTED_CHAINS.hardhat;
```

### Step 4: Create Openfort Provider

Create `app/OpenfortProvider.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { openfort } from '@/config/openfort';

interface OpenfortContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  address: string | null;
  login: (provider: 'google' | 'twitter' | 'email', email?: string) => Promise<void>;
  logout: () => Promise<void>;
  sendTransaction: (tx: any) => Promise<string>;
}

const OpenfortContext = createContext<OpenfortContextType | undefined>(undefined);

export function OpenfortProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await openfort.getSession();
      if (session) {
        setIsAuthenticated(true);
        const user = await openfort.getUser();
        setAddress(user.address);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (provider: 'google' | 'twitter' | 'email', email?: string) => {
    try {
      setIsLoading(true);
      
      let result;
      if (provider === 'email' && email) {
        result = await openfort.authenticateWithEmailPassword({ email, password: '' });
      } else {
        result = await openfort.authenticateWithOAuth({ provider });
      }

      if (result.player) {
        setIsAuthenticated(true);
        setAddress(result.player.address);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await openfort.logout();
      setIsAuthenticated(false);
      setAddress(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const sendTransaction = async (tx: any): Promise<string> => {
    try {
      const response = await openfort.sendTransaction({
        ...tx,
        chainId: DEFAULT_CHAIN.id,
      });
      return response.hash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  return (
    <OpenfortContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        address,
        login,
        logout,
        sendTransaction,
      }}
    >
      {children}
    </OpenfortContext.Provider>
  );
}

export function useOpenfort() {
  const context = useContext(OpenfortContext);
  if (!context) {
    throw new Error('useOpenfort must be used within OpenfortProvider');
  }
  return context;
}
```

### Step 5: Update Root Layout

Update `app/layout.tsx`:

```typescript
import { Providers } from './providers';
import { OpenfortProvider } from './OpenfortProvider';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <OpenfortProvider>
            {children}
          </OpenfortProvider>
        </Providers>
      </body>
    </html>
  );
}
```

### Step 6: Create Login Component

Create `components/OpenfortLogin.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useOpenfort } from '@/app/OpenfortProvider';

export default function OpenfortLogin() {
  const { login, isLoading } = useOpenfort();
  const [email, setEmail] = useState('');
  const [loginMethod, setLoginMethod] = useState<'social' | 'email'>('social');

  const handleSocialLogin = async (provider: 'google' | 'twitter') => {
    try {
      await login(provider);
    } catch (error) {
      console.error('Social login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await login('email', email);
    } catch (error) {
      console.error('Email login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🚀 Login to Start Trading
      </h2>

      <div className="mb-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setLoginMethod('social')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              loginMethod === 'social'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Social Login
          </button>
          <button
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              loginMethod === 'email'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Email
          </button>
        </div>

        {loginMethod === 'social' ? (
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>🔵</span> Continue with Google
            </button>
            <button
              onClick={() => handleSocialLogin('twitter')}
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>🐦</span> Continue with Twitter
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Continue with Email'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-sm text-gray-400 text-center mb-3">
          ⚡ No wallet needed • ⛽ Gas fees covered • 🔒 Secure
        </p>
      </div>
    </div>
  );
}
```

### Step 7: Update Home Page

Update `app/page.tsx` to show login options:

```typescript
'use client';

import { useAccount } from 'wagmi';
import { useOpenfort } from './OpenfortProvider';
import OpenfortLogin from '@/components/OpenfortLogin';
import UploadForm from '@/components/UploadForm';
import AssetGallery from '@/components/AssetGallery';

export default function Home() {
  const { isConnected: isMetaMaskConnected } = useAccount();
  const { isAuthenticated: isOpenfortConnected, address: openfortAddress } = useOpenfort();

  const isConnected = isMetaMaskConnected || isOpenfortConnected;
  const userAddress = openfortAddress || undefined;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* ...existing header code... */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isConnected ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">
                Choose Your Login Method
              </h2>
              <p className="text-gray-300 mb-8">
                Use Openfort for easy social login or MetaMask for crypto wallets
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Openfort Login */}
              <div>
                <OpenfortLogin />
              </div>

              {/* MetaMask Login */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  🦊 Connect Wallet
                </h2>
                <p className="text-gray-300 text-center mb-6">
                  For experienced crypto users
                </p>
                {/* Your existing RainbowKit button */}
              </div>
            </div>
          </div>
        ) : (
          <>
            <UploadForm />
            <AssetGallery />
          </>
        )}
      </div>
    </main>
  );
}
```

### Step 8: Update Upload Form for Openfort

Update `components/UploadForm.tsx` to support both wallet types:

```typescript
'use client';

import { useAccount, useWriteContract } from 'wagmi';
import { useOpenfort } from '@/app/OpenfortProvider';

export default function UploadForm() {
  // MetaMask
  const { address: metamaskAddress, isConnected: isMetaMaskConnected } = useAccount();
  const { writeContract } = useWriteContract();

  // Openfort
  const { 
    address: openfortAddress, 
    isAuthenticated: isOpenfortConnected,
    sendTransaction 
  } = useOpenfort();

  const address = metamaskAddress || openfortAddress;
  const isConnected = isMetaMaskConnected || isOpenfortConnected;

  const handleMint = async () => {
    // ... prepare transaction data ...

    if (isMetaMaskConnected) {
      // Use wagmi for MetaMask
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'mintMediaAsset',
        args: [/* ... */],
      });
    } else if (isOpenfortConnected) {
      // Use Openfort (gasless!)
      await sendTransaction({
        to: CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: CONTRACT_ABI,
          functionName: 'mintMediaAsset',
          args: [/* ... */],
        }),
      });
    }
  };

  // ... rest of component ...
}
```

---

## 🎮 Backend Setup (Paymaster)

### Create API Route for Sponsoring Gas

Create `app/api/openfort/sponsor/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Openfort from '@openfort/openfort-node';

const openfort = new Openfort({
  apiKey: process.env.OPENFORT_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { transactionHash } = await req.json();

    // Sponsor the transaction
    const sponsorship = await openfort.transactions.sponsor({
      transactionHash,
      policy: 'pol_xxxxxx', // Your gas policy ID
    });

    return NextResponse.json({ success: true, sponsorship });
  } catch (error: any) {
    console.error('Sponsorship failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 🔧 Openfort Dashboard Setup

### 1. Create a Project
- Go to [dashboard.openfort.xyz](https://dashboard.openfort.xyz)
- Create new project: "NFT Marketplace"

### 2. Configure Chains
- Add Hardhat (chainId: 31337)
- Add any testnets you want to support

### 3. Create Gas Policy
- Navigate to "Policies"
- Create new sponsorship policy
- Set rules (e.g., max $1 per transaction)
- Fund the paymaster

### 4. Set Up Authentication
- Enable Google OAuth
- Enable Twitter OAuth
- Configure redirect URLs

### 5. Deploy Smart Accounts
- Choose account implementation (SimpleAccount or your own)
- Deploy account factory

---

## 💰 Cost Analysis

### Openfort Pricing:
- **Free Tier**: 100 monthly active users
- **Starter**: $99/month for 1,000 MAU
- **Growth**: Custom pricing

### Gas Sponsorship:
- **You pay**: Gas for user transactions
- **Typical cost**: $0.01 - $0.10 per transaction
- **Budget**: Set max gas budget per user/day

### ROI:
```
Without Openfort:
- 100 visitors → 5 signups (5% conversion)
- High friction, users need crypto

With Openfort:
- 100 visitors → 50 signups (50% conversion)
- No friction, instant access
```

**10x more users = Worth the gas costs!**

---

## 🎯 User Experience Comparison

### MetaMask Flow (Current):
```
1. User clicks "Connect Wallet" → Must have MetaMask installed
2. Create wallet → Save seed phrase (scary!)
3. Buy crypto → Go to exchange, KYC, wait days
4. Connect to your site → Sign transaction
5. Finally upload/purchase → Pay gas fees
```
**Time**: 2-7 days | **Success Rate**: ~5%

### Openfort Flow (New):
```
1. User clicks "Login with Google" → Instant
2. Upload/Purchase → You pay gas
3. Done!
```
**Time**: 10 seconds | **Success Rate**: ~50%

---

## 🚨 Important Considerations

### Security:
- ✅ Users get non-custodial wallets
- ✅ You never hold private keys
- ✅ Shield encryption protects keys
- ⚠️ You sponsor gas (set limits!)

### Hybrid Approach (Recommended):
```typescript
// Show both options
<div>
  <OpenfortLogin /> {/* For new users */}
  <MetaMaskConnect /> {/* For crypto users */}
</div>
```

### Gas Budget:
- Set per-user daily limits
- Set per-transaction max gas
- Monitor spending in dashboard

---

## 📊 Analytics & Monitoring

### Track in Openfort Dashboard:
- Active users
- Transactions sponsored
- Gas spent
- Authentication methods
- User retention

### Add to Your App:
```typescript
// Track conversions
useEffect(() => {
  if (isOpenfortConnected) {
    analytics.track('Openfort_Login_Success');
  }
}, [isOpenfortConnected]);
```

---

## 🧪 Testing

### Local Testing:
```bash
# 1. Start Hardhat
npx hardhat node

# 2. Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# 3. Update Openfort dashboard with local chain
# 4. Test with development API keys
```

### Test Checklist:
- [ ] Social login (Google, Twitter)
- [ ] Email login
- [ ] Gasless transactions
- [ ] MetaMask still works
- [ ] Switch between accounts
- [ ] Upload assets
- [ ] Purchase assets
- [ ] Download decrypted files

---

## 🔄 Migration Strategy

### Phase 1: Parallel Run (Weeks 1-2)
- Deploy Openfort alongside MetaMask
- 50% users see Openfort option
- Monitor metrics

### Phase 2: Promote Openfort (Weeks 3-4)
- Make Openfort default
- MetaMask as "Advanced" option
- Track conversion rates

### Phase 3: Optimize (Month 2+)
- Adjust gas policies
- Optimize user flows
- Scale based on usage

---

## 🎉 Benefits Summary

### For Users:
- ✅ No wallet installation needed
- ✅ Login with Google/Twitter/Email
- ✅ No gas fees
- ✅ Instant access
- ✅ Familiar web2 UX

### For You (Developer):
- ✅ 10x more signups
- ✅ Better conversion rates
- ✅ Happier users
- ✅ Competitive advantage
- ✅ Still support MetaMask users

### For Your Business:
- 💰 More users = More revenue
- 📈 Lower acquisition cost
- 🎯 Reach non-crypto audience
- 🚀 Faster growth

---

## 📚 Additional Resources

- [Openfort Documentation](https://docs.openfort.xyz)
- [Openfort Dashboard](https://dashboard.openfort.xyz)
- [GitHub Examples](https://github.com/openfort-xyz/examples)
- [Discord Community](https://discord.gg/openfort)

---

## 🤝 Support

Need help with integration?
- Read the [docs](https://docs.openfort.xyz)
- Join [Discord](https://discord.gg/openfort)
- Email: support@openfort.xyz

---

## 🎯 Next Steps

1. ✅ Sign up for Openfort account
2. ✅ Get API keys
3. ✅ Install SDK packages
4. ✅ Implement login component
5. ✅ Update transaction flows
6. ✅ Set up gas policies
7. ✅ Test thoroughly
8. ✅ Deploy and monitor!

**Remember**: Start small, test with limited users, then scale up! 🚀
