import React from 'react';
import { AIModel, TaskType, ViewMode, ModelId, ChatSession } from '../types';
import { AI_MODELS, TASK_TYPES } from '../constants';
import { PlusIcon, NeuralSuiteIcon, CloseIcon } from './Icons';

interface SidebarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedModels: AIModel[];
  setSelectedModels: (models: AIModel[]) => void;
  onNewSession: () => void;
  chatHistory: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    viewMode, 
    setViewMode, 
    selectedModels, 
    setSelectedModels, 
    onNewSession,
    chatHistory,
    currentSessionId,
    onSelectSession,
    isSidebarOpen,
    setIsSidebarOpen
}) => {

  const handleTaskSelect = (task: TaskType) => {
    const recommendedModel = AI_MODELS.find(m => m.id === task.recommendedModel);
    if (recommendedModel) {
      setSelectedModels([recommendedModel]);
      setViewMode(task.targetViewMode || ViewMode.CHAT);
    }
    // Start a new session when a task is selected
    onNewSession();
    setIsSidebarOpen(false);
  };
  
  const handleSessionSelect = (sessionId: string) => {
      onSelectSession(sessionId);
      setIsSidebarOpen(false);
  };

  const handleModelToggle = (model: AIModel) => {
    if (viewMode === ViewMode.CHAT) {
      setSelectedModels([model]);
    } else {
      const isSelected = selectedModels.some(m => m.id === model.id);
      if (isSelected) {
        if (selectedModels.length > 1) {
          setSelectedModels(selectedModels.filter(m => m.id !== model.id));
        }
      } else {
        setSelectedModels([...selectedModels, model]);
      }
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
          <div 
              className="fixed inset-0 bg-black/60 z-20 md:hidden" 
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
          ></div>
      )}
      <aside className={`fixed inset-y-0 left-0 z-30 w-80 bg-slate-900 p-4 flex flex-col space-y-4 overflow-y-auto border-r border-slate-800 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                  <NeuralSuiteIcon className="w-8 h-8" />
                  <h1 className="text-xl font-bold text-slate-200">rockygpt1.0 Studio</h1>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onNewSession} aria-label="New Chat" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                    <PlusIcon className="w-5 h-5" />
                </button>
                <button onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors md:hidden">
                    <CloseIcon className="w-5 h-5" />
                </button>
              </div>
          </div>
        </div>
        
        {/* Smart Task Router */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Start a new task...</h2>
          <div className="space-y-1">
            {TASK_TYPES.map((task) => (
              <button
                key={task.id}
                onClick={() => handleTaskSelect(task)}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800 transition-colors text-left"
              >
                <task.icon className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-200">{task.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        {chatHistory.length > 0 && viewMode === ViewMode.CHAT && (
          <div className="flex-1 flex flex-col min-h-0">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">History</h2>
              <div className="space-y-1 overflow-y-auto pr-1">
                  {chatHistory.slice().reverse().map(session => (
                      <button 
                          key={session.id}
                          onClick={() => handleSessionSelect(session.id)}
                          className={`w-full text-left p-2 rounded-lg truncate text-sm transition-colors ${
                              session.id === currentSessionId ? 'bg-slate-700 text-slate-100' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                      >
                          {session.title}
                      </button>
                  ))}
              </div>
          </div>
        )}


        {/* View Mode */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">View Mode</h2>
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode(ViewMode.CHAT)}
              className={`w-1/2 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === ViewMode.CHAT ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
            >
              Chat
            </button>
            <button
              onClick={() => setViewMode(ViewMode.COMPARE)}
              className={`w-1/2 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === ViewMode.COMPARE ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
            >
              Compare
            </button>
          </div>
        </div>

        {/* AI Models */}
        <div className="flex flex-col">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
            {viewMode === ViewMode.CHAT ? 'Select Model' : 'Compare Models'}
          </h2>
          <div className="space-y-2">
            {AI_MODELS.map((model) => {
              const isSelected = selectedModels.some(m => m.id === model.id);
              const isInteractive = viewMode !== ViewMode.IMAGE_GENERATION && viewMode !== ViewMode.VIDEO_GENERATION;
              return (
                <button
                  key={model.id}
                  onClick={() => isInteractive && handleModelToggle(model)}
                  disabled={!isInteractive}
                  className={`w-full flex items-center space-x-3 p-2 rounded-lg border-2 transition-all ${
                    isSelected ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent bg-slate-800 hover:bg-slate-700'
                  } ${!isInteractive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <model.icon className="w-6 h-6" />
                  <div>
                    <p className="font-medium text-slate-200">{model.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;