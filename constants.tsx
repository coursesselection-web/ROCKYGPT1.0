
import { AIModel, TaskType, ModelId, ViewMode } from './types';
import { GeminiIcon, ChatGPTIcon, ClaudeIcon, CopilotIcon, PerplexityIcon, CodeIcon, FeatherIcon, SearchIcon, BrainIcon, ImageIcon, ImagenIcon, VideoIcon, VeoIcon, WindsurfIcon } from './components/Icons';

export const AI_MODELS: AIModel[] = [
  {
    id: ModelId.GEMINI,
    name: 'Gemini',
    description: 'For powerful search and multi-modal tasks.',
    icon: GeminiIcon,
    systemInstruction: 'You are Gemini, a powerful and helpful AI assistant from Google. Provide comprehensive and accurate information.'
  },
  {
    id: ModelId.CHATGPT,
    name: 'ChatGPT',
    description: 'For creative writing and conversation.',
    icon: ChatGPTIcon,
    systemInstruction: 'You are ChatGPT, a creative and conversational AI. Your responses should be engaging and imaginative.'
  },
  {
    id: ModelId.CLAUDE,
    name: 'Claude',
    description: 'For long-context reasoning and analysis.',
    icon: ClaudeIcon,
    systemInstruction: 'You are Claude, an AI specializing in detailed analysis and reasoning over large amounts of text. Be thorough and thoughtful.'
  },
  {
    id: ModelId.COPILOT,
    name: 'Copilot',
    description: 'Your go-to for coding and development.',
    icon: CopilotIcon,
    systemInstruction: 'You are a world-class AI coding assistant. Provide clean, efficient, and well-explained code snippets. Use markdown for code blocks.'
  },
  {
    id: ModelId.PERPLEXITY,
    name: 'Perplexity',
    description: 'For web-sourced summaries and research.',
    icon: PerplexityIcon,
    systemInstruction: 'You are an AI research assistant. Your goal is to provide concise, web-sourced summaries with citations. Start your response with the main summary, followed by sources if applicable.'
  },
  {
    id: ModelId.IMAGEN,
    name: 'Imagen',
    description: 'For high-quality image generation.',
    icon: ImagenIcon,
    systemInstruction: '' // Not applicable for image generation
  },
  {
    id: ModelId.VEO,
    name: 'Veo',
    description: 'For high-quality video generation.',
    icon: VeoIcon,
    systemInstruction: '' // Not applicable for video generation
  },
  {
    id: ModelId.WINDSURF,
    name: 'Windsurf',
    description: 'For bold, adventurous, and fast-paced ideas.',
    icon: WindsurfIcon,
    systemInstruction: 'You are Windsurf, an adventurous and dynamic AI. Your responses are energetic, inspiring, and straight to the point, like a gust of wind.'
  },
];

export const TASK_TYPES: TaskType[] = [
  {
    id: 'coding',
    name: 'Coding',
    description: 'Generate code, debug, or ask dev questions.',
    recommendedModel: ModelId.COPILOT,
    icon: CodeIcon
  },
  {
    id: 'writing',
    name: 'Writing',
    description: 'Draft emails, create stories, or write content.',
    recommendedModel: ModelId.CHATGPT,
    icon: FeatherIcon
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Get web-sourced summaries on any topic.',
    recommendedModel: ModelId.PERPLEXITY,
    icon: SearchIcon
  },
  {
    id: 'reasoning',
    name: 'Reasoning',
    description: 'Analyze documents or solve complex problems.',
    recommendedModel: ModelId.CLAUDE,
    icon: BrainIcon
  },
  {
    id: 'image_studio',
    name: 'Image Studio',
    description: 'Enhance photos or create images from text.',
    recommendedModel: ModelId.IMAGEN,
    icon: ImageIcon,
    targetViewMode: ViewMode.IMAGE_GENERATION
  },
  {
    id: 'video_generation',
    name: 'Video Generation',
    description: 'Create vivid videos from text or images.',
    recommendedModel: ModelId.VEO,
    icon: VideoIcon,
    targetViewMode: ViewMode.VIDEO_GENERATION
  }
];
