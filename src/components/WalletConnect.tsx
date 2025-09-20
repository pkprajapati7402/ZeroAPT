'use client';

import { useState } from 'react';
import { useWallet } from './WalletProvider';

const getWalletIcon = (walletName: string) => {
  switch (walletName.toLowerCase()) {
    case 'petra': return '🪨';
    case 'martian': return '👽';
    case 'pontem': return '🌊';
    default: return '💼';
  }
};

export default function WalletConnect() {
  const { connected, account, connect, disconnect, wallet, wallets } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  if (connected && account && wallet) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
        <div className="relative bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">
                {getWalletIcon(wallet.name)}
              </div>
              <div>
                <div className="text-green-400 font-semibold text-lg">
                  {wallet.name} Connected
                </div>
                <div className="text-gray-300 text-sm font-mono">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </div>
              </div>
            </div>
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl transition-all duration-200 text-sm font-medium"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
        <div className="relative bg-black/40 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6 hover:border-violet-400/40 transition-all duration-300">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center space-x-3 py-3 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-violet-500/25 transition-all duration-300 transform hover:scale-105"
          >
            <span className="text-xl">💼</span>
            <span>Connect Wallet</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="relative z-10 w-full max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-purple-600/30 rounded-3xl blur-xl"></div>
              <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Connect Wallet</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-3">
                  {wallets
                    .filter((w) => w.installed)
                    .map((w) => (
                      <button
                        key={w.name}
                        onClick={() => handleConnect(w.name)}
                        className="w-full flex items-center space-x-4 p-4 bg-gray-900/30 hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 rounded-xl transition-all duration-200"
                      >
                        <div className="text-2xl">
                          {getWalletIcon(w.name)}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-semibold">{w.name}</div>
                          <div className="text-gray-400 text-sm">Ready to connect</div>
                        </div>
                        <div className="text-gray-400">→</div>
                      </button>
                    ))}

                  {wallets
                    .filter((w) => !w.installed)
                    .map((w) => (
                      <div
                        key={w.name}
                        className="w-full flex items-center space-x-4 p-4 bg-gray-900/10 border border-gray-700/30 rounded-xl opacity-50"
                      >
                        <div className="text-2xl grayscale">
                          {getWalletIcon(w.name)}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-gray-400 font-semibold">{w.name}</div>
                          <div className="text-gray-500 text-sm">Not installed</div>
                        </div>
                        <button
                          onClick={() => window.open(`https://chrome.google.com/webstore/search/${w.name.toLowerCase()}`, '_blank')}
                          className="text-xs text-violet-400 hover:text-violet-300 px-3 py-1 border border-violet-500/30 rounded-lg transition-colors"
                        >
                          Install
                        </button>
                      </div>
                    ))}
                </div>

                {wallets.filter(w => w.installed).length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">No wallets detected</div>
                    <p className="text-gray-500 text-sm">
                      Please install a supported Aptos wallet extension
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}