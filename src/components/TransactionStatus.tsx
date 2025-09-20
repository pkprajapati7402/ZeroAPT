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
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
        <div className="text-gray-500 text-sm">
          No recent transactions
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: TransactionUpdate['status']) => {
    switch (status) {
      case 'signing':
        return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      case 'submitting':
        return <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center text-white text-xs">✓</div>;
      case 'error':
        return <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center text-white text-xs">✗</div>;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusColor = (status: TransactionUpdate['status']) => {
    switch (status) {
      case 'signing':
        return 'text-blue-400';
      case 'submitting':
        return 'text-purple-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Transaction Status
        </h3>
        {onClear && updates.length > 0 && (
          <button
            onClick={onClear}
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {updates.map((update, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {getStatusIcon(update.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${getStatusColor(update.status)}`}>
                {update.message}
              </div>
              
              {update.timestamp && (
                <div className="text-xs text-gray-500 mt-1">
                  {formatTimestamp(update.timestamp)}
                </div>
              )}
              
              {update.hash && (
                <div className="mt-2">
                  <div className="text-xs text-gray-400 mb-1">Transaction Hash:</div>
                  <div className="font-mono text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded border break-all">
                    {update.hash}
                  </div>
                </div>
              )}
              
              {update.explorerUrl && (
                <a
                  href={update.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>View on Aptos Explorer</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {updates.length > 5 && (
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-500">
            Showing last {Math.min(updates.length, 5)} transactions
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionStatus;