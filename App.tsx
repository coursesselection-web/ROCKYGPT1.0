import React, { useState, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ComparisonView from './components/ComparisonView';
import ImageGenerationView from './components/ImageGenerationView';
import VideoGenerationView from './components/VideoGenerationView';
import { AIModel, Message, MessageAuthor, ViewMode, ComparisonResponse, ModelId, ModelConfig, ChatSession } from './types';
import { AI_MODELS } from './constants';
import { generateContent, generateImage, editImage, generateVideo } from './services/geminiService';

const App: React.FC = () => {
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    temperature: 0.7,
    topP: 1,
    topK: 1,
    maxOutputTokens: 2048,
  });

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
      setCurrentSessionId(null);
    }
    
    if (mode === ViewMode.CHAT && selectedModels.length > 1) {
        setSelectedModels([selectedModels[0]]);
    }
    
    if (mode === ViewMode.IMAGE_GENERATION) {
        const imageModel = AI_MODELS.find(m => m.id === ModelId.IMAGEN);
        if (imageModel) setSelectedModels([imageModel]);
    }

    if (mode === ViewMode.VIDEO_GENERATION) {
        const videoModel = AI_MODELS.find(m => m.id === ModelId.VEO);
        if (videoModel) setSelectedModels([videoModel]);
    }

    setViewMode(mode);
  }

  const handleNewSession = () => {
      setCurrentSessionId(null);
      setError(null);
      // Reset other states if needed, for now just starting a new logical session is enough
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
    } else {
        const currentMessages = chatHistory.find(s => s.id === sessionId)?.messages || [];
        updateMessagesInHistory(sessionId, [...currentMessages, userMessage]);
    }

    const activeModel = selectedModels[0];

    try {
      const response = await generateContent(prompt, activeModel, modelConfig);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        author: MessageAuthor.AI,
        content: response,
        model: activeModel,
      };
      
      const finalMessages = [...(chatHistory.find(s => s.id === sessionId)?.messages || []), userMessage, aiMessage];
      const uniqueMessages = Array.from(new Set(finalMessages.map(m => m.id))).map(id => finalMessages.find(m => m.id === id)!);
      
      setChatHistory(prevHistory => 
          prevHistory.map(session => 
              session.id === sessionId ? { ...session, messages: uniqueMessages } : session
          )
      );

    } catch (e) {
      setError("Failed to get response from AI. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedModels, modelConfig, currentSessionId, chatHistory]);

  const handleCompare = useCallback(async (prompt: string, models: AIModel[]): Promise<ComparisonResponse[]> => {
    const promises = models.map(model =>
      generateContent(prompt, model, modelConfig)
        .then(response => ({ model, response, isLoading: false }))
        .catch(error => ({ model, response: '', isLoading: false, error: error.message || 'Failed to get response' }))
    );
    
    return Promise.all(promises);
  }, [modelConfig]);

  const handleGenerateImage = useCallback(async (prompt: string, imageInput: { data: string; mimeType: string; } | null) => {
    setError(null);
    setIsLoading(true);
    setGeneratedImage(null);
    
    try {
      const imageB64 = imageInput 
        ? await editImage(prompt, imageInput.data, imageInput.mimeType)
        : await generateImage(prompt);
      setGeneratedImage(imageB64);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to generate image. Please try again.";
      setError(errorMessage);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGenerateVideo = useCallback(async (prompt: string, imageInput: { data: string; mimeType: string; } | null) => {
    setError(null);
    setIsLoading(true);
    setGeneratedVideoUrl(null);
    setVideoGenerationProgress(null);
    
    try {
      const onProgress = (message: string) => {
        setVideoGenerationProgress(message);
      };
      const videoDataUrl = await generateVideo(prompt, imageInput || undefined, onProgress);
      setGeneratedVideoUrl(videoDataUrl);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to generate video. Please try again.";
      setError(errorMessage);
      console.error(e);
    } finally {
      setIsLoading(false);
      setVideoGenerationProgress(null);
    }
  }, []);
  
  const activeModel = selectedModels[0] || AI_MODELS[0];

  const renderView = () => {
    const onToggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    switch (viewMode) {
      case ViewMode.CHAT:
        return <ChatView
            messages={messages}
            activeModel={activeModel}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            error={error}
            modelConfig={modelConfig}
            setModelConfig={setModelConfig}
            onToggleSidebar={onToggleSidebar}
          />;
      case ViewMode.COMPARE:
        return <ComparisonView
            selectedModels={selectedModels}
            onCompare={handleCompare}
            modelConfig={modelConfig}
            setModelConfig={setModelConfig}
            onToggleSidebar={onToggleSidebar}
          />;
      case ViewMode.IMAGE_GENERATION:
        return <ImageGenerationView
            activeModel={activeModel}
            onGenerateImage={handleGenerateImage}
            isLoading={isLoading}
            error={error}
            generatedImage={generatedImage}
            inputImage={inputImage}
            setInputImage={setInputImage}
            onToggleSidebar={onToggleSidebar}
          />;
      case ViewMode.VIDEO_GENERATION:
        return <VideoGenerationView
            activeModel={activeModel}
            onGenerateVideo={handleGenerateVideo}
            isLoading={isLoading}
            error={error}
            generatedVideoUrl={generatedVideoUrl}
            progressMessage={videoGenerationProgress}
            inputImage={inputImage}
            setInputImage={setInputImage}
            onToggleSidebar={onToggleSidebar}
          />;
      default:
        return null;
    }
  }

  return (
    <div className="h-screen w-screen flex bg-slate-950 font-sans overflow-hidden">
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
      />
      <main className="flex-1 flex flex-col min-w-0">
        {renderView()}
      </main>
    </div>
  );
};

export default App;