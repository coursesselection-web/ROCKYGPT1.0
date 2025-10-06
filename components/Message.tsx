import React, { useState } from 'react';
import { Message, MessageAuthor } from '../types';
import { UserIcon, CopyIcon } from './Icons';
import { marked } from 'marked';

interface MessageProps {
  message: Message;
}

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.author === MessageAuthor.USER;
  const [copied, setCopied] = useState(false);
  
  const renderedContent = { __html: marked.parse(message.content) };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex items-start gap-4 py-6 px-4 group">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-slate-600' : 'bg-indigo-500/20'}`}>
        {isUser ? <UserIcon className="w-5 h-5 text-slate-300" /> : message.model && <message.model.icon className="w-5 h-5 text-indigo-400" />}
      </div>
      <div className="flex-1 pt-0.5">
        <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-200 mb-2">{isUser ? 'You' : message.model?.name}</p>
            {!isUser && (
                <button onClick={handleCopy} className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md opacity-0 group-hover:opacity-100">
                   {copied ? <span className="text-xs px-1">Copied!</span> : <CopyIcon className="w-4 h-4" />}
                </button>
            )}
        </div>
        <div className="prose prose-invert prose-sm max-w-none text-slate-300" dangerouslySetInnerHTML={renderedContent} />
      </div>
    </div>
  );
};

export default MessageComponent;