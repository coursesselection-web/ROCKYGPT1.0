// FIX: Changed the import from a named import to a default import.
import React from 'react';

export enum ModelId {
  GEMINI = 'gemini',
  CHATGPT = 'chatgpt',
  CLAUDE = 'claude',
  COPILOT = 'copilot',
  PERPLEXITY = 'perplexity',
  IMAGEN = 'imagen',
  VEO = 'veo',
  WINDSURF = 'windsurf',
}

export interface AIModel {
  id: ModelId;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  systemInstruction: string;
}

export interface TaskType {
  id: string;
  name: string;
  description: string;
  recommendedModel: ModelId;
  icon: React.ComponentType<{ className?: string }>;
  targetViewMode?: ViewMode;
}

export enum MessageAuthor {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  author: MessageAuthor;
  content: string;
  model?: AIModel;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export enum ViewMode {
    CHAT = 'chat',
    COMPARE = 'compare',
    IMAGE_GENERATION = 'image_generation',
    VIDEO_GENERATION = 'video_generation',
}

export interface ComparisonResponse {
    model: AIModel;
    response: string;
    isLoading: boolean;
    error?: string;
}

export interface ModelConfig {
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
}