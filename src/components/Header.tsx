'use client';

import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 shadow-2xl border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Gasless Wallet Layer
              </h1>
              <p className="text-purple-200 text-sm">
                Aptos POC - Zero Gas Fee Transactions
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-green-400 font-semibold">TESTNET</div>
                <div className="text-purple-200">Aptos Network</div>
              </div>
              <div className="w-px h-8 bg-purple-500/30"></div>
              <div className="text-center">
                <div className="text-blue-400 font-semibold">ACTIVE</div>
                <div className="text-purple-200">Relayer Status</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-purple-200 text-xs">Connected to Aptos Testnet</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;