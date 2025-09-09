import React, { useState } from 'react';
import { MagnifyingGlass, FunnelSimple, SortAscending, Trash } from 'phosphor-react';
import { mockChatHistory } from '../../../data/mockChatHistory';
import { useCopilotStore } from '../../../stores/copilotStore';
import { ChatThread } from '../../../services/chatThreadsService';
import { ConfirmationModal } from '../../ui/ConfirmationModal';

export const ChatHistoryList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{ id: string; title: string; isDatabase: boolean } | null>(null);
  
  const { 
    setView, 
    chatHistory, 
    databaseChatHistory, 
    loadChatFromHistory, 
    loadDatabaseChatHistory,
    loadChatThreadFromDatabase,
    deleteChatFromHistory,
    deleteDatabaseChatThread
  } = useCopilotStore();
  
  // Load database chat history on component mount and refresh periodically
  React.useEffect(() => {
    loadDatabaseChatHistory();
    
    // Set up periodic refresh to catch new chats
    const interval = setInterval(() => {
      loadDatabaseChatHistory();
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, [loadDatabaseChatHistory]);
  
  // Convert database threads to display format and combine with local history
  const databaseChatsForDisplay = databaseChatHistory.map((thread: ChatThread) => {
    const lastMessage = thread.messages[thread.messages.length - 1];
    const timeDiff = new Date().getTime() - new Date(thread.updated_at).getTime();
    const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
    
    let timeString;
    if (hoursAgo < 1) {
      timeString = 'Just now';
    } else if (hoursAgo < 24) {
      timeString = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
    } else {
      const daysAgo = Math.floor(hoursAgo / 24);
      timeString = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
    }
    
    return {
      id: `db-${thread.id}`,
      title: thread.title,
      student: thread.student_context,
      lastMessage: `Last message ${timeString}`,
      timestamp: timeString,
      isDatabase: true,
      databaseId: thread.id
    };
  });
  
  // Combine database chats, local chat history, and mock data
  const allChats = [...databaseChatsForDisplay, ...chatHistory, ...mockChatHistory];

  const filteredChats = allChats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.student.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatClick = (chatId: string) => {
    // Check if this is a database chat thread
    if (chatId.startsWith('db-')) {
      const databaseId = chatId.replace('db-', '');
      loadChatThreadFromDatabase(databaseId);
      return;
    }
    
    // Check if this is a local chat history item that can be restored
    const historyItem = chatHistory.find(item => item.id === chatId);
    if (historyItem && historyItem.tabData) {
      loadChatFromHistory(chatId);
    } else {
      // For mock data, just go back to chat view
      setView('chat');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, chatId: string, title: string, isDatabase: boolean = false) => {
    e.stopPropagation(); // Prevent triggering the chat click
    setChatToDelete({ id: chatId, title, isDatabase });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!chatToDelete) return;
    
    if (chatToDelete.isDatabase) {
      // Delete from database
      const databaseId = chatToDelete.id.replace('db-', '');
      await deleteDatabaseChatThread(databaseId);
    } else {
      // Delete from local history
      deleteChatFromHistory(chatToDelete.id);
    }
    
    setDeleteModalOpen(false);
    setChatToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setChatToDelete(null);
  };

  return (
    <>
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Chat history</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlass size={16} weight="regular" className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 text-sm"
          />
        </div>

        {/* Filter and Sort buttons */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
            <FunnelSimple size={16} weight="regular" />
            Filter
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
            <SortAscending size={16} weight="regular" />
            Sort
          </button>
        </div>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-4">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className="relative group"
          >
            <button
              onClick={() => handleChatClick(chat.id)}
              className="w-full p-4 text-left border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            >
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 text-base leading-6 pr-8 line-clamp-2 min-h-[3rem]">
                  {chat.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {(chat as any).student || chat.student}
                  </span>
                  <span className="text-sm text-gray-400">
                    {(chat as any).lastMessage || chat.lastMessage}
                  </span>
                </div>
              </div>
            </button>
            
            {/* Delete button - only show for non-mock data */}
            {(chat.id.startsWith('db-') || chatHistory.some(item => item.id === chat.id)) && (
              <button
                onClick={(e) => handleDeleteClick(e, chat.id, chat.title, chat.id.startsWith('db-'))}
                className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-all duration-200 z-10"
                title="Delete chat"
              >
                <Trash size={16} weight="regular" className="text-gray-400 hover:text-red-600" />
              </button>
            )}
          </div>
        ))}
        </div>
      </div>
    </div>
    
    {/* Confirmation Modal */}
    <ConfirmationModal
      isOpen={deleteModalOpen}
      onClose={handleCancelDelete}
      onConfirm={handleConfirmDelete}
      title="Delete Chat"
      message={`Are you sure you want to delete "${chatToDelete?.title}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      isDestructive={true}
    />
    </>
  );
};