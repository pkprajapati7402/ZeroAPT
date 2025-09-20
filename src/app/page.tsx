'use client';

import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import WalletConnect from '@/components/WalletConnect';
import ActionCard from '@/components/ActionCard';
import TransactionStatus, { type TransactionUpdate } from '@/components/TransactionStatus';
import { 
  createIntentPayload, 
  serializePayload, 
  generateNonce 
} from '@/lib/signature';
import axios from 'axios';

export default function HomePage() {
  const [connected, setConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [transactionUpdates, setTransactionUpdates] = useState<TransactionUpdate[]>([]);
  const [gasSaved, setGasSaved] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);

  const handleWalletChange = useCallback((isConnected: boolean, address?: string) => {
    setConnected(isConnected);
    setUserAddress(address || '');
  }, []);

  const addTransactionUpdate = useCallback((update: TransactionUpdate) => {
    setTransactionUpdates(prev => [
      ...prev.slice(-4), // Keep last 4 updates
      { ...update, timestamp: Date.now() }
    ]);
  }, []);

  const clearTransactionUpdates = useCallback(() => {
    setTransactionUpdates([]);
  }, []);

  // Mock signing function for demo
  const mockSignMessage = async (message: string): Promise<{signature: string, publicKey: string}> => {
    // In a real implementation, this would use the wallet's signMessage function
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      signature: '0x' + Array.from({length: 128}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      publicKey: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
  };

  const executeGaslessTransaction = async (action: string, params: any) => {
    if (!connected || !userAddress) {
      addTransactionUpdate({
        status: 'error',
        message: 'Please connect your wallet first'
      });
      return;
    }

    try {
      // Step 1: Create intent payload
      addTransactionUpdate({
        status: 'signing',
        message: 'Creating transaction intent...'
      });

      const nonce = generateNonce();
      const payload = createIntentPayload(action, params, userAddress, nonce);
      const serializedPayload = serializePayload(payload);

      // Step 2: Sign the intent (demo mode)
      addTransactionUpdate({
        status: 'signing',
        message: 'Signing transaction intent...'
      });

      const signResult = await mockSignMessage(serializedPayload);

      addTransactionUpdate({
        status: 'submitting',
        message: 'Submitting to relayer...'
      });

      // Step 3: Submit to relayer
      const response = await axios.post('/api/relay-intent', {
        payload,
        signature: signResult.signature,
        publicKey: signResult.publicKey
      });

      if (response.data.success) {
        addTransactionUpdate({
          status: 'success',
          message: 'Transaction completed successfully!',
          hash: response.data.transactionHash,
          explorerUrl: response.data.explorerUrl
        });

        // Update counters
        setTransactionCount(prev => prev + 1);
        setGasSaved(prev => prev + 0.001); // Approximate gas saved
      } else {
        throw new Error(response.data.error || 'Transaction failed');
      }

    } catch (error: any) {
      console.error('Transaction error:', error);
      addTransactionUpdate({
        status: 'error',
        message: error.response?.data?.error || error.message || 'Transaction failed'
      });
    }
  };

  const actionCards = [
    {
      title: "Mint Event Badge NFT",
      description: "Mint a participation badge NFT to your wallet without paying gas fees",
      icon: "🏆",
      action: "mint_badge"
    },
    {
      title: "Vote in Poll", 
      description: "Cast your vote in community polls without gas fees",
      icon: "🗳️",
      action: "cast_vote"
    },
    {
      title: "Transfer Test Token",
      description: "Transfer test tokens to another address gaslessly",
      icon: "💸",
      action: "transfer_token"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column - Wallet & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <WalletConnect onWalletChange={handleWalletChange} />
            
            {/* Stats Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Your Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Gas Fees Paid:</span>
                  <span className="text-green-400 font-bold">0 APT</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Gas Saved:</span>
                  <span className="text-purple-400 font-bold">
                    ~{gasSaved.toFixed(3)} APT
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Transactions:</span>
                  <span className="text-blue-400 font-bold">{transactionCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Free Remaining:</span>
                  <span className="text-yellow-400 font-bold">{Math.max(0, 3 - transactionCount)}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500 text-center">
                  ⚡ Powered by gasless transactions
                </div>
              </div>
            </div>
          </div>
          
          {/* Center Column - Action Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Gasless Actions
              </h2>
              
              <div className="space-y-4">
                {actionCards.map((card, index) => (
                  <div key={card.action} className="animate-fadeInUp animate-delay-100">
                    <ActionCard
                      {...card}
                      onExecute={executeGaslessTransaction}
                      disabled={!connected || transactionCount >= 3}
                    />
                  </div>
                ))}
              </div>
              
              {transactionCount >= 3 && (
                <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">⚠️</span>
                    <span className="text-yellow-200 text-sm">
                      You've reached your free transaction limit (3). 
                      Contact us to increase your limit or wait for the reset.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Transaction Status */}
          <div className="lg:col-span-1">
            <TransactionStatus 
              updates={transactionUpdates}
              onClear={clearTransactionUpdates}
            />
          </div>
        </div>
        
        {/* Demo Information */}
        <div className="mt-12 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-4">
            🎯 How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-2xl mb-3 mx-auto">
                1
              </div>
              <h3 className="font-semibold text-white mb-2">Sign Intent</h3>
              <p className="text-gray-400">
                Sign a transaction intent with your wallet - no gas required
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-2xl mb-3 mx-auto">
                2
              </div>
              <h3 className="font-semibold text-white mb-2">Relayer Submits</h3>
              <p className="text-gray-400">
                Our relayer validates and submits your transaction on-chain
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-2xl mb-3 mx-auto">
                3
              </div>
              <h3 className="font-semibold text-white mb-2">Zero Gas Fees</h3>
              <p className="text-gray-400">
                Enjoy full functionality without holding APT for gas fees
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
            <div className="flex items-start space-x-3">
              <span className="text-blue-400 text-xl">ℹ️</span>
              <div>
                <h4 className="text-blue-200 font-semibold mb-2">Demo Mode Active</h4>
                <p className="text-blue-100 text-sm">
                  This is a proof-of-concept demonstration. In production, you would:
                </p>
                <ul className="text-blue-100 text-xs mt-2 space-y-1">
                  <li>• Connect real Aptos wallets (Petra, Martian)</li>
                  <li>• Deploy smart contracts to Aptos mainnet</li>
                  <li>• Use funded relayer accounts for gas payments</li>
                  <li>• Implement proper signature verification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}