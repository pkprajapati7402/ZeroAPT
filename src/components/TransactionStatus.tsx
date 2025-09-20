'use client';

import React from 'react';

export interface TransactionUpdate {
  status: 'idle' | 'signing' | 'submitting' | 'success' | 'error';
  message: string;
  hash?: string;
  explorerUrl?: string;
  timestamp?: number;
}

interface TransactionStatusProps {
  updates: TransactionUpdate[];
  onClear?: () => void;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({ 
  updates, 
  onClear 
}) => {
  if (updates.length === 0) {
    return (
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-gray-700/10 rounded-2xl blur-xl"></div>
        <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto">
            📊
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Activity Monitor</h3>
          <p className="text-gray-400 text-sm">Transaction history will appear here</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: TransactionUpdate['status']) => {
    switch (status) {
      case 'signing':
        return (
          <div className="relative">
            <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-pulse"></div>
          </div>
        );
      case 'submitting':
        return (
          <div className="relative">
            <div className="w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
            <div className="absolute inset-0 bg-violet-400/20 rounded-full animate-pulse"></div>
          </div>
        );
      case 'success':
        return (
          <div className="relative">
            <div className="w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
            <div className="absolute inset-0 bg-emerald-400/30 rounded-full animate-ping"></div>
          </div>
        );
      case 'error':
        return (
          <div className="relative">
            <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold">✗</div>
            <div className="absolute inset-0 bg-red-400/30 rounded-full animate-ping"></div>
          </div>
        );
      default:
        return <div className="w-5 h-5 bg-gray-500 rounded-full" />;
    }
  };

  const getStatusColor = (status: TransactionUpdate['status']) => {
    switch (status) {
      case 'signing':
        return 'text-blue-300';
      case 'submitting':
        return 'text-violet-300';
      case 'success':
        return 'text-emerald-300';
      case 'error':
        return 'text-red-300';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status: TransactionUpdate['status']) => {
    switch (status) {
      case 'signing':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'submitting':
        return 'bg-violet-500/10 border-violet-500/20';
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
      <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 rounded-2xl p-6 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Live Activity
            </h3>
          </div>
          
          {onClear && updates.length > 0 && (
            <button
              onClick={onClear}
              className="px-4 py-2 text-sm bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600/50 hover:border-gray-500/50 rounded-xl transition-all duration-200"
            >
              Clear History
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {updates.slice().reverse().map((update, index) => (
            <div key={index} 
                 className={`relative p-4 rounded-xl border transition-all duration-300 ${getStatusBg(update.status)}`}
                 style={{
                   animation: index === 0 ? 'slideInDown 0.3s ease-out' : 'none'
                 }}>
              
              {/* Timeline connector */}
              {index < updates.length - 1 && (
                <div className="absolute left-7 top-14 w-px h-8 bg-gradient-to-b from-gray-600 to-transparent"></div>
              )}
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(update.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold mb-1 ${getStatusColor(update.status)}`}>
                    {update.message}
                  </div>
                  
                  {update.timestamp && (
                    <div className="text-xs text-gray-500 mb-2">
                      {formatTimestamp(update.timestamp)}
                    </div>
                  )}
                  
                  {update.hash && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-400 mb-2">Transaction Hash</div>
                      <div className="font-mono text-xs text-gray-300 bg-black/40 px-3 py-2 rounded-lg border border-gray-700/50 break-all">
                        {update.hash}
                      </div>
                    </div>
                  )}
                  
                  {update.explorerUrl && (
                    <a
                      href={update.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 mt-3 px-3 py-2 bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 rounded-lg text-blue-300 hover:text-blue-200 text-xs transition-all duration-200 group/link"
                    >
                      <span>View on Explorer</span>
                      <svg className="w-3 h-3 transform group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {updates.length > 5 && (
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <div className="text-center">
              <div className="text-xs text-gray-500">
                Showing latest {Math.min(updates.length, 5)} transactions
              </div>
            </div>
          </div>
        )}
        
        {/* Status summary */}
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-400 mb-1">Total</div>
              <div className="text-white font-semibold">{updates.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Success</div>
              <div className="text-emerald-400 font-semibold">
                {updates.filter(u => u.status === 'success').length}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Processing</div>
              <div className="text-violet-400 font-semibold">
                {updates.filter(u => ['signing', 'submitting'].includes(u.status)).length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus;