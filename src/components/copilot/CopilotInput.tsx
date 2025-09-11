import React, { useState } from 'react';
import { Paperclip, ArrowUp } from 'phosphor-react';
import { FileAttachmentList } from './FileAttachmentList';
import { useFileAttachments } from '../../hooks/useFileAttachments';
import { openaiService } from '../../services/openaiService';
import { useCopilotStore } from '../../stores/copilotStore';
import { MessageFeedback } from './MessageFeedback';
import { CopilotLoadingAnimation } from './CopilotLoadingAnimation';

interface CopilotInputProps {
  onSubmit?: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Input field with placeholder text
function InputField({ 
  value, 
  onChange, 
  placeholder,
  hasMessages,
  disabled
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string;
  hasMessages: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="bg-white relative w-full min-h-[36px]">
      <div className="box-border content-stretch flex flex-row gap-2.5 items-start justify-start overflow-clip p-0 relative w-full">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={1}
          disabled={!!disabled}
          className={`w-full font-normal leading-6 not-italic text-base text-left bg-transparent border-none outline-none resize-none overflow-hidden min-h-[27px] ${
            hasMessages ? 'text-gray-900' : 'text-gray-900'
          } placeholder:text-[#a8a4b3] ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          style={{
            height: 'auto',
            minHeight: '27px'
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.max(27, target.scrollHeight)}px`;
          }}
        />
      </div>
    </div>
  );
}

// Attachment icons group
function AttachmentIcons({ onAttachFiles, disabled }: { onAttachFiles: () => void; disabled?: boolean }) {
  return (
    <div className="bg-white relative shrink-0">
      <div className="box-border content-stretch flex flex-row items-center justify-start overflow-clip p-0 relative">
        <button 
          onClick={onAttachFiles}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Attach files"
          disabled={!!disabled}
        >
          <Paperclip size={20} weight="regular" className="text-[#cdcbd4] hover:text-gray-600" />
        </button>
      </div>
    </div>
  );
}

// Bottom controls with selectors and icons
function InputControls({ onAttachFiles, disabled }: { onAttachFiles: () => void; disabled?: boolean }) {
  return (
    <div className="bg-white h-5 relative shrink-0">
      <div className="box-border content-stretch flex flex-row h-5 items-center justify-start overflow-clip p-0 relative">
        <AttachmentIcons onAttachFiles={onAttachFiles} disabled={disabled} />
      </div>
    </div>
  );
}

