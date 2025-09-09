import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any = null;

// Only initialize if Supabase is configured
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export interface ChatThreadMessage {
  id: string;
  content: string;
  timestamp: string; // ISO string for JSON serialization
  type: 'user' | 'assistant';
  status?: 'pending' | 'completed' | 'error';
  error?: string;
  imageUrl?: string;
}

export interface ChatThreadConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatThreadMessage[];
  conversation_history: ChatThreadConversationMessage[];
  student_context: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface CreateChatThreadData {
  title: string;
  messages: ChatThreadMessage[];
  conversation_history: ChatThreadConversationMessage[];
  student_context?: string;
  user_id?: string;
}

export interface UpdateChatThreadData {
  title?: string;
  messages?: ChatThreadMessage[];
  conversation_history?: ChatThreadConversationMessage[];
  student_context?: string;
}

class ChatThreadsService {
  private isSupabaseAvailable(): boolean {
    return supabase !== null;
  }

  async createChatThread(data: CreateChatThreadData): Promise<ChatThread | null> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not configured, chat thread not saved to database');
      return null;
    }

    try {
      const { data: thread, error } = await supabase
        .from('chat_threads')
        .insert([{
          title: data.title,
          messages: data.messages,
          conversation_history: data.conversation_history,
          student_context: data.student_context || 'All students',
          user_id: data.user_id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating chat thread:', error);
        return null;
      }

      return thread;
    } catch (error) {
      console.error('Error creating chat thread:', error);
      return null;
    }
  }

  async updateChatThread(id: string, data: UpdateChatThreadData): Promise<ChatThread | null> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not configured, chat thread not updated in database');
      return null;
    }

    try {
      const { data: thread, error } = await supabase
        .from('chat_threads')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating chat thread:', error);
        return null;
      }

      return thread;
    } catch (error) {
      console.error('Error updating chat thread:', error);
      return null;
    }
  }

  async getChatThread(id: string): Promise<ChatThread | null> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not configured, cannot fetch chat thread from database');
      return null;
    }

    try {
      const { data: thread, error } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching chat thread:', error);
        return null;
      }

      return thread;
    } catch (error) {
      console.error('Error fetching chat thread:', error);
      return null;
    }
  }

  async getChatThreads(limit: number = 50, offset: number = 0): Promise<ChatThread[]> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not configured, returning empty chat threads list');
      return [];
    }

    try {
      // Add connection test and better error handling
      console.log('Attempting to connect to Supabase:', import.meta.env.VITE_SUPABASE_URL);
      
      const { data: threads, error } = await supabase
        .from('chat_threads')
        .select('*')
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase query error:', error);
        console.error('Error fetching chat threads:', error);
        return [];
      }

      return threads || [];
    } catch (error) {
      console.error('Network or connection error:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the database. Please check your internet connection and try again.');
      }
      
      console.error('Error fetching chat threads:', error);
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteChatThread(id: string): Promise<boolean> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not configured, chat thread not deleted from database');
      return false;
    }

    try {
      const { error } = await supabase
        .from('chat_threads')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting chat thread:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting chat thread:', error);
      return false;
    }
  }

  async searchChatThreads(query: string, limit: number = 20): Promise<ChatThread[]> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not configured, returning empty search results');
      return [];
    }

    try {
      const { data: threads, error } = await supabase
        .from('chat_threads')
        .select('*')
        .or(`title.ilike.%${query}%,student_context.ilike.%${query}%`)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error searching chat threads:', error);
        return [];
      }

      return threads || [];
    } catch (error) {
      console.error('Error searching chat threads:', error);
      return [];
    }
  }

  // Helper method to convert tab data to database format
  convertTabToThreadData(tab: any, studentContext: string = 'All students'): CreateChatThreadData {
    console.log('=== CONVERT TAB TO THREAD DEBUG ===');
    console.log('Tab ID:', tab.id);
    console.log('Tab title:', tab.title);
    console.log('Messages count:', tab.messages?.length || 0);
    console.log('Messages with images:', tab.messages?.filter((m: any) => m.imageUrl)?.length || 0);
    console.log('Conversation history count:', tab.conversationHistory?.length || 0);
    console.log('===================================');
    
    // Convert messages to database format (with ISO timestamp strings)
    const messages: ChatThreadMessage[] = (tab.messages || []).map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
      type: msg.type,
      status: msg.status,
      error: msg.error,
      imageUrl: msg.imageUrl
    }));

    return {
      title: tab.title,
      messages,
      conversation_history: tab.conversationHistory || [],
      student_context: studentContext
    };
  }

  // Helper method to convert database thread to tab format
  convertThreadToTab(thread: ChatThread): any {
    // Convert messages back to tab format (with Date objects)
    const messages = thread.messages.map((msg: ChatThreadMessage) => ({
      id: msg.id,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      type: msg.type,
      status: msg.status,
      error: msg.error,
      imageUrl: msg.imageUrl
    }));

    return {
      id: `tab-${thread.id}`,
      title: thread.title,
      messages,
      conversationHistory: thread.conversation_history,
      databaseId: thread.id // Store the database ID for updates
    };
  }
}

export const chatThreadsService = new ChatThreadsService();