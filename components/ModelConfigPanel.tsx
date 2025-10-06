import React from 'react';
import { ModelConfig } from '../types';
import { CloseIcon } from './Icons';

interface ModelConfigPanelProps {
  config: ModelConfig;
  setConfig: (config: ModelConfig) => void;
  onClose: () => void;
}

const ConfigItem: React.FC<{ label: string; description: string; children: React.ReactNode }> = ({ label, description, children }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <label className="text-sm font-medium text-slate-300">{label}</label>
    </div>
    {children}
    <p className="text-xs text-slate-500 mt-1">{description}</p>
  </div>
);

const ModelConfigPanel: React.FC<ModelConfigPanelProps> = ({ config, setConfig, onClose }) => {
  const handleConfigChange = (field: keyof ModelConfig, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setConfig({ ...config, [field]: numValue });
    }
  };

  return (
    <aside className="w-80 bg-slate-800/70 backdrop-blur-sm p-4 border-l border-slate-700/50 flex flex-col animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Model Settings</h3>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-700">
          <CloseIcon className="w-5 h-5 text-slate-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ConfigItem label="Temperature" description="Controls randomness. Lower is more deterministic.">
            <div className='flex items-center gap-2'>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => handleConfigChange('temperature', e.target.value)}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                 <span className="text-sm font-mono bg-slate-700 px-2 py-0.5 rounded">{config.temperature.toFixed(1)}</span>
            </div>
        </ConfigItem>
        <ConfigItem label="Top-P" description="Considers tokens with probabilities summing up to this value.">
            <div className='flex items-center gap-2'>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.topP}
                    onChange={(e) => handleConfigChange('topP', e.target.value)}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                 <span className="text-sm font-mono bg-slate-700 px-2 py-0.5 rounded">{config.topP.toFixed(1)}</span>
            </div>
        </ConfigItem>
        <ConfigItem label="Top-K" description="Considers the top K most likely tokens at each step.">
            <input
                type="number"
                min="1"
                value={config.topK}
                onChange={(e) => handleConfigChange('topK', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
        </ConfigItem>
         <ConfigItem label="Max Output Tokens" description="Maximum number of tokens to generate.">
            <input
                type="number"
                min="1"
                step="64"
                value={config.maxOutputTokens}
                onChange={(e) => handleConfigChange('maxOutputTokens', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
        </ConfigItem>
      </div>
       <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </aside>
  );
};

export default ModelConfigPanel;