// Send button
function SendButton({ onSubmit, hasMessage, disabled }: { onSubmit: () => void; hasMessage: boolean; disabled?: boolean }) {
  return (
    <div className="h-8 relative shrink-0 w-8">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasMessage && !disabled ? 'bg-brand-primary' : 'bg-[#CDCBD4]'}`}>
        <ArrowUp size={16} weight="regular" className="text-white" />
      </div>
      <button
        onClick={onSubmit}
        disabled={!hasMessage || !!disabled}
        className="absolute inset-0 cursor-pointer"
      />
    </div>
  );
}

// Bottom row with controls and send button
function BottomRow({ onSubmit, hasMessage, onAttachFiles, disabled }: { onSubmit: () => void; hasMessage: boolean; onAttachFiles: () => void; disabled?: boolean }) {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="box-border content-stretch flex flex-row items-center justify-between overflow-clip p-0 relative w-full">
        <InputControls onAttachFiles={onAttachFiles} disabled={disabled} />
        <SendButton onSubmit={onSubmit} hasMessage={hasMessage} disabled={disabled} />
      </div>
    </div>
  );
}

// Main chat input component
export const CopilotInput: React.FC<CopilotInputProps> = ({ onSubmit, placeholder: placeholderProp, disabled }) => {
  const [message, setMessage] = useState('');
  const { activeTabId, tabs, addMessage, addPendingMessage, updateMessageStatus, setLoading, addToChatHistory, draftMessage, clearDraftMessage, promptContext, promptContextActive, clearPromptContext, setPromptContextActive } = useCopilotStore();
  const { updateMessageWithImage } = useCopilotStore();
  
  // Get current tab to check if it has messages
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const hasMessages = activeTab?.messages && activeTab.messages.length > 0;
  
  // Dynamic placeholder based on whether there are messages, with override support
  const placeholder = placeholderProp ?? (hasMessages ? "Reply to Copilot" : "Ask for changes or improvements to this lesson plan");
  
  const { 
    attachedFiles, 
    removeFile, 
    openFileDialog 
  } = useFileAttachments();

  // Tools/selector removed per request

  // If another component sets a draft message (e.g., Ask AI from editor), prefill the input
  React.useEffect(() => {
    if (draftMessage && typeof draftMessage === 'string') {
      setMessage(draftMessage);
      clearDraftMessage();
      // Resize textarea visually if it exists
      const textarea = document.querySelector('.copilot-input-container textarea') as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.max(27, textarea.scrollHeight)}px`;
      }
    }
  }, [draftMessage, clearDraftMessage]);

  const handleSubmit = () => {
    if (message.trim()) {
      const userMessage = message.trim();
      console.log('=== USER INPUT DEBUG ===');
      console.log('Raw input value:', message);
      console.log('Trimmed input:', userMessage);
      console.log('Input length:', userMessage.length);
      console.log('========================');
      setMessage('');
      
      // Clear the textarea height
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = '27px';
      }
      // If parent provided onSubmit, delegate and return
      if (onSubmit) {
        onSubmit(userMessage);
        return;
      }
      // Fallback: legacy direct chat flow
      handleSendMessage(userMessage);
    }
  };

  const handleSendMessage = async (userMessage: string) => {
    if (!activeTabId) return;

    // CRITICAL: Create immutable copy of the user message to prevent reference sharing
    const immutableUserMessage = String(userMessage);
    
    console.log('=== SEND MESSAGE DEBUG ===');
    console.log('Original message:', userMessage);
    console.log('Immutable message:', immutableUserMessage);
    console.log('Message length:', immutableUserMessage.length);
    console.log('Message type:', typeof immutableUserMessage);
    console.log('Reference check:', userMessage === immutableUserMessage ? 'SAME REF' : 'DIFFERENT REF');
    console.log('==========================');
    
    try {
      setLoading(true);
      
      // Add user message immediately
      console.log('Adding user message to store:', immutableUserMessage);
      addMessage(activeTabId, immutableUserMessage, 'user');
      
      // Update tab title immediately when user message appears
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      if (activeTab?.title === 'New tab') {
        // Use the first 2-3 words of the user's message as the tab title
        const words = immutableUserMessage.trim().split(' ');
        const shortTitle = words.slice(0, Math.min(3, words.length)).join(' ');
        useCopilotStore.getState().updateTabTitle(activeTabId, shortTitle);
      }
      
      // Add pending AI message
      const aiMessageId = addPendingMessage(activeTabId, 'Thinking...', 'assistant');
      
      // Get conversation history for context
      const conversationHistory = activeTab?.conversationHistory || [];
      
      // Call OpenAI API
      const response = await openaiService.sendMessage(immutableUserMessage, conversationHistory);
      
      // Update AI message with response (and image if present)
      if (response.imageUrl) {
        updateMessageWithImage(activeTabId, aiMessageId, response.message, response.imageUrl);
      } else {
        updateMessageStatus(activeTabId, aiMessageId, 'completed', response.message);
      }
      
      // Add this conversation to chat history after successful completion
      addToChatHistory(activeTabId);
      
      // Refresh database chat history to show the updated chat
      setTimeout(() => {
        useCopilotStore.getState().loadDatabaseChatHistory();
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Find the pending AI message and update it with error
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      const pendingMessage = activeTab?.messages.find(msg => msg.status === 'pending' && msg.type === 'assistant');
      
      updateMessageStatus(
        activeTabId, 
        pendingMessage?.id || `msg-${Date.now()}`, 
        'error', 
        undefined, 
        error instanceof Error ? error.message : 'Failed to get AI response'
      );
    } finally {
      setLoading(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white relative rounded-lg shrink-0 w-full copilot-input-container">
      {/* File attachments */}
      {attachedFiles.length > 0 && (
        <div className="px-4">
          <FileAttachmentList 
            files={attachedFiles}
            onRemoveFile={removeFile}
          />
        </div>
      )}
      
      {/* Input container */}
      <div className="absolute border-[#e3e2e7] border-[0.998944px] border-solid inset-0 pointer-events-none rounded-lg" />
      <div className={`relative size-full ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
        <div 
          className="box-border content-stretch flex flex-col items-start justify-start px-4 py-3 gap-2 relative w-full"
          onKeyPress={handleKeyPress}
        >
          {/* Prompt context preview (inside the bordered container with top spacing) */}
          {promptContextActive && promptContext && (
            <div className="w-full mt-1 mb-1">
              <div className="border border-gray-200 rounded-md p-2 bg-gray-50 flex items-start justify-between gap-2">
                <div className="text-xs text-gray-600 leading-snug pr-2">
                  <div className="font-medium text-gray-700 mb-1">Selected content (context):</div>
                  <div className="max-h-24 overflow-auto text-gray-700 whitespace-pre-wrap">
                    {promptContext.length > 240 ? `${promptContext.slice(0, 240)}…` : promptContext}
                  </div>
                </div>
                <button
                  aria-label="Remove context"
                  className="ml-2 shrink-0 text-gray-500 hover:text-gray-700"
                  onClick={() => { clearPromptContext(); setPromptContextActive(false); }}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <InputField 
            value={message}
            onChange={setMessage}
            placeholder={placeholder}
            hasMessages={!!hasMessages}
            disabled={disabled}
          />
          <BottomRow 
            onSubmit={handleSubmit}
            hasMessage={message.trim().length > 0}
            onAttachFiles={openFileDialog}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};
