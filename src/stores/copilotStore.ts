import { create } from 'zustand';
import { ChatHistoryItem } from '../data/mockChatHistory';
import { chatThreadsService, ChatThread } from '../services/chatThreadsService';
import { lessonPlanService, LessonPlanData } from '../services/lessonPlanService';

export type CopilotView = 'chat' | 'chat-history' | 'uploads-artifacts' | 'session-briefs' | 'session-brief-detail' | 'lesson-plan-detail' | 'lesson-plan-generator';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CopilotTab {
  id: string;
  title: string;
  messages: Array<{
    id: string;
    content: string;
    timestamp: Date;
    type: 'user' | 'assistant';
    status?: 'pending' | 'completed' | 'error';
    error?: string;
    imageUrl?: string;
  }>;
  conversationHistory: ChatMessage[];
  databaseId?: string; // Store the database ID for saving updates
}

export interface LessonPlan {
  id: string;
  title: string;
  content: string;
  student: string;
  date: string;
  lastModified: Date;
  version: number;
}

interface CopilotStore {
  tabs: CopilotTab[];
  activeTabId: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  currentView: CopilotView;
  selectedSessionBriefId: string | null;
  selectedLessonPlanId: string | null;
  chatHistory: ChatHistoryItem[];
  databaseChatHistory: ChatThread[];
  lessonPlans: Record<string, LessonPlan>;
  lessonPlanSaveStatus: Record<string, 'saved' | 'saving' | 'error'>;
  
  // Actions
  initializeTabs: () => Promise<void>;
  addTab: () => Promise<void>;
  removeTab: (tabId: string) => Promise<void>;
  setActiveTab: (tabId: string) => void;
  updateTabTitle: (tabId: string, title: string) => Promise<void>;
  addMessage: (tabId: string, content: string, type: 'user' | 'assistant') => void;
  addPendingMessage: (tabId: string, content: string, type: 'user' | 'assistant') => string;
  updateMessageStatus: (tabId: string, messageId: string, status: 'completed' | 'error', content?: string, error?: string) => void;
  updateMessageWithImage: (tabId: string, messageId: string, content: string, imageUrl: string) => void;
  setLoading: (loading: boolean) => void;
  setView: (view: CopilotView) => void;
  setSelectedSessionBrief: (briefId: string | null) => void;
  setSelectedLessonPlan: (planId: string | null) => void;
  addToChatHistory: (tabId: string) => void;
  loadChatFromHistory: (chatId: string) => void;
  loadDatabaseChatHistory: () => Promise<void>;
  saveChatThread: (tabId: string) => Promise<void>;
  loadChatThreadFromDatabase: (threadId: string) => Promise<void>;
  deleteChatFromHistory: (chatId: string) => void;
  deleteDatabaseChatThread: (threadId: string) => Promise<void>;
  
  // Lesson Plan Actions
  updateLessonPlan: (planId: string, content: string) => void;
  saveLessonPlan: (planId: string) => Promise<void>;
  getLessonPlan: (planId: string) => LessonPlan | null;
  setLessonPlanSaveStatus: (planId: string, status: 'saved' | 'saving' | 'error') => void;
  loadLessonPlanFromDatabase: (planId: string) => Promise<void>;
  saveLessonPlanToDatabase: (planId: string) => Promise<void>;
}

