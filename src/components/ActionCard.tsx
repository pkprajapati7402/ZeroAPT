'use client';

import React, { useState } from 'react';

export interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  action: string;
  params?: any;
  onExecute: (action: string, params: any) => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  action,
  params = {},
  onExecute,
  disabled = false,
  loading = false
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const handleExecute = async () => {
    if (disabled || isExecuting) return;

    setIsExecuting(true);
    try {
      await onExecute(action, { ...params, ...formData });
    } catch (error) {
      console.error('Action execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const renderForm = () => {
    switch (action) {
      case 'cast_vote':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Poll ID
              </label>
              <input
                type="number"
                value={formData.poll_id || ''}
                onChange={(e) => setFormData({...formData, poll_id: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="1"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Choice
              </label>
              <select
                value={formData.choice || ''}
                onChange={(e) => setFormData({...formData, choice: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select option</option>
                <option value="0">Option A</option>
                <option value="1">Option B</option>
                <option value="2">Option C</option>
              </select>
            </div>
          </div>
        );
        
      case 'transfer_token':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={formData.recipient || ''}
                onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                placeholder="0x1234...5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="10"
                min="1"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const isFormValid = () => {
    switch (action) {
      case 'cast_vote':
        return formData.poll_id && formData.choice !== undefined;
      case 'transfer_token':
        return formData.recipient && formData.amount;
      default:
        return true;
    }
  };

  return (
    <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {description}
          </p>
          
          {renderForm()}
          
          <button
            onClick={handleExecute}
            disabled={disabled || isExecuting || !isFormValid()}
            className={`
              w-full mt-4 px-4 py-3 rounded-lg font-semibold transition-all duration-200
              ${disabled || isExecuting || !isFormValid()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25'
              }
            `}
          >
            {isExecuting || loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Execute ${title}`
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Gas Fee:</span>
          <span className="text-green-400 font-semibold">FREE ⚡</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-gray-500">Network:</span>
          <span className="text-blue-400">Aptos Testnet</span>
        </div>
      </div>
    </div>
  );
};

export default ActionCard;