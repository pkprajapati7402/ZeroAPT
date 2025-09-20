'use client';

import React from 'react';

interface WalletProviderProps {
  children: React.ReactNode;
}

// Simple provider wrapper for demo purposes
// In production, this would use actual Aptos wallet adapters
const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <div className="wallet-provider">
      {children}
    </div>
  );
};

export default WalletProvider;