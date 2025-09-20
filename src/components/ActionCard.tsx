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
  const [isExpanded, setIsExpanded] = useState(false);

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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Poll ID
              </label>
              <input
                type="number"
                value={formData.poll_id || ''}
                onChange={(e) => setFormData({...formData, poll_id: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none transition-all duration-200"
                placeholder="1"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Your Choice
              </label>
              <select
                value={formData.choice || ''}
                onChange={(e) => setFormData({...formData, choice: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:border-violet-500/50 focus:outline-none transition-all duration-200"
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Recipient Address
              </label>
              <input
                type="text"
                value={formData.recipient || ''}
                onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                className="w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none font-mono text-sm transition-all duration-200"
                placeholder="0x1234...5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Amount
              </label>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none transition-all duration-200"
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

  const getGradientColors = () => {
    switch (action) {
      case 'mint_badge':
        return { bg: 'from-emerald-600/20 to-green-600/20', border: 'border-emerald-500/30', icon: 'from-emerald-500 to-green-500' };
      case 'cast_vote':
        return { bg: 'from-blue-600/20 to-cyan-600/20', border: 'border-blue-500/30', icon: 'from-blue-500 to-cyan-500' };
      case 'transfer_token':
        return { bg: 'from-violet-600/20 to-purple-600/20', border: 'border-violet-500/30', icon: 'from-violet-500 to-purple-500' };
      default:
        return { bg: 'from-gray-600/20 to-gray-700/20', border: 'border-gray-500/30', icon: 'from-gray-500 to-gray-600' };
    }
  };

  const colors = getGradientColors();

  return (
    <div className="group relative">
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
      
      <div className={`relative bg-black/80 backdrop-blur-xl border ${colors.border} rounded-2xl p-6 hover:border-opacity-60 transition-all duration-300`}>
        <div className="flex items-start space-x-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${colors.icon} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white group-hover:text-gray-100 transition-colors duration-200">
                {title}
              </h3>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                  <span className="text-green-300 text-xs font-medium">FREE</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              {description}
            </p>
            
            {/* Collapsible form */}
            {(action === 'cast_vote' || action === 'transfer_token') && (
              <div className="mb-4">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center justify-between w-full text-left text-sm font-medium text-violet-300 hover:text-violet-200 transition-colors duration-200"
                >
                  <span>Configure Parameters</span>
                  <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    ↓
                  </div>
                </button>
                
                <div className={`mt-4 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {renderForm()}
                </div>
              </div>
            )}
            
            {/* Execute button */}
            <button
              onClick={handleExecute}
              disabled={disabled || isExecuting || !isFormValid()}
              className={`
                group/btn w-full px-6 py-4 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden
                ${disabled || isExecuting || !isFormValid()
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50'
                  : `bg-gradient-to-r ${colors.icon} hover:shadow-lg hover:shadow-violet-500/25 text-white border border-white/10 hover:border-white/20 hover:scale-[1.02]`
                }
              `}
            >
              <div className="relative z-10 flex items-center justify-center space-x-2">
                {isExecuting || loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing Intent...</span>
                  </>
                ) : (
                  <>
                    <span>Execute {title}</span>
                    <div className="w-5 h-5 flex items-center justify-center">
                      ⚡
                    </div>
                  </>
                )}
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
        </div>
        
        {/* Info footer */}
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500 mb-1">Gas Fee</div>
              <div className="text-green-400 font-semibold text-sm">0 APT</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Network</div>
              <div className="text-blue-400 font-semibold text-sm">Testnet</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <div className="text-violet-400 font-semibold text-sm flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                <span>Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionCard;