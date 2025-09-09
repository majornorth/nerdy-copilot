export interface Lesson {
  id: string;
  date: string;
  time: string;
  student: {
    name: string;
    avatar?: string;
  };
  subject: string;
  type: 'Online Lesson' | 'In-Person';
  recurring: string;
  status: 'upcoming' | 'active' | 'completed';
  showLessonPlan?: boolean;
  buttonsEnabled?: boolean;
}

export interface AITool {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AvailabilitySlot {
  day: string;
  timeRange: string;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
}

export interface User {
  name: string;
  avatar?: string;
  role: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  isLoading?: boolean;
  thumbnail?: string;
}