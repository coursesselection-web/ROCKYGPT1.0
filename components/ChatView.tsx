import React, { useState, useRef, useEffect } from 'react';
import { Message, AIModel, ModelConfig } from '../types';
import MessageComponent from './Message';
import ModelConfigPanel from './ModelConfigPanel';
import { SendIcon, SettingsIcon, MenuIcon } from './Icons';

interface ChatViewProps {
  messages: Message[];
  activeModel: AIModel;
  onSendMessage: (prompt: string) => void;
  isLoading: boolean;
  error: string | null;
  modelConfig: ModelConfig;
  setModelConfig: (config: ModelConfig) => void;
  onToggleSidebar: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, activeModel, onSendMessage, isLoading, error, modelConfig, setModelConfig, onToggleSidebar }) => {
  const [prompt, setPrompt] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);
  
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSend = () => {
    if (prompt.trim() && !isLoading) {
      onSendMessage(prompt);
      setPrompt('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900">
      <header className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center">
            <button onClick={onToggleSidebar} aria-label="Open sidebar" className="mr-3 md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-800">
              <MenuIcon className="w-6 h-6 text-slate-400" />
            </button>
            <activeModel.icon className="w-7 h-7 mr-3 text-indigo-400"/>
            <h2 className="text-xl font-semibold">{activeModel.name} Chat</h2>
        </div>
        <button onClick={() => setShowConfig(!showConfig)} className={`p-2 rounded-lg transition-colors ${showConfig ? 'bg-slate-700' : 'bg-transparent hover:bg-slate-800'}`}>
            <SettingsIcon className="w-5 h-5 text-slate-400" />
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
              <activeModel.icon className="w-16 h-16 mb-4"/>
              <h3 className="text-2xl font-semibold text-slate-300">Start a conversation</h3>
              <p>Ask me anything, or type a prompt below to get started.</p>
            </div>
          )}
          <div>
            {messages.map(msg => (
              <MessageComponent key={msg.id} message={msg} />
            ))}
          </div>
          {isLoading && (
             <div className="flex items-start gap-4 py-6 px-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500/20">
                    <activeModel.icon className="w-5 h-5 text-indigo-400"/>
                </div>
                <div className="flex-1 pt-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-1/4 animate-pulse"></div>
                    <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {showConfig && (
          <ModelConfigPanel config={modelConfig} setConfig={setModelConfig} onClose={() => setShowConfig(false)} />
        )}
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 flex items-start gap-2">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${activeModel.name}... (Shift + Enter for new line)`}
            className="w-full bg-transparent p-2 resize-none focus:outline-none max-h-48"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !prompt.trim()}
            className="p-2 rounded-full bg-indigo-600 text-white disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors self-end"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default ChatView;