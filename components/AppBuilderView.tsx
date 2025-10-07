
import React, { useState, useMemo } from 'react';
import { AIModel, WebAppCode } from '../types';
import { SendIcon, BuildIcon, CodeIcon, CopyIcon, MenuIcon } from './Icons';

interface AppBuilderViewProps {
  activeModel: AIModel;
  onBuildApp: (prompt: string) => void;
  isLoading: boolean;
  error: string | null;
  generatedAppCode: WebAppCode | null;
  onToggleSidebar: () => void;
}

type CodeTab = 'html' | 'css' | 'javascript';

const CodeViewer: React.FC<{ code: WebAppCode }> = ({ code }) => {
    const [activeTab, setActiveTab] = useState<CodeTab>('html');
    const [copiedStates, setCopiedStates] = useState({ html: false, css: false, javascript: false });

    const handleCopy = (tab: CodeTab) => {
        navigator.clipboard.writeText(code[tab]);
        setCopiedStates(prev => ({ ...prev, [tab]: true }));
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [tab]: false })), 2000);
    };

    const tabs: { id: CodeTab, label: string }[] = [
        { id: 'html', label: 'HTML' },
        { id: 'css', label: 'CSS' },
        { id: 'javascript', label: 'JavaScript' },
    ];

    return (
        <div className="bg-slate-800 rounded-lg flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900/50 border-b border-slate-700 px-4">
                <div className="flex">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-indigo-500 text-slate-100'
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                 <button onClick={() => handleCopy(activeTab)} className="text-slate-400 hover:text-slate-200 p-2 rounded-md transition-colors">
                     {copiedStates[activeTab] ? <span className="text-xs">Copied!</span> : <CopyIcon className="w-4 h-4" />}
                 </button>
            </div>
            <pre className="p-4 text-sm overflow-auto flex-1 text-slate-300">
                <code>{code[activeTab]}</code>
            </pre>
        </div>
    );
};


const AppBuilderView: React.FC<AppBuilderViewProps> = ({ activeModel, onBuildApp, isLoading, error, generatedAppCode, onToggleSidebar }) => {
  const [prompt, setPrompt] = useState('');

  const handleBuild = () => {
    if (prompt.trim() && !isLoading) {
      onBuildApp(prompt);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBuild();
    }
  };

  const iframeSrcDoc = useMemo(() => {
    if (!generatedAppCode) return '';
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${generatedAppCode.css}</style>
        </head>
        <body>
          ${generatedAppCode.html}
          <script>${generatedAppCode.javascript}<\/script>
        </body>
      </html>
    `;
  }, [generatedAppCode]);

  return (
    <div className="flex-1 flex flex-col bg-slate-900">
      <header className="flex items-center p-4 border-b border-slate-800">
        <button onClick={onToggleSidebar} aria-label="Open sidebar" className="mr-3 md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-800">
            <MenuIcon className="w-6 h-6 text-slate-400" />
        </button>
        <activeModel.icon className="w-7 h-7 mr-3 text-indigo-400"/>
        <h2 className="text-xl font-semibold">App Builder</h2>
      </header>

      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {isLoading ? (
          <div className="w-full h-full bg-slate-800 rounded-lg flex flex-col items-center justify-center animate-pulse text-center">
             <BuildIcon className="w-16 h-16 text-slate-600 mb-4" />
             <p className="text-slate-500 text-lg font-semibold">Building your application...</p>
             <p className="text-slate-500">The AI is warming up its virtual machine...</p>
          </div>
        ) : error ? (
           <div className="w-full h-full bg-slate-800/50 border-2 border-dashed border-red-500/50 rounded-lg flex flex-col items-center justify-center text-center p-4">
             <h3 className="text-lg font-semibold text-red-400">Build Failed</h3>
             <p className="text-red-400/80">{error}</p>
          </div>
        ) : generatedAppCode ? (
          <>
            <div className="w-1/2 h-full">
                <CodeViewer code={generatedAppCode} />
            </div>
            <div className="w-1/2 h-full bg-white rounded-lg overflow-hidden">
                <iframe
                    srcDoc={iframeSrcDoc}
                    title="App Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-modals"
                />
            </div>
          </>
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-500">
                <BuildIcon className="w-24 h-24 mx-auto mb-4"/>
                <h3 className="text-2xl font-semibold text-slate-300">Generate an App with AI</h3>
                <p className="mb-6 max-w-md mx-auto">Describe the web application you want to create, and the AI will generate the HTML, CSS, and JavaScript for you.</p>
            </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., 'a simple pomodoro timer with start, stop, and reset buttons'"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pr-14 pl-4 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleBuild}
            disabled={isLoading || !prompt.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
            aria-label="Build App"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppBuilderView;