export const useCopilotStore = create<CopilotStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  isLoading: false,
  isInitialized: false,
  currentView: 'session-briefs',
  selectedSessionBriefId: null,
  selectedLessonPlanId: null,
  chatHistory: [],
  databaseChatHistory: [],
  lessonPlans: {},
  lessonPlanSaveStatus: {},
  
  initializeTabs: async () => {
    const { isInitialized } = get();
    if (isInitialized) return;

    try {
      set({ isLoading: true });
      
      console.log('Initializing copilot tabs...');
      // Fetch existing chat threads from database
      const threads = await chatThreadsService.getChatThreads();
      console.log('Successfully fetched threads:', threads.length);
      
      if (threads.length > 0) {
        // Convert database threads to tabs
        const tabs = threads.map(thread => chatThreadsService.convertThreadToTab(thread));
        
        set({
          tabs,
          activeTabId: tabs[0]?.id || null,
          isInitialized: true,
          isLoading: false
        });
        
        console.log(`Loaded ${tabs.length} chat threads from database`);
      } else {
        // No existing threads, create a default "New tab" (don't save to database yet)
        const newTabId = `tab-${Date.now()}`;
        const newTab: CopilotTab = {
          id: newTabId,
          title: 'New tab',
          messages: [],
          conversationHistory: []
        };
        
        set({
          tabs: [newTab],
          activeTabId: newTabId,
          isInitialized: true,
          isLoading: false
        });
        
        console.log('Created default new tab (not saved to database until first message)');
      }
    } catch (error) {
      console.error('Error initializing tabs:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.warn('Using offline mode due to connection issue:', errorMessage);
      
      // Fallback to default tab if database fails
      const newTabId = `tab-${Date.now()}`;
      const newTab: CopilotTab = {
        id: newTabId,
        title: 'New tab',
        messages: [],
        conversationHistory: []
      };
      
      set({
        tabs: [newTab],
        activeTabId: newTabId,
        isInitialized: true,
        isLoading: false
      });
    }
  },
  
  addTab: async () => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: CopilotTab = {
      id: newTabId,
      title: 'New tab',
      messages: [],
      conversationHistory: []
    };
    
    set((state) => ({
      tabs: [newTab, ...state.tabs],
      activeTabId: newTabId
    }));
    
    console.log('Created new tab (will be saved to database when first message is sent)');
  },
  
  removeTab: async (tabId: string) => {
    const { tabs, activeTabId } = get();
    
    // Don't allow removing the last tab - create a new one first
    if (tabs.length <= 1) {
      console.log('Cannot remove last tab, creating new tab first');
      await get().addTab();
      // Now proceed with removal since we have multiple tabs
    }
    
    const tabToRemove = tabs.find(tab => tab.id === tabId);
    console.log('Attempting to remove tab:', tabId, 'Found tab:', !!tabToRemove);
    
    // Delete from database if it has a database ID
    if (tabToRemove?.databaseId) {
      try {
        await chatThreadsService.deleteChatThread(tabToRemove.databaseId);
        console.log('Tab deleted from database:', tabToRemove.databaseId);
      } catch (error) {
        console.error('Error deleting tab from database:', error);
        // Continue with UI removal even if database deletion fails
      }
    }
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    let newActiveTabId = activeTabId;
    
    // If we're removing the active tab, switch to the first remaining tab
    if (activeTabId === tabId) {
      newActiveTabId = newTabs[0]?.id || null;
      console.log('Switching active tab from', tabId, 'to', newActiveTabId);
    }
    
    set({
      tabs: newTabs,
      activeTabId: newActiveTabId
    });
    
    console.log('Tab removed successfully. Remaining tabs:', newTabs.length);
  },
  
  setActiveTab: (tabId: string) => {
    set({ activeTabId: tabId });
  },
  
  updateTabTitle: async (tabId: string, title: string) => {
    set((state) => ({
      tabs: state.tabs.map(tab => 
        tab.id === tabId ? { ...tab, title } : tab
      )
    }));
    
    // Only save title change to database if the tab already has a database ID
    const { tabs } = get();
    const tab = tabs.find(t => t.id === tabId);
    
    if (tab?.databaseId) {
      try {
        await get().saveChatThread(tabId);
        // Refresh database chat history to show updated title
        get().loadDatabaseChatHistory();
      } catch (error) {
        console.error('Error saving title update:', error);
      }
    } else {
      console.log('Tab title updated but not saved to database (no messages yet)');
    }
  },
  
  addMessage: (tabId: string, content: string, type: 'user' | 'assistant') => {
    // CRITICAL: Create immutable content to prevent reference sharing
    const immutableContent = String(content); // Force string copy
    
    console.log('=== STORE ADD MESSAGE DEBUG ===');
    console.log('Tab ID:', tabId);
    console.log('Original Content:', content);
    console.log('Immutable Content:', immutableContent);
    console.log('Content length:', immutableContent.length);
    console.log('Type:', type);
    console.log('Content reference check:', content === immutableContent ? 'SAME REF' : 'DIFFERENT REF');
    console.log('===============================');
    
    const messageId = crypto.randomUUID();
    
    // Create completely new message object with immutable content
    const newMessage = {
      id: messageId,
      content: immutableContent, // Use immutable copy
      timestamp: new Date(),
      type,
      status: 'completed' as const
    };
    
    // Create immutable conversation history entry
    const newHistoryEntry = { 
      role: type, 
      content: immutableContent // Use immutable copy
    };
    
    // Check if this is the first user message in the tab
    const { tabs } = get();
    const currentTab = tabs.find(tab => tab.id === tabId);
    const isFirstUserMessage = type === 'user' && 
      currentTab && 
      currentTab.messages.length === 0 && 
      !currentTab.databaseId;
    
    set((state) => ({
      tabs: state.tabs.map(tab => 
        tab.id === tabId 
          ? { 
              ...tab, 
              messages: [...tab.messages, newMessage],
              conversationHistory: [...tab.conversationHistory, newHistoryEntry]
            }
          : tab
      )
    }));
    
    // Save to database when user sends their first message or for subsequent messages
    if (type === 'user' && isFirstUserMessage) {
      // First user message - create new thread in database
      console.log('First user message detected, creating database thread');
      get().saveChatThread(tabId);
    } else if (type === 'user' && currentTab?.databaseId) {
      // Subsequent user message - update existing thread
      get().saveChatThread(tabId);
    } else {
      // Debounce AI message saves
      setTimeout(() => {
        get().saveChatThread(tabId);
      }, 500);
    }
    
    // Additional debugging: verify the message was stored correctly
    setTimeout(() => {
      const currentState = get();
      const currentTab = currentState.tabs.find(t => t.id === tabId);
      const storedMessage = currentTab?.messages.find(m => m.id === messageId);
      console.log('=== MESSAGE VERIFICATION ===');
      console.log('Stored message content:', storedMessage?.content);
      console.log('Original content:', immutableContent);
      console.log('Content match:', storedMessage?.content === immutableContent);
      console.log('============================');
    }, 100);
  },

  addPendingMessage: (tabId: string, content: string, type: 'user' | 'assistant') => {
    // CRITICAL: Create immutable content to prevent reference sharing
    const immutableContent = String(content); // Force string copy
    
    console.log('=== STORE ADD PENDING MESSAGE DEBUG ===');
    console.log('Tab ID:', tabId);
    console.log('Original Content:', content);
    console.log('Immutable Content:', immutableContent);
    console.log('Content length:', immutableContent.length);
    console.log('Type:', type);
    console.log('Content reference check:', content === immutableContent ? 'SAME REF' : 'DIFFERENT REF');
    console.log('=======================================');
    
    const messageId = crypto.randomUUID();
    
    // Create completely new message object with immutable content
    const newMessage = {
      id: messageId,
      content: immutableContent, // Use immutable copy
      timestamp: new Date(),
      type,
      status: 'pending' as const
    };
    
    // Only add to conversation history for user messages, and use immutable content
    const newHistoryEntry = type === 'user' ? { 
      role: type, 
      content: immutableContent // Use immutable copy
    } : null;
    
    set((state) => ({
      tabs: state.tabs.map(tab => 
        tab.id === tabId 
          ? { 
              ...tab, 
              messages: [...tab.messages, newMessage],
              conversationHistory: newHistoryEntry
                ? [...tab.conversationHistory, newHistoryEntry]
                : tab.conversationHistory
            }
          : tab
      )
    }));
    
    return messageId;
  },

  updateMessageStatus: (tabId: string, messageId: string, status: 'completed' | 'error', content?: string, error?: string) => {
    // CRITICAL: Create immutable content if provided
    const immutableContent = content ? String(content) : undefined;
    
    console.log('=== UPDATE MESSAGE STATUS DEBUG ===');
    console.log('Tab ID:', tabId);
    console.log('Message ID:', messageId);
    console.log('Status:', status);
    console.log('Original Content:', content);
    console.log('Immutable Content:', immutableContent);
    console.log('Error:', error);
    console.log('===================================');
    
    set((state) => ({
      tabs: state.tabs.map(tab => 
        tab.id === tabId 
          ? { 
              ...tab, 
              messages: tab.messages.map(msg => 
                msg.id === messageId 
                  ? { 
                      ...msg, 
                      status, 
                      content: immutableContent || msg.content, // Use immutable copy
                      error 
                    }
                  : msg
              ),
              conversationHistory: status === 'completed' && immutableContent && tab.messages.find(m => m.id === messageId)?.type === 'assistant'
                ? [...tab.conversationHistory, { role: 'assistant', content: immutableContent }] // Use immutable copy
                : tab.conversationHistory
            }
          : tab
      )
    }));
    
    // Auto-save to database immediately after completing message
    if (status === 'completed') {
      get().saveChatThread(tabId);
    }
    
    // Additional debugging: verify the update was applied correctly
    setTimeout(() => {
      const currentState = get();
      const currentTab = currentState.tabs.find(t => t.id === tabId);
      const updatedMessage = currentTab?.messages.find(m => m.id === messageId);
      console.log('=== UPDATE VERIFICATION ===');
      console.log('Updated message content:', updatedMessage?.content);
      console.log('Expected content:', immutableContent || 'unchanged');
      console.log('Status:', updatedMessage?.status);
      console.log('===========================');
    }, 100);
  },

  updateMessageWithImage: (tabId: string, messageId: string, content: string, imageUrl: string) => {
    // CRITICAL: Create immutable content
    const immutableContent = String(content);
    const immutableImageUrl = String(imageUrl);
    
    console.log('=== UPDATE MESSAGE WITH IMAGE DEBUG ===');
    console.log('Tab ID:', tabId);
    console.log('Message ID:', messageId);
    console.log('Content:', immutableContent.substring(0, 50) + '...');
    console.log('Image URL:', immutableImageUrl);
    console.log('=======================================');
    
    set((state) => ({
      tabs: state.tabs.map(tab => 
        tab.id === tabId 
          ? { 
              ...tab, 
              messages: tab.messages.map(msg => 
                msg.id === messageId 
                  ? { 
                      ...msg, 
                      status: 'completed' as const,
                      content: immutableContent,
                      imageUrl: immutableImageUrl
                    }
                  : msg
              ),
              conversationHistory: [...tab.conversationHistory, { role: 'assistant', content: immutableContent }]
            }
          : tab
      )
    }));
    
    // Auto-save to database
    get().saveChatThread(tabId);
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setView: (view: CopilotView) => {
    set({ currentView: view });
  },

  setSelectedSessionBrief: (briefId: string | null) => {
    set({ selectedSessionBriefId: briefId });
  },

  setSelectedLessonPlan: (planId: string | null) => {
    set({ selectedLessonPlanId: planId });
  },

  addToChatHistory: (tabId: string) => {
    const { tabs } = get();
    const tab = tabs.find(t => t.id === tabId);
    
    if (!tab || tab.messages.length === 0) return;
    
    // Get the first user message as the title
    const firstUserMessage = tab.messages.find(msg => msg.type === 'user');
    if (!firstUserMessage) return;
    
    // Get the last message timestamp
    const lastMessage = tab.messages[tab.messages.length - 1];
    const now = new Date();
    const timeDiff = now.getTime() - lastMessage.timestamp.getTime();
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
    
    // Create immutable copy of the title content
    const titleContent = String(firstUserMessage.content);
    
    const newHistoryItem: ChatHistoryItem = {
      id: `history-${tabId}`,
      title: titleContent.length > 60 
        ? titleContent.substring(0, 60) + '...'
        : titleContent,
      student: 'All students', // Default for now
      lastMessage: `Last message ${timeString}`,
      timestamp: timeString,
      isAllStudents: true,
      tabData: JSON.parse(JSON.stringify(tab)) // Deep clone to prevent reference sharing
    };
    
    set((state) => ({
      chatHistory: [newHistoryItem, ...state.chatHistory]
    }));
  },

  loadChatFromHistory: (chatId: string) => {
    const { chatHistory } = get();
    const historyItem = chatHistory.find(item => item.id === chatId);
    
    if (!historyItem || !historyItem.tabData) return;
    
    // Create a new tab with the historical data
    const newTabId = `tab-${Date.now()}`;
    
    // Deep clone the tab data to prevent reference sharing
    const restoredTab: CopilotTab = {
      ...JSON.parse(JSON.stringify(historyItem.tabData)),
      id: newTabId
    };
    
    set((state) => ({
      tabs: [...state.tabs, restoredTab],
      activeTabId: newTabId,
      currentView: 'chat'
    }));
  },

  loadDatabaseChatHistory: async () => {
    console.log('=== LOADING DATABASE CHAT HISTORY ===');
    try {
      const threads = await chatThreadsService.getChatThreads();
      console.log('Loaded threads from database:', threads.length);
      set({ databaseChatHistory: threads });
    } catch (error) {
      console.error('Error loading database chat history:', error);
    }
    console.log('=====================================');
  },

  saveChatThread: async (tabId: string) => {
    const { tabs } = get();
    const tab = tabs.find(t => t.id === tabId);
    
    if (!tab) return;
    
    // Only save if the tab has messages (don't create empty threads)
    if (tab.messages.length === 0) {
      console.log('Skipping save for empty tab:', tabId);
      return;
    }
    
    console.log('=== SAVE CHAT THREAD DEBUG ===');
    console.log('Tab ID:', tabId);
    console.log('Tab title:', tab.title);
    console.log('Messages count:', tab.messages.length);
    console.log('Has database ID:', !!tab.databaseId);
    console.log('==============================');
    
    try {
      const threadData = chatThreadsService.convertTabToThreadData(tab);
      
      if (tab.databaseId) {
        // Update existing thread
        await chatThreadsService.updateChatThread(tab.databaseId, {
          title: threadData.title,
          messages: threadData.messages,
          conversation_history: threadData.conversation_history
        });
        console.log('Updated chat thread in database:', tab.databaseId);
      } else {
        // Create new thread
        const savedThread = await chatThreadsService.createChatThread(threadData);
        if (savedThread) {
          // Update the tab with the database ID
          set((state) => ({
            tabs: state.tabs.map(t => 
              t.id === tabId 
                ? { ...t, databaseId: savedThread.id }
                : t
            )
          }));
          console.log('Saved new chat thread to database:', savedThread.id);
        }
      }
      
      // Refresh the database chat history
      get().loadDatabaseChatHistory();
    } catch (error) {
      console.error('Error saving chat thread:', error);
    }
  },

  loadChatThreadFromDatabase: async (threadId: string) => {
    try {
      const thread = await chatThreadsService.getChatThread(threadId);
      if (!thread) {
        console.error('Chat thread not found:', threadId);
        return;
      }
      
      // Convert database thread to tab format
      const restoredTab = chatThreadsService.convertThreadToTab(thread);
      
      // Create a new tab with the loaded data
      const newTabId = `tab-${Date.now()}`;
      const finalTab = {
        ...restoredTab,
        id: newTabId,
        databaseId: thread.id
      };
      
      set((state) => ({
        tabs: [...state.tabs, finalTab],
        activeTabId: newTabId,
        currentView: 'chat'
      }));
      
      console.log('Loaded chat thread from database:', threadId);
    } catch (error) {
      console.error('Error loading chat thread from database:', error);
    }
  },

  deleteChatFromHistory: (chatId: string) => {
    const { tabs, activeTabId } = get();
    
    console.log('Deleting chat from history:', chatId);
    console.log('Current tabs:', tabs.map(t => ({ id: t.id, title: t.title, databaseId: t.databaseId })));
    
    // Check if there's a corresponding open tab for this chat
    let tabToClose: CopilotTab | undefined;
    
    // For database chats (chatId starts with 'db-')
    if (chatId.startsWith('db-')) {
      const databaseId = chatId.replace('db-', '');
      tabToClose = tabs.find(tab => tab.databaseId === databaseId);
      console.log('Looking for tab with databaseId:', databaseId, 'Found:', !!tabToClose);
    } else {
      // For local chat history items, check if there's a tab with matching data
      const historyItem = get().chatHistory.find(item => item.id === chatId);
      if (historyItem?.tabData) {
        // Find tab that matches the history item's tab data
        tabToClose = tabs.find(tab => 
          tab.title === historyItem.tabData.title &&
          tab.messages.length === historyItem.tabData.messages.length
        );
        console.log('Looking for tab with title:', historyItem.tabData.title, 'Found:', !!tabToClose);
      }
    }
    
    // Remove from chat history
    set((state) => ({
      chatHistory: state.chatHistory.filter(item => item.id !== chatId)
    }));
    
    // Close the corresponding tab if it exists
    if (tabToClose) {
      console.log('Closing tab corresponding to deleted chat:', tabToClose.id);
      // Use setTimeout to ensure the state update completes first
      setTimeout(() => {
        get().removeTab(tabToClose.id);
      }, 100);
    }
  },

  deleteDatabaseChatThread: async (threadId: string) => {
    const { tabs } = get();
    
    console.log('Deleting database chat thread:', threadId);
    console.log('Current tabs:', tabs.map(t => ({ id: t.id, title: t.title, databaseId: t.databaseId })));
    
    // Find the tab that corresponds to this database thread
    const tabToClose = tabs.find(tab => tab.databaseId === threadId);
    console.log('Found tab to close:', !!tabToClose, tabToClose?.id);
    
    try {
      const success = await chatThreadsService.deleteChatThread(threadId);
      if (success) {
        console.log('Deleted chat thread from database:', threadId);
        
        // Close the corresponding tab if it exists
        if (tabToClose) {
          console.log('Closing tab corresponding to deleted database thread:', tabToClose.id);
          // Use setTimeout to ensure the database operation completes first
          setTimeout(() => {
            get().removeTab(tabToClose.id);
          }, 100);
        }
        
        // Refresh the database chat history
        get().loadDatabaseChatHistory();
      } else {
        console.error('Failed to delete chat thread from database:', threadId);
      }
    } catch (error) {
      console.error('Error deleting chat thread from database:', error);
    }
  },

  // Lesson Plan Actions
  updateLessonPlan: (planId: string, content: string) => {
    set((state) => {
      const existingPlan = state.lessonPlans[planId];
      const updatedPlan: LessonPlan = existingPlan ? {
        ...existingPlan,
        content,
        lastModified: new Date(),
        version: existingPlan.version + 1
      } : {
        id: planId,
        title: `Lesson Plan ${planId}`,
        content,
        student: 'Unknown Student',
        date: new Date().toISOString().split('T')[0],
        lastModified: new Date(),
        version: 1
      };

      return {
        lessonPlans: {
          ...state.lessonPlans,
          [planId]: updatedPlan
        }
      };
    });
  },

  saveLessonPlan: async (planId: string) => {
    const { lessonPlans, setLessonPlanSaveStatus } = get();
    const lessonPlan = lessonPlans[planId];
    
    if (!lessonPlan) {
      console.error('Lesson plan not found:', planId);
      return;
    }

    try {
      setLessonPlanSaveStatus(planId, 'saving');
      
      // Save to database using the lesson plan service
      await get().saveLessonPlanToDatabase(planId);
      
      setLessonPlanSaveStatus(planId, 'saved');
      console.log('Lesson plan saved successfully:', planId);
      
    } catch (error) {
      setLessonPlanSaveStatus(planId, 'error');
      console.error('Error saving lesson plan:', error);
      throw error; // Re-throw for the auto-save hook to handle
    }
  },

  getLessonPlan: (planId: string) => {
    const { lessonPlans } = get();
    return lessonPlans[planId] || null;
  },

  setLessonPlanSaveStatus: (planId: string, status: 'saved' | 'saving' | 'error') => {
    set((state) => ({
      lessonPlanSaveStatus: {
        ...state.lessonPlanSaveStatus,
        [planId]: status
      }
    }));
  },

  loadLessonPlanFromDatabase: async (planId: string) => {
    try {
      console.log('Loading lesson plan from database:', planId);
      const lessonPlanData = await lessonPlanService.getLessonPlan(planId);
      
      if (lessonPlanData) {
        // Convert database format to store format
        const lessonPlan: LessonPlan = {
          id: lessonPlanData.id,
          title: lessonPlanData.title,
          content: lessonPlanData.content,
          student: lessonPlanData.student,
          date: lessonPlanData.date,
          lastModified: new Date(lessonPlanData.lastModified),
          version: lessonPlanData.version
        };
        
        set((state) => ({
          lessonPlans: {
            ...state.lessonPlans,
            [planId]: lessonPlan
          }
        }));
        
        console.log('Lesson plan loaded from database:', planId);
      } else {
        console.warn('Lesson plan not found in database:', planId);
      }
    } catch (error) {
      console.error('Error loading lesson plan from database:', error);
      throw error;
    }
  },

  saveLessonPlanToDatabase: async (planId: string) => {
    const { lessonPlans } = get();
    const lessonPlan = lessonPlans[planId];
    
    if (!lessonPlan) {
      throw new Error('Lesson plan not found in store');
    }

    try {
      // If Supabase isn't available, treat as locally saved
      if (!lessonPlanService.isAvailable()) {
        console.warn('Supabase not configured; skipping DB save and treating as saved locally.');
        return;
      }

      // Convert store format to database format
      const lessonPlanData: LessonPlanData = {
        id: lessonPlan.id,
        title: lessonPlan.title,
        content: lessonPlan.content,
        student: lessonPlan.student,
        date: lessonPlan.date,
        lastModified: lessonPlan.lastModified.toISOString(),
        version: lessonPlan.version
      };

      // Try to update first, then create if it doesn't exist
      let savedPlan = await lessonPlanService.updateLessonPlan(planId, {
        title: lessonPlanData.title,
        content: lessonPlanData.content,
        student: lessonPlanData.student,
        date: lessonPlanData.date,
        version: lessonPlanData.version
      });

      // If update failed (plan doesn't exist), create it
      if (!savedPlan) {
        savedPlan = await lessonPlanService.createLessonPlan({
          title: lessonPlanData.title,
          content: lessonPlanData.content,
          student: lessonPlanData.student,
          date: lessonPlanData.date
        });
      }

      if (!savedPlan) {
        throw new Error('Failed to save lesson plan to database');
      }

      console.log('Lesson plan saved to database:', planId);
    } catch (error) {
      console.error('Error saving lesson plan to database:', error);
      throw error;
    }
  }
}));
