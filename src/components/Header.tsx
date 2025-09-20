'use client';

import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="relative">
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl border-b border-white/10"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          {/* Logo and branding */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-75"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">⚡</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                ZeroAPT Protocol
              </h1>
              <p className="text-gray-400 text-sm font-medium">
                Intent-Based Gasless Transactions
              </p>
            </div>
          </div>
          
          {/* Status indicators */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              <div className="text-center group">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 font-semibold text-sm">TESTNET</span>
                </div>
                <div className="text-gray-400 text-xs">Aptos Network</div>
              </div>
              
              <div className="w-px h-10 bg-gray-600/50"></div>
              
              <div className="text-center group">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-400 font-semibold text-sm">ONLINE</span>
                </div>
                <div className="text-gray-400 text-xs">Relayer Status</div>
              </div>
              
              <div className="w-px h-10 bg-gray-600/50"></div>
              
              <div className="text-center group">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                  <span className="text-violet-400 font-semibold text-sm">v1.0.0</span>
                </div>
                <div className="text-gray-400 text-xs">Protocol</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Connection status bar */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-300 text-xs font-medium">Connected to Aptos Testnet</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full">
              <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
              <span className="text-violet-300 text-xs font-medium">Intent Layer Active</span>
            </div>
          </div>
          
          <div className="hidden md:block text-xs text-gray-500">
            Gas-free blockchain interactions powered by intent signatures
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;