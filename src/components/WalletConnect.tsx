'use client';

import React, { useState } from 'react';

interface WalletConnectProps {
  onWalletChange?: (connected: boolean, address?: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletChange }) => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Simulate wallet connection for demo purposes
      // In a real implementation, this would use Petra or Martian wallet APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoAddress = '0x1234567890abcdef1234567890abcdef12345678';
      setConnected(true);
      setAddress(demoAddress);
      onWalletChange?.(true, demoAddress);
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setAddress('');
    onWalletChange?.(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (connected && address) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <div className="text-white font-semibold">
                Demo Wallet Connected
              </div>
              <div className="text-gray-400 text-sm font-mono">
                {formatAddress(address)}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="px-3 py-1 text-xs bg-red-900/50 hover:bg-red-900/70 text-red-200 border border-red-500/30 rounded-lg transition-colors"
          >
            Disconnect
          </button>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Gas Fees Paid:</span>
            <span className="text-green-400 font-semibold">0 APT</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-400">Transactions:</span>
            <span className="text-blue-400 font-semibold">Gasless ⚡</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-400 text-sm">
          Connect to start using gasless transactions (Demo Mode)
        </p>
      </div>
      
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className={`
          w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200
          ${isConnecting
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25'
          }
        `}
      >
        {isConnecting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          'Connect Demo Wallet'
        )}
      </button>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Demo mode - simulates Petra/Martian wallet connection</p>
      </div>
    </div>
  );
};

export default WalletConnect;