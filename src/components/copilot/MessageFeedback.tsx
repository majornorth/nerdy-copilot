import React, { useState } from 'react';
import { Copy, ThumbsUp, ThumbsDown } from 'phosphor-react';
import { Tooltip } from '../ui/Tooltip';

interface MessageFeedbackProps {
  messageContent: string;
  messageId: string;
}

/**
 * Message feedback component with copy, thumbs up, and thumbs down actions
 * Icons are left-aligned, 20px, visible by default, and use brand-primary color
 * Each icon has a styled tooltip with specific text
 */
export const MessageFeedback: React.FC<MessageFeedbackProps> = ({ 
  messageContent, 
  messageId 
}) => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleThumbsUp = () => {
    setFeedback(feedback === 'up' ? null : 'up');
    // In a real implementation, this would send feedback to the backend
    console.log('Thumbs up feedback for message:', messageId);
  };

  const handleThumbsDown = () => {
    setFeedback(feedback === 'down' ? null : 'down');
    // In a real implementation, this would send feedback to the backend
    console.log('Thumbs down feedback for message:', messageId);
  };

  return (
    <div className="flex items-center justify-start gap-1">
      <Tooltip content={copied ? "Copied!" : "Copy"} position="top">
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <Copy size={20} weight="regular" className="text-brand-primary hover:text-brand-primary-hover" />
        </button>
      </Tooltip>
      
      <Tooltip content="Give positive feedback" position="top">
        <button
          onClick={handleThumbsUp}
          className={`p-1 hover:bg-gray-100 rounded transition-colors ${
            feedback === 'up' ? 'bg-green-50' : ''
          }`}
        >
          <ThumbsUp 
            size={20} 
            weight={feedback === 'up' ? 'fill' : 'regular'} 
            className={`${
              feedback === 'up' 
                ? 'text-green-600' 
                : 'text-brand-primary hover:text-brand-primary-hover'
            }`} 
          />
        </button>
      </Tooltip>
      
      <Tooltip content="Give negative feedback" position="top">
        <button
          onClick={handleThumbsDown}
          className={`p-1 hover:bg-gray-100 rounded transition-colors ${
            feedback === 'down' ? 'bg-red-50' : ''
          }`}
        >
          <ThumbsDown 
            size={20} 
            weight={feedback === 'down' ? 'fill' : 'regular'} 
            className={`${
              feedback === 'down' 
                ? 'text-red-600' 
                : 'text-brand-primary hover:text-brand-primary-hover'
            }`} 
          />
        </button>
      </Tooltip>
    </div>
  );
};