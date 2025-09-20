'use client';

import React, { useState, useCallback } from 'react';
import { useWallet } from '@/components/WalletProvider';
import Header from '@/components/Header';
import WalletConnect from '@/components/WalletConnect';
import ActionCard from '@/components/ActionCard';
import TransactionStatus, { type TransactionUpdate } from '@/components/TransactionStatus';
import { 
  createIntentPayload, 
  serializePayload, 
  generateNonce 
} from '@/lib/signature';

export default function HomePage() {
  const { 
    connected, 
    account, 
    signMessage,
    wallet
  } = useWallet();
  
  const [userAddress, setUserAddress] = useState('');
  const [transactionUpdates, setTransactionUpdates] = useState<TransactionUpdate[]>([]);
  const [gasSaved, setGasSaved] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);

  const handleWalletChange = useCallback((isConnected: boolean, address?: string) => {
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

  // Real wallet signing function
  const signMessageWithWallet = async (message: string): Promise<{signature: string, publicKey: string}> => {
    if (!connected || !account || !signMessage) {
      throw new Error('Wallet not connected or does not support message signing');
    }

    try {
      const response = await signMessage({
        message,
      });

      return {
        signature: response.signature,
        publicKey: account.address // Use address as placeholder for publicKey
      };
    } catch (error) {
      console.error('Wallet signing error:', error);
      throw new Error('Failed to sign message with wallet');
    }
  };

  const executeGaslessTransaction = async (action: string, params: any) => {
    if (!connected || !account) {
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
      const payload = createIntentPayload(action, params, account.address.toString(), nonce);
      const serializedPayload = serializePayload(payload);

      // Step 2: Sign the intent with real wallet
      addTransactionUpdate({
        status: 'signing',
        message: `Signing transaction intent with wallet...`
      });

      const signResult = await signMessageWithWallet(serializedPayload);

      addTransactionUpdate({
        status: 'submitting',
        message: 'Submitting to relayer...'
      });

      // Step 3: Submit to relayer
      const response = await fetch('/api/relay-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload,
          signature: signResult.signature,
          publicKey: signResult.publicKey
        })
      });

      const responseData = await response.json();

      if (responseData.success) {
        addTransactionUpdate({
          status: 'success',
          message: 'Transaction completed successfully!',
          hash: responseData.transactionHash,
          explorerUrl: responseData.explorerUrl
        });

        // Update counters
        setTransactionCount(prev => prev + 1);
        setGasSaved(prev => prev + 0.001); // Approximate gas saved
      } else {
        throw new Error(responseData.error || 'Transaction failed');
      }

    } catch (error: any) {
      console.error('Transaction error:', error);
      addTransactionUpdate({
        status: 'error',
        message: error.message || 'Transaction failed'
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Futuristic Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-black to-cyan-950/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-cyan-600/10"></div>
      
      {/* Animated Grid Pattern */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"></div>
      </div>
      
      <Header />
      
      <main className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-6">
            <div className="w-2 h-2 bg-violet-400 rounded-full mr-2 animate-pulse"></div>
            Gasless Transaction Layer Active
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent mb-4">
            Zero Gas. Maximum Impact.
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience the future of blockchain interactions with intent-based gasless transactions
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column - Wallet & Stats */}
          <div className="xl:col-span-3 space-y-6">
            <WalletConnect />
            
            {/* Enhanced Stats Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-violet-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Performance</h3>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-5">
                  <div className="group/stat">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200">
                      <span className="text-gray-300 flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        Gas Fees Paid
                      </span>
                      <span className="text-green-400 font-bold text-lg">0 APT</span>
                    </div>
                  </div>
                  
                  <div className="group/stat">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200">
                      <span className="text-gray-300 flex items-center">
                        <div className="w-2 h-2 bg-violet-400 rounded-full mr-3"></div>
                        Gas Saved
                      </span>
                      <span className="text-violet-400 font-bold text-lg">
                        ~{gasSaved.toFixed(3)} APT
                      </span>
                    </div>
                  </div>
                  
                  <div className="group/stat">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200">
                      <span className="text-gray-300 flex items-center">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                        Transactions
                      </span>
                      <span className="text-cyan-400 font-bold text-lg">{transactionCount}</span>
                    </div>
                  </div>
                  
                  <div className="group/stat">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200">
                      <span className="text-gray-300 flex items-center">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                        Free Remaining
                      </span>
                      <span className="text-yellow-400 font-bold text-lg">{Math.max(0, 3 - transactionCount)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse"></div>
                    <span>Powered by Intent Layer</span>
                    <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Center Column - Action Cards */}
          <div className="xl:col-span-6 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                Gasless Operations
              </h2>
              <p className="text-gray-400">Execute blockchain transactions without holding gas tokens</p>
            </div>
            
            <div className="grid gap-6">
              {actionCards.map((card, index) => (
                <div key={card.action} 
                     className="opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                     style={{animationDelay: `${index * 150}ms`}}>
                  <ActionCard
                    {...card}
                    onExecute={executeGaslessTransaction}
                    disabled={!connected || transactionCount >= 3}
                  />
                </div>
              ))}
            </div>
            
            {transactionCount >= 3 && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-amber-900/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <span className="text-amber-400 text-lg">⚠️</span>
                    </div>
                    <div>
                      <h4 className="text-amber-200 font-semibold mb-2">Transaction Limit Reached</h4>
                      <p className="text-amber-100/80 text-sm leading-relaxed">
                        You've used all 3 free transactions in this demo session. 
                        <br />Contact us to increase your limit or reset your session.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Transaction Status */}
          <div className="xl:col-span-3">
            <TransactionStatus 
              updates={transactionUpdates}
              onClear={clearTransactionUpdates}
            />
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience seamless blockchain interactions through our intent-based architecture
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                step: "01",
                title: "Sign Intent",
                description: "Create and sign a transaction intent with your wallet - no gas required",
                icon: "✍️",
                color: "from-violet-600 to-purple-600"
              },
              {
                step: "02", 
                title: "Relayer Processing",
                description: "Our secure relayer validates and processes your intent on the blockchain",
                icon: "⚡",
                color: "from-cyan-600 to-blue-600"
              },
              {
                step: "03",
                title: "Zero Gas Execution", 
                description: "Transaction executes successfully without you paying any gas fees",
                icon: "🎯",
                color: "from-emerald-600 to-green-600"
              }
            ].map((item, index) => (
              <div key={index} 
                   className="group relative opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]"
                   style={{animationDelay: `${index * 200 + 300}ms`}}>
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 rounded-2xl"
                     style={{background: `linear-gradient(135deg, ${item.color.split(' ')[1]}, ${item.color.split(' ')[3]})`}}></div>
                
                <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 text-center">
                  <div className="mb-6">
                    <div className={`inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} items-center justify-center text-2xl mb-4 shadow-lg`}>
                      {item.icon}
                    </div>
                    <div className="text-xs font-mono text-gray-500 mb-2">{item.step}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Demo Information Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <span className="text-blue-400 text-2xl">💡</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-white mb-4">Production Ready</h4>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    You're using a fully functional gasless transaction system on Aptos Testnet. 
                    Connect your real wallet to experience blockchain interactions without gas fees.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-white font-semibold mb-3 flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        Live Features
                      </h5>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-center">
                          <div className="w-1 h-1 bg-gray-600 rounded-full mr-3"></div>
                          Real Aptos wallet integration
                        </li>
                        <li className="flex items-center">
                          <div className="w-1 h-1 bg-gray-600 rounded-full mr-3"></div>
                          Actual transaction signing
                        </li>
                        <li className="flex items-center">
                          <div className="w-1 h-1 bg-gray-600 rounded-full mr-3"></div>
                          Intent-based gasless execution
                        </li>
                        <li className="flex items-center">
                          <div className="w-1 h-1 bg-gray-600 rounded-full mr-3"></div>
                          Real-time blockchain interaction
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-white font-semibold mb-3 flex items-center">
                        <div className="w-2 h-2 bg-violet-400 rounded-full mr-3"></div>
                        Supported Wallets
                      </h5>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-center">
                          <div className="w-1 h-1 bg-gray-600 rounded-full mr-3"></div>
                          Petra Wallet 🪨
                        </li>
                        <li className="flex items-center">
                          <div className="w-1 h-1 bg-gray-600 rounded-full mr-3"></div>
                          Martian Wallet 👽
                        </li>
                        <li className="flex items-center">
                          <div className="w-1 h-1 bg-gray-600 rounded-full mr-3"></div>
                          Pontem Wallet 🌊
                        </li>
                        <li className="flex items-center">
                          <div className="w-1 h-1 bg-gray-600 rounded-full mr-3"></div>
                          And more Aptos wallets
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}