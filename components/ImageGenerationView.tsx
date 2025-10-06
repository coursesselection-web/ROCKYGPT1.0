import React, { useState, useRef } from 'react';
import { AIModel } from '../types';
import { SendIcon, ImageIcon, UploadIcon, CameraIcon, TrashIcon, MenuIcon } from './Icons';

interface ImageGenerationViewProps {
  activeModel: AIModel;
  onGenerateImage: (prompt: string, inputImage: { data: string; mimeType: string; } | null) => void;
  isLoading: boolean;
  error: string | null;
  generatedImage: string | null;
  inputImage: { data: string; mimeType: string; } | null;
  setInputImage: (image: { data: string; mimeType: string; } | null) => void;
  onToggleSidebar: () => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


const ImageGenerationView: React.FC<ImageGenerationViewProps> = ({ activeModel, onGenerateImage, isLoading, error, generatedImage, inputImage, setInputImage, onToggleSidebar }) => {
  const [prompt, setPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = () => {
    if (prompt.trim() && !isLoading) {
      onGenerateImage(prompt, inputImage);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const base64Data = await blobToBase64(file);
        setInputImage({ data: base64Data, mimeType: file.type });
    }
    // Reset file input value to allow selecting the same file again
    event.target.value = '';
  };

  const InputSourceSelector = () => (
    <div className="text-center text-slate-500">
         <ImageIcon className="w-24 h-24 mx-auto mb-4"/>
         <h3 className="text-2xl font-semibold text-slate-300">Bring your ideas to life</h3>
         <p className="mb-6 max-w-md mx-auto">Start with a text prompt to create a new image, or upload your own to edit it with AI.</p>
         <div className="flex justify-center gap-4">
             <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
                 <UploadIcon className="w-5 h-5"/> Upload Image
             </button>
             <button onClick={() => cameraInputRef.current?.click()} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
                 <CameraIcon className="w-5 h-5"/> Use Camera
             </button>
         </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-900">
      <header className="flex items-center p-4 border-b border-slate-800">
        <button onClick={onToggleSidebar} aria-label="Open sidebar" className="mr-3 md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-800">
            <MenuIcon className="w-6 h-6 text-slate-400" />
        </button>
        <activeModel.icon className="w-7 h-7 mr-3 text-indigo-400"/>
        <h2 className="text-xl font-semibold">{activeModel.name} Image Studio</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" aria-hidden="true" />
        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" aria-hidden="true" />

        {isLoading ? (
          <div className="w-full max-w-lg aspect-square bg-slate-800 rounded-lg flex flex-col items-center justify-center animate-pulse">
            <ImageIcon className="w-16 h-16 text-slate-600 mb-4" />
            <p className="text-slate-500">Generating your masterpiece...</p>
          </div>
        ) : error ? (
           <div className="w-full max-w-lg aspect-square bg-slate-800/50 border-2 border-dashed border-red-500/50 rounded-lg flex flex-col items-center justify-center text-center p-4">
             <h3 className="text-lg font-semibold text-red-400">Generation Failed</h3>
             <p className="text-red-400/80">{error}</p>
          </div>
        ) : generatedImage ? (
          <img 
            src={`data:image/png;base64,${generatedImage}`} 
            alt={prompt} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        ) : inputImage ? (
          <div className="relative w-full max-w-lg">
            <img 
              src={`data:${inputImage.mimeType};base64,${inputImage.data}`} 
              alt="User input preview" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button 
              onClick={() => setInputImage(null)} 
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
              aria-label="Remove input image"
            >
              <TrashIcon className="w-5 h-5"/>
            </button>
          </div>
        ) : (
          <InputSourceSelector />
        )}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={inputImage 
                ? `Describe what you want to change or add to the image...`
                : `Describe an image, e.g., "A photo of a raccoon astronaut on the moon"`
            }
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pr-14 pl-4 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
            aria-label="Generate Image"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationView;