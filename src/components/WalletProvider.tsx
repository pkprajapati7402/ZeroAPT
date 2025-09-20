'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface WalletContextType {
  connected: boolean;
  account: { address: string } | null;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => void;
  signMessage: (message: { message: string }) => Promise<{ signature: string; fullMessage: string }>;
  wallet: { name: string } | null;
  wallets: { name: string; installed: boolean }[];
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<{ address: string } | null>(null);
  const [wallet, setWallet] = useState<{ name: string } | null>(null);

  // Simulate available wallets
  const wallets = [
    { name: 'Petra', installed: typeof window !== 'undefined' && 'aptos' in window },
    { name: 'Martian', installed: typeof window !== 'undefined' && 'martian' in window },
    { name: 'Pontem', installed: typeof window !== 'undefined' && 'pontem' in window },
  ];

  const connect = useCallback(async (walletName: string) => {
    try {
      let walletApi: any;
      
      if (typeof window !== 'undefined') {
        switch (walletName) {
          case 'Petra':
            walletApi = (window as any).aptos;
            break;
          case 'Martian':
            walletApi = (window as any).martian;
            break;
          case 'Pontem':
            walletApi = (window as any).pontem;
            break;
        }
      }

      if (walletApi) {
        const response = await walletApi.connect();
        setConnected(true);
        setAccount({ address: response.address });
        setWallet({ name: walletName });
      } else {
        // Fallback for demo
        const demoAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
        setConnected(true);
        setAccount({ address: demoAddress });
        setWallet({ name: walletName });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAccount(null);
    setWallet(null);
  }, []);

  const signMessage = useCallback(async (message: { message: string }) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      let walletApi: any;
      
      if (typeof window !== 'undefined') {
        switch (wallet.name) {
          case 'Petra':
            walletApi = (window as any).aptos;
            break;
          case 'Martian':
            walletApi = (window as any).martian;
            break;
          case 'Pontem':
            walletApi = (window as any).pontem;
            break;
        }
      }

      if (walletApi && walletApi.signMessage) {
        const result = await walletApi.signMessage(message);
        return {
          signature: result.signature,
          fullMessage: result.fullMessage || message.message
        };
      } else {
        // Fallback demo signature
        const demoSignature = `0x${Math.random().toString(16).substr(2, 128)}`;
        return {
          signature: demoSignature,
          fullMessage: message.message
        };
      }
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }, [connected, wallet]);

  return (
    <WalletContext.Provider value={{
      connected,
      account,
      connect,
      disconnect,
      signMessage,
      wallet,
      wallets
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}