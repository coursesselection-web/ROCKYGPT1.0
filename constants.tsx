



import { AIModel, TaskType, ModelId, ViewMode } from './types';
import { GeminiIcon, ChatGPTIcon, ClaudeIcon, CopilotIcon, PerplexityIcon, CodeIcon, FeatherIcon, SearchIcon, BrainIcon, ImageIcon, ImagenIcon, VideoIcon, VeoIcon, WindsurfIcon, BuildIcon, ReminiIcon, VeerIcon, VideoEnhanceIcon } from './components/Icons';

export const AI_MODELS: AIModel[] = [
  {
    id: ModelId.GEMINI,
    name: 'Gemini',
    description: 'For powerful search and multi-modal tasks.',
    icon: GeminiIcon,
    systemInstruction: 'You are Gemini, a powerful and helpful AI assistant from Google. Provide comprehensive and accurate information.',
    apiModelName: 'gemini-2.5-flash',
  },
  {
    id: ModelId.CHATGPT,
    name: 'ChatGPT',
    description: 'For creative writing and conversation.',
    icon: ChatGPTIcon,
    systemInstruction: 'You are ChatGPT, a creative and conversational AI. Your responses should be engaging and imaginative.',
    apiModelName: 'gemini-2.5-flash',
  },
  {
    id: ModelId.CLAUDE,
    name: 'Claude',
    description: 'For long-context reasoning and analysis.',
    icon: ClaudeIcon,
    systemInstruction: 'You are Claude, an AI specializing in detailed analysis and reasoning over large amounts of text. Be thorough and thoughtful.',
    apiModelName: 'gemini-2.5-flash',
  },
  {
    id: ModelId.COPILOT,
    name: 'Copilot',
    description: 'Your go-to for coding and development.',
    icon: CopilotIcon,
    systemInstruction: 'You are a world-class AI coding assistant. Provide clean, efficient, and well-explained code snippets. Use markdown for code blocks.',
    apiModelName: 'gemini-2.5-flash',
  },
  {
    id: ModelId.PERPLEXITY,
    name: 'Perplexity',
    description: 'For web-sourced summaries and research.',
    icon: PerplexityIcon,
    systemInstruction: 'You are an AI research assistant. Your goal is to provide concise, web-sourced summaries with citations. Start your response with the main summary, followed by sources if applicable.',
    apiModelName: 'gemini-2.5-flash',
  },
  {
    id: ModelId.IMAGEN,
    name: 'Imagen',
    description: 'For high-quality, professional-grade image generation.',
    icon: ImagenIcon,
    systemInstruction: '', // Not applicable for image generation
    apiModelName: 'imagen-4.0-generate-001',
    isPremium: true,
  },
  {
    id: ModelId.VEO,
    name: 'Veo',
    description: 'For cinematic, high-definition video generation.',
    icon: VeoIcon,
    systemInstruction: '', // Not applicable for video generation
    apiModelName: 'veo-2.0-generate-001',
    isPremium: true,
  },
  {
    id: ModelId.WINDSURF,
    name: 'Windsurf',
    description: 'For bold, adventurous, and fast-paced ideas.',
    icon: WindsurfIcon,
    systemInstruction: 'You are Windsurf, an adventurous and dynamic AI. Your responses are energetic, inspiring, and straight to the point, like a gust of wind.',
    apiModelName: 'gemini-2.5-flash',
  },
  {
    id: ModelId.REMINI,
    name: 'Remini',
    description: 'Enhance and upscale images for free.',
    icon: ReminiIcon,
    systemInstruction: '', // Not applicable
    apiModelName: 'gemini-2.5-flash-image',
    isPremium: false,
  },
  {
    id: ModelId.VEER,
    name: 'Veer AI',
    description: 'Generate short video clips for free.',
    icon: VeerIcon,
    systemInstruction: '', // Not applicable
    apiModelName: 'veo-2.0-generate-001',
    isPremium: false,
  },
  {
    id: ModelId.VIDEO_ENHANCE,
    name: 'Video Enhance',
    description: 'Improve the quality of your video clips for free.',
    icon: VideoEnhanceIcon,
    systemInstruction: '', // Not applicable
    apiModelName: 'veo-2.0-generate-001',
    isPremium: false,
  },
];

export const TASK_TYPES: TaskType[] = [
  {
    id: 'app_builder',
    name: 'Build App',
    description: 'Generate a web application from a prompt.',
    recommendedModel: ModelId.COPILOT,
    icon: BuildIcon,
    targetViewMode: ViewMode.APP_BUILDER,
  },
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
    id: 'image_enhance',
    name: 'Image Enhance',
    description: 'Upscale and enhance your photos for free.',
    recommendedModel: ModelId.REMINI,
    icon: ReminiIcon,
    targetViewMode: ViewMode.IMAGE_GENERATION,
  },
  {
    id: 'video_creation',
    name: 'Video Creation',
    description: 'Generate short video clips for free.',
    recommendedModel: ModelId.VEER,
    icon: VeerIcon,
    targetViewMode: ViewMode.VIDEO_GENERATION,
  },
  {
    id: 'video_enhance',
    name: 'Video Enhance',
    description: 'Upscale and improve your video clips for free.',
    recommendedModel: ModelId.VIDEO_ENHANCE,
    icon: VideoEnhanceIcon,
    targetViewMode: ViewMode.VIDEO_GENERATION,
  },
  {
    id: 'image_studio',
    name: 'Image Studio (PRO)',
    description: 'Create and edit professional-grade images.',
    recommendedModel: ModelId.IMAGEN,
    icon: ImageIcon,
    targetViewMode: ViewMode.IMAGE_GENERATION,
    isPremium: true,
  },
  {
    id: 'video_generation',
    name: 'Video Generation (PRO)',
    description: 'Generate cinematic videos from text or images.',
    recommendedModel: ModelId.VEO,
    icon: VideoIcon,
    targetViewMode: ViewMode.VIDEO_GENERATION,
    isPremium: true,
  }
];