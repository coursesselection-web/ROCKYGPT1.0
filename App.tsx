import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ComparisonView from './components/ComparisonView';
import ImageGenerationView from './components/ImageGenerationView';
import VideoGenerationView from './components/VideoGenerationView';
import AppBuilderView from './components/AppBuilderView';
import AuthView from './components/AuthView';
import { AIModel, Message, MessageAuthor, ViewMode, ComparisonResponse, ModelId, ModelConfig, ChatSession, WebAppCode } from './types';
import { AI_MODELS } from './constants';
import { generateContent, generateImage, editImage, generateVideo, generateWebApp } from './services/geminiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    try {
        return localStorage.getItem('currentUser');
    } catch (e) {
        console.error("Failed to read current user from local storage", e);
        return null;
    }
  });

  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CHAT);
  const [selectedModels, setSelectedModels] = useState<AIModel[]>([AI_MODELS[0]]);
  
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [inputImage, setInputImage] = useState<{ data: string; mimeType: string; } | null>(null);
  
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoGenerationProgress, setVideoGenerationProgress] = useState<string | null>(null);
  
  const [generatedAppCode, setGeneratedAppCode] = useState<WebAppCode | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    temperature: 0.7,
    topP: 1,
    topK: 1,
    maxOutputTokens: 8192,
  });

  // Load data on user login
  useEffect(() => {
    if (currentUser) {
        try {
            const savedHistory = localStorage.getItem(`chatHistory_${currentUser}`);
            setChatHistory(savedHistory ? JSON.parse(savedHistory) : []);

            const savedId = localStorage.getItem(`currentSessionId_${currentUser}`);
            setCurrentSessionId(savedId ? JSON.parse(savedId) : null);
        } catch (error) {
            console.error("Could not load user data from local storage", error);
            setChatHistory([]);
            setCurrentSessionId(null);
        }
    } else {
        // Clear data on logout
        setChatHistory([]);
        setCurrentSessionId(null);
    }
  }, [currentUser]);

  // Save chat history when it changes
  useEffect(() => {
    if (currentUser) {
        try {
            localStorage.setItem(`chatHistory_${currentUser}`, JSON.stringify(chatHistory));
        } catch (error) {
            console.error("Could not save chat history to local storage", error);
        }
    }
  }, [chatHistory, currentUser]);

  // Save current session ID when it changes
  useEffect(() => {
    if (currentUser) {
        try {
            if (currentSessionId) {
                localStorage.setItem(`currentSessionId_${currentUser}`, JSON.stringify(currentSessionId));
            } else {
                localStorage.removeItem(`currentSessionId_${currentUser}`);
            }
        } catch (error) {
            console.error("Could not save current session ID to local storage", error);
        }
    }
  }, [currentSessionId, currentUser]);


  const messages = useMemo(() => {
    if (!currentSessionId) return [];
    return chatHistory.find(s => s.id === currentSessionId)?.messages || [];
  }, [currentSessionId, chatHistory]);
  
  const handleSetViewMode = (mode: ViewMode) => {
    if (mode !== viewMode) {
      setError(null);
      setGeneratedImage(null);
      setInputImage(null);
      setGeneratedVideoUrl(null);
      setVideoGenerationProgress(null);
      setGeneratedAppCode(null);
    }
    
    if (mode === ViewMode.CHAT && selectedModels.length > 1) {
        setSelectedModels([selectedModels[0]]);
    }
    
    setViewMode(mode);
  }

  const handleNewSession = () => {
      setCurrentSessionId(null);
      setError(null);
      if (viewMode !== ViewMode.CHAT) {
        setViewMode(ViewMode.CHAT);
        setSelectedModels([AI_MODELS[0]]);
      }
  };

  const handleSelectSession = (sessionId: string) => {
      setCurrentSessionId(sessionId);
      setViewMode(ViewMode.CHAT);
  }

  const updateMessagesInHistory = (sessionId: string, newMessages: Message[]) => {
      setChatHistory(prevHistory => 
          prevHistory.map(session => 
              session.id === sessionId ? { ...session, messages: newMessages } : session
          )
      );
  };

  const handleSendMessage = useCallback(async (prompt: string) => {
    setError(null);
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      author: MessageAuthor.USER,
      content: prompt,
    };
    
    let sessionId = currentSessionId;
    let currentMessages = messages;
    
    if (!sessionId) {
        const newSessionId = Date.now().toString();
        const newSession: ChatSession = {
            id: newSessionId,
            title: prompt.substring(0, 40) + (prompt.length > 40 ? '...' : ''),
            messages: [userMessage],
        };
        setChatHistory(prev => [newSession, ...prev]);
        setCurrentSessionId(newSessionId);
        sessionId = newSessionId;
        currentMessages = [userMessage];
    } else {
        currentMessages = [...messages, userMessage];
        updateMessagesInHistory(sessionId, currentMessages);
    }

    try {
        const activeModel = selectedModels[0];
        const response = await generateContent(prompt, activeModel, modelConfig);

        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            author: MessageAuthor.AI,
            content: response,
            model: activeModel,
        };

        updateMessagesInHistory(sessionId, [...currentMessages, aiMessage]);
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "An unknown error occurred.";
        setError(errorMsg);
        const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            author: MessageAuthor.AI,
            content: `Sorry, I encountered an error: ${errorMsg}`,
            model: selectedModels[0],
        };
        updateMessagesInHistory(sessionId, [...currentMessages, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }, [currentSessionId, messages, selectedModels, modelConfig, chatHistory]);

  const handleCompare = useCallback(async (prompt: string, modelsToCompare: AIModel[]): Promise<ComparisonResponse[]> => {
    const promises = modelsToCompare.map(async (model): Promise<ComparisonResponse> => {
        try {
            const response = await generateContent(prompt, model, modelConfig);
            return { model, response, isLoading: false };
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "An unknown error occurred.";
            return { model, response: '', isLoading: false, error: errorMsg };
        }
    });
    return Promise.all(promises);
  }, [modelConfig]);

  const handleGenerateImage = useCallback(async (prompt: string, imageInput: { data: string; mimeType: string; } | null) => {
      setIsLoading(true);
      setError(null);
      setGeneratedImage(null);
      try {
          let result: string;
          const activeModel = selectedModels[0];
          
          if (imageInput) {
              const editApiModel = AI_MODELS.find(m => m.id === ModelId.REMINI)?.apiModelName || 'gemini-2.5-flash-image';
              result = await editImage(prompt, imageInput.data, imageInput.mimeType, editApiModel);
          } else {
              if (!activeModel.apiModelName) {
                throw new Error(`Model ${activeModel.name} cannot be used for image generation.`);
              }
              result = await generateImage(prompt, activeModel.apiModelName);
          }
          setGeneratedImage(result);
      } catch (e) {
          const errorMsg = e instanceof Error ? e.message : "Failed to generate image.";
          setError(errorMsg);
      } finally {
          setIsLoading(false);
      }
  }, [selectedModels]);
  
  const handleGenerateVideo = useCallback(async (prompt: string, imageInput: { data: string; mimeType: string; } | null) => {
    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    try {
      const activeModel = selectedModels[0];
      if (!activeModel.apiModelName) {
        throw new Error(`Model ${activeModel.name} cannot be used for video generation.`);
      }
      const result = await generateVideo(prompt, imageInput, (message) => {
        setVideoGenerationProgress(message);
      }, activeModel.apiModelName);
      setGeneratedVideoUrl(result);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to generate video.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
      setVideoGenerationProgress(null);
    }
  }, [selectedModels]);

  const handleBuildApp = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setGeneratedAppCode(null);
    try {
        const result = await generateWebApp(prompt, modelConfig);
        setGeneratedAppCode(result);
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Failed to build the application.";
        setError(errorMsg);
    } finally {
        setIsLoading(false);
    }
  }, [modelConfig]);

  const handleLoginSuccess = (username: string) => {
      try {
        localStorage.setItem('currentUser', username);
        setCurrentUser(username);
      } catch (e) {
        console.error("Failed to save current user to local storage", e);
        setError("Could not save session. Please ensure you are not in private browsing mode.");
      }
  };

  const handleLogout = () => {
      try {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
      } catch (e) {
        console.error("Failed to remove current user from local storage", e);
      }
  };

  const renderView = () => {
    switch (viewMode) {
      case ViewMode.CHAT:
        return (
          <ChatView
            messages={messages}
            activeModel={selectedModels[0]}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            error={error}
            modelConfig={modelConfig}
            setModelConfig={setModelConfig}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        );
      case ViewMode.COMPARE:
        return (
          <ComparisonView
            selectedModels={selectedModels}
            onCompare={handleCompare}
            modelConfig={modelConfig}
            setModelConfig={setModelConfig}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        );
      case ViewMode.IMAGE_GENERATION:
        return (
          <ImageGenerationView
            activeModel={selectedModels[0]}
            onGenerateImage={handleGenerateImage}
            isLoading={isLoading}
            error={error}
            generatedImage={generatedImage}
            inputImage={inputImage}
            setInputImage={setInputImage}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        );
      case ViewMode.VIDEO_GENERATION:
        return (
            <VideoGenerationView
                activeModel={selectedModels[0]}
                onGenerateVideo={handleGenerateVideo}
                isLoading={isLoading}
                error={error}
                generatedVideoUrl={generatedVideoUrl}
                progressMessage={videoGenerationProgress}
                inputImage={inputImage}
                setInputImage={setInputImage}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
        );
      case ViewMode.APP_BUILDER:
        return (
            <AppBuilderView
                activeModel={selectedModels[0]}
                onBuildApp={handleBuildApp}
                isLoading={isLoading}
                error={error}
                generatedAppCode={generatedAppCode}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
        );
      default:
        return null;
    }
  };
  
  if (!currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <Sidebar
        viewMode={viewMode}
        setViewMode={handleSetViewMode}
        selectedModels={selectedModels}
        setSelectedModels={setSelectedModels}
        onNewSession={handleNewSession}
        chatHistory={chatHistory}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col">
        {renderView()}
      </main>
    </div>
  );
};

export default App;