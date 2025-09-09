import React from 'react';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { ActionButton } from './ActionButton';
import { MessageFeedback } from './MessageFeedback';
import { CopilotLoadingAnimation } from './CopilotLoadingAnimation';
import { useCopilotStore } from '../../stores/copilotStore';
import { ImageModal } from '../ui/ImageModal';
import { SessionBriefsList } from './views/SessionBriefsList';
import { SessionBriefDetail } from './views/SessionBriefDetail';
import { LessonPlanDetail } from './views/LessonPlanDetail';
import { ChatHistoryList } from './views/ChatHistoryList';
import { UploadsArtifactsList } from './views/UploadsArtifactsList';
import { LessonPlanGenerator } from './views/LessonPlanGenerator';

interface CopilotBodyProps {
  onActionClick?: (action: string) => void;
}

// Welcome content for new tabs
function WelcomeContent() {
  const actions = [
    "Create Lesson Plan",
    "Get Practice Problems/Solutions", 
    "Summarize Session Notes",
    "Simplify a Complex Topic"
  ];

  return (
    <div className="px-4 py-8 flex flex-col justify-end min-h-full pb-10">
      <div 
        className="font-bold text-[27.97px] leading-normal mb-6"
        style={{
          background: "linear-gradient(169.144deg, rgba(219, 0, 255, 0.7) 0%, rgba(255, 46, 0, 0.7) 20%, rgba(173, 0, 255, 0.7) 69.5%, rgba(0, 26, 255, 0.7) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}
      >
        Use Advanced AI to<br />
        improve your lessons
      </div>
      
      <div className="text-[#1d192c] text-[15.98px] leading-[25.97px] mb-8">
        Ask anything below or use one of these common requests to get started:
      </div>
      
      <div className="space-y-4">
        {actions.map((action, index) => (
          <div key={index} className="w-full">
            <ActionButton 
              onClick={() => console.log('Action button clicked (disabled):', action)}
            >
              {action}
            </ActionButton>
          </div>
        ))}
      </div>
    </div>
  );
}

// Individual message component
function Message({ message }: { message: any }) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const isUser = message.type === 'user';
  const isPending = message.status === 'pending';
  const hasError = message.status === 'error';
  const hasImage = message.imageUrl && !isPending && !hasError;
  
  // Function to render formatted text with markdown-like support
  const renderFormattedText = (text: string) => {
    // Split text into lines for processing
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentIndex = 0;
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Skip empty lines but add spacing
      if (!line) {
        elements.push(<br key={`br-${currentIndex++}`} />);
        i++;
        continue;
      }
      
      // Headers (# ## ###)
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${currentIndex++}`} className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${currentIndex++}`} className="text-xl font-semibold text-gray-900 mt-4 mb-2">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${currentIndex++}`} className="text-2xl font-bold text-gray-900 mt-4 mb-3">
            {line.substring(2)}
          </h1>
        );
      }
      // Numbered lists (1. 2. 3.)
      else if (/^\d+\.\s+/.test(line)) {
        const listItems = [];
        
        // Collect consecutive numbered list items starting from current line
        while (i < lines.length) {
          const currentLine = lines[i].trim();
          
          // Break if not a numbered list item or empty line
          if (!currentLine || !/^\d+\.\s+/.test(currentLine)) {
            break;
          }
          
          const content = currentLine.replace(/^\d+\.\s+/, '');
          listItems.push(
            <li key={`li-${currentIndex++}`} className="mb-2">
              {formatInlineText(content)}
            </li>
          );
          i++;
        }
        
        // Create a single ordered list with all consecutive items
        elements.push(
          <ol key={`ol-${currentIndex++}`} className="list-decimal list-outside mb-4 ml-6 space-y-1">
            {listItems}
          </ol>
        );
        
        // Don't increment i again since we already processed all items
        continue;
      }
      // Bullet lists (- or *)
      else if (/^[-*]\s+/.test(line)) {
        const listItems = [];
        
        // Collect consecutive bullet list items starting from current line
        while (i < lines.length) {
          const currentLine = lines[i].trim();
          
          // Break if not a bullet list item or empty line
          if (!currentLine || !/^[-*]\s+/.test(currentLine)) {
            break;
          }
          
          const content = currentLine.replace(/^[-*]\s+/, '');
          listItems.push(
            <li key={`li-${currentIndex++}`} className="mb-2">
              {formatInlineText(content)}
            </li>
          );
          i++;
        }
        
        // Create a single unordered list with all consecutive items
        elements.push(
          <ul key={`ul-${currentIndex++}`} className="list-disc list-outside mb-4 ml-6 space-y-1">
            {listItems}
          </ul>
        );
        
        // Don't increment i again since we already processed all items
        continue;
      }
      // Regular paragraphs
      else {
        elements.push(
          <p key={`p-${currentIndex++}`} className="mb-4 leading-relaxed">
            {formatInlineText(line)}
          </p>
        );
      }
      
      i++;
    }
    
    return elements;
  };

  // Function to handle inline formatting (bold, italic)
  const formatInlineText = (text: string) => {
    // Handle **bold** and *italic* formatting
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return (
          <em key={index} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };
  
  return (
    <>
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div 
        className={`${isUser ? 'max-w-[80%]' : 'w-full'} rounded-lg ${
          isUser 
            ? 'bg-[#6c64c9] text-white' 
            : hasError 
              ? 'bg-red-50 text-red-900 border border-red-200'
              : 'bg-transparent text-gray-900'
        }`}
      >
        {/* Message content */}
        <div className="text-sm flex items-start gap-2 px-4 py-3">
          {isPending && !isUser && (
            <div className="mt-0.5 flex-shrink-0">
              <CopilotLoadingAnimation size="sm" />
            </div>
          )}
          <div className="flex-1">
            {hasError ? (
              <div>
                <div className="font-medium text-red-800 mb-1">Error</div>
                <div className="text-red-700">{message.error || 'Failed to get response'}</div>
              </div>
            ) : hasImage ? (
              <div className="space-y-4">
                {/* Generated Image */}
                <div className="relative">
                  <img 
                    src={message.imageUrl} 
                    alt="Generated diagram"
                    className={`max-w-full h-auto rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 ${
                      message.imageUrl.startsWith('data:image') ? 'bg-white' : ''
                    }`}
                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                    onClick={() => setIsImageModalOpen(true)}
                  />
                </div>
                
                {/* Text explanation */}
                <div className="prose prose-sm max-w-none">
                  {renderFormattedText(message.content)}
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                {isUser ? (
                  <p className="leading-relaxed">{message.content}</p>
                ) : (
                  renderFormattedText(message.content)
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Feedback buttons for AI messages */}
        {!isUser && !isPending && !hasError && (
          <div className="flex justify-start px-4 pb-3">
            <MessageFeedback 
              messageContent={message.content}
              messageId={message.id}
            />
          </div>
        )}
        
        {/* GPT disclaimer for AI messages */}
        {!isUser && !isPending && !hasError && (
          <div className="pt-2 px-4 pb-3">
            <p className="text-xs text-gray-500 text-left">
              Copilot uses ChatGPT, which can make mistakes. Your chats are not used to train models.
            </p>
          </div>
        )}
      </div>
      </div>
    
      {/* Image Modal - Always render to maintain consistent hook order */}
      <ImageModal
        isOpen={isImageModalOpen && hasImage}
        imageUrl={message.imageUrl || ''}
        altText="Generated diagram"
        onClose={() => setIsImageModalOpen(false)}
      />
    </>
  );
}

// Chat messages list
function MessagesList({ messages }: { messages: any[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Scroll to bottom immediately when component mounts (for loaded chat history)
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  }, []);

  return (
    <div ref={messagesContainerRef} className="px-4 py-4">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}

// Main body component
export const CopilotBody: React.FC<CopilotBodyProps> = () => {
  const { tabs, activeTabId, currentView } = useCopilotStore();
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  
  const hasMessages = activeTab?.messages && activeTab.messages.length > 0;

  // Render different views based on current view
  if (currentView === 'chat-history') {
    return <ChatHistoryList />;
  }

  if (currentView === 'uploads-artifacts') {
    return <UploadsArtifactsList />;
  }

  if (currentView === 'session-briefs') {
    return <SessionBriefsList />;
  }

  if (currentView === 'session-brief-detail') {
    return <SessionBriefDetail />;
  }

  if (currentView === 'lesson-plan-detail') {
    return <LessonPlanDetail />;
  }

  if (currentView === 'lesson-plan-generator') {
    return <LessonPlanGenerator />;
  }

  // Default chat view
  return (
    <div className="flex-1 overflow-y-auto">
      {hasMessages ? (
        <MessagesList messages={activeTab.messages} />
      ) : (
        <WelcomeContent />
      )}
    </div>
  );
};