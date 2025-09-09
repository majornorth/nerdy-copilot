import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any = null;

// Only initialize if Supabase is configured
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export interface LessonPlanData {
  id: string;
  title: string;
  content: string;
  student: string;
  date: string;
  lastModified: string; // ISO string for JSON serialization
  version: number;
  user_id?: string;
}

export interface CreateLessonPlanData {
  title: string;
  content: string;
  student: string;
  date: string;
  user_id?: string;
}

export interface UpdateLessonPlanData {
  title?: string;
  content?: string;
  student?: string;
  date?: string;
  version?: number;
}

class LessonPlanService {
  // Expose availability so callers can gracefully degrade
  public isAvailable(): boolean {
    return this.isSupabaseAvailable();
  }
  private isSupabaseAvailable(): boolean {
    return supabase !== null;
  }

  async createLessonPlan(data: CreateLessonPlanData): Promise<LessonPlanData | null> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not configured, lesson plan not saved to database');
      return null;
    }

    try {
      const { data: lessonPlan, error } = await supabase
        .from('lesson_plans')
        .insert([{
          title: data.title,
          content: data.content,
          student: data.student,
          date: data.date,
          last_modified: new Date().toISOString(),
          version: 1,
          user_id: data.user_id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating lesson plan:', error);
        return null;
      }

      return this.convertFromDatabase(lessonPlan);
    } catch (error) {
      console.error('Error creating lesson plan:', error);
      return null;
    }
  }

  async updateLessonPlan(id: string, data: UpdateLessonPlanData): Promise<LessonPlanData | null> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not configured, lesson plan not updated in database');
      return null;
    }

    try {
      const updateData: any = {
        last_modified: new Date().toISOString()
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.student !== undefined) updateData.student = data.student;
      if (data.date !== undefined) updateData.date = data.date;
      if (data.version !== undefined) updateData.version = data.version;

      const { data: lessonPlan, error } = await supabase
        .from('lesson_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating lesson plan:', error);
        return null;
      }

      return this.convertFromDatabase(lessonPlan);
    } catch (error) {
      console.error('Error updating lesson plan:', error);
      return null;
    }
  }

  async getLessonPlan(id: string): Promise<LessonPlanData | null> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not configured, cannot fetch lesson plan from database');
      return null;
    }

    try {
      const { data: lessonPlan, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching lesson plan:', error);
        return null;
      }

      return this.convertFromDatabase(lessonPlan);
    } catch (error) {
      console.error('Error fetching lesson plan:', error);
      return null;
    }
  }

  async getLessonPlans(limit: number = 50, offset: number = 0): Promise<LessonPlanData[]> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not configured, returning empty lesson plans list');
      return [];
    }

    try {
      const { data: lessonPlans, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .order('last_modified', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching lesson plans:', error);
        return [];
      }

      return (lessonPlans || []).map(plan => this.convertFromDatabase(plan));
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteLessonPlan(id: string): Promise<boolean> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not configured, lesson plan not deleted from database');
      return false;
    }

    try {
      const { error } = await supabase
        .from('lesson_plans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting lesson plan:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting lesson plan:', error);
      return false;
    }
  }

  async searchLessonPlans(query: string, limit: number = 20): Promise<LessonPlanData[]> {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not configured, returning empty search results');
      return [];
    }

    try {
      const { data: lessonPlans, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .or(`title.ilike.%${query}%,student.ilike.%${query}%,content.ilike.%${query}%`)
        .order('last_modified', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error searching lesson plans:', error);
        return [];
      }

      return (lessonPlans || []).map(plan => this.convertFromDatabase(plan));
    } catch (error) {
      console.error('Error searching lesson plans:', error);
      return [];
    }
  }

  // Helper method to convert database format to application format
  private convertFromDatabase(dbPlan: any): LessonPlanData {
    return {
      id: dbPlan.id,
      title: dbPlan.title,
      content: dbPlan.content,
      student: dbPlan.student,
      date: dbPlan.date,
      lastModified: dbPlan.last_modified,
      version: dbPlan.version || 1
    };
  }

  // Helper method to convert application format to database format
  convertToDatabase(appPlan: any): any {
    return {
      id: appPlan.id,
      title: appPlan.title,
      content: appPlan.content,
      student: appPlan.student,
      date: appPlan.date,
      last_modified: appPlan.lastModified,
      version: appPlan.version || 1
    };
  }
}

export const lessonPlanService = new LessonPlanService();
