import React, { useState } from 'react';
import { AIModel, ComparisonResponse, ModelConfig } from '../types';
import ModelConfigPanel from './ModelConfigPanel';
import { SendIcon, SettingsIcon, MenuIcon } from './Icons';
import { marked } from 'marked';

interface ComparisonViewProps {
  selectedModels: AIModel[];
  onCompare: (prompt: string, models: AIModel[]) => Promise<ComparisonResponse[]>;
  modelConfig: ModelConfig;
  setModelConfig: (config: ModelConfig) => void;
  onToggleSidebar: () => void;
}

const ComparisonResponseCard: React.FC<{ result: ComparisonResponse }> = ({ result }) => {
  const { model, response, isLoading, error } = result;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        </div>
      );
    }
    if (error) {
      return <p className="text-red-400 text-sm">{error}</p>;
    }
    return <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(response) }} />;
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 flex-1 min-w-[300px] flex flex-col">
      <div className="flex items-center mb-4">
        <model.icon className="w-6 h-6 mr-2" />
        <h3 className="font-semibold text-lg">{model.name}</h3>
      </div>
      <div className="text-slate-300 flex-1">{renderContent()}</div>
    </div>
  );
};

const ComparisonView: React.FC<ComparisonViewProps> = ({ selectedModels, onCompare, modelConfig, setModelConfig, onToggleSidebar }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ComparisonResponse[]>([]);
  const [showConfig, setShowConfig] = useState(false);

  const handleCompare = async () => {
    if (prompt.trim() && !isLoading && selectedModels.length > 0) {
      setIsLoading(true);
      const initialResults = selectedModels.map(model => ({ model, response: '', isLoading: true }));
      setResults(initialResults);

      const finalResults = await onCompare(prompt, selectedModels);
      setResults(finalResults);
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCompare();
    }
  };


  return (
    <div className="flex-1 flex flex-col bg-slate-900">
       <header className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button onClick={onToggleSidebar} aria-label="Open sidebar" className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-800">
              <MenuIcon className="w-6 h-6 text-slate-400" />
          </button>
          <div>
              <h2 className="text-xl font-semibold">Comparison Mode</h2>
              <p className="text-sm text-slate-400">Send a prompt to all selected models and compare their answers.</p>
          </div>
        </div>
        <button onClick={() => setShowConfig(!showConfig)} className={`p-2 rounded-lg transition-colors ${showConfig ? 'bg-slate-700' : 'bg-transparent hover:bg-slate-800'}`}>
            <SettingsIcon className="w-5 h-5 text-slate-400" />
        </button>
      </header>

    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
        {results.length > 0 && (
          <div className="flex gap-6">
            {results.map(result => (
              <ComparisonResponseCard key={result.model.id} result={result} />
            ))}
          </div>
        )}

        {results.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
                <div className="flex -space-x-4 mb-4">
                    {selectedModels.map(m => <m.icon key={m.id} className="w-16 h-16 p-2 rounded-full bg-slate-800 ring-4 ring-slate-900"/>)}
                </div>
                <h3 className="text-2xl font-semibold text-slate-300">Compare AI Responses</h3>
                <p>Type a prompt below to see how each selected model responds.</p>
            </div>
        )}
      </div>

       {showConfig && (
          <ModelConfigPanel config={modelConfig} setConfig={setModelConfig} onClose={() => setShowConfig(false)} />
        )}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a prompt to compare models..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pr-14 pl-4 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleCompare}
            disabled={isLoading || !prompt.trim() || selectedModels.length === 0}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;