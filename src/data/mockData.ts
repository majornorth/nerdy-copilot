import { Lesson, AITool, AvailabilitySlot, Resource, User } from '../types';

export const mockUser: User = {
  name: 'Nick Patterson',
  role: 'Tutor'
};

export const mockLessons: Lesson[] = [
  {
    id: '1',
    date: 'Thursday, May 22, 2025',
    time: '3:15pm - 5:15pm EDT',
    student: {
      name: 'Gabe Watson'
    },
    subject: 'LSAT',
    type: 'Online Lesson',
    recurring: 'Recurs every week',
    status: 'upcoming',
    showLessonPlan: true,
    buttonsEnabled: true
  },
  {
    id: '2',
    date: 'Friday, May 23, 2025',
    time: '2:00pm - 4:00pm EDT',
    student: {
      name: 'Sarah Johnson'
    },
    subject: 'SAT Math',
    type: 'Online Lesson',
    recurring: 'Recurs every week',
    status: 'upcoming',
    showLessonPlan: false,
    buttonsEnabled: false
  },
  {
    id: '3',
    date: 'Saturday, May 24, 2025',
    time: '10:00am - 12:00pm EDT',
    student: {
      name: 'Michael Chen'
    },
    subject: 'Chemistry',
    type: 'Online Lesson',
    recurring: 'Recurs every week',
    status: 'upcoming',
    showLessonPlan: false,
    buttonsEnabled: false
  },
  {
    id: '4',
    date: 'Monday, May 26, 2025',
    time: '4:30pm - 6:30pm EDT',
    student: {
      name: 'Emma Rodriguez'
    },
    subject: 'AP Biology',
    type: 'Online Lesson',
    recurring: 'Recurs every week',
    status: 'upcoming',
    showLessonPlan: false,
    buttonsEnabled: false
  }
];

export const mockAITools: AITool[] = [
  {
    id: '1',
    title: 'Generate a lesson plan',
    description: 'Customize an engaging and structured plan for any student and every session in minutes.',
    icon: 'FileText'
  },
  {
    id: '2',
    title: 'Generate practice problems',
    description: 'Tailor practice problems to the subject, question type, and difficulty your students need.',
    icon: 'Brain'
  }
];

export const mockAvailability: AvailabilitySlot[] = [
  { day: 'Sun', timeRange: '10am - 10pm' },
  { day: 'Mon', timeRange: '10am - 10pm' },
  { day: 'Tue', timeRange: '10am - 10pm' },
  { day: 'Wed', timeRange: '10am - 10pm' },
  { day: 'Thu', timeRange: '10am - 10pm' },
  { day: 'Fri', timeRange: '10am - 10pm' },
  { day: 'Sat', timeRange: '10am - 10pm' }
];

export const mockResources: Resource[] = [
  { id: '1', title: 'Frequently asked questions', url: '#' },
  { id: '2', title: 'Getting started videos', url: '#' },
  { id: '3', title: 'Referrals', url: '#' },
  { id: '4', title: 'Learning tools', url: '#' },
  { id: '5', title: 'Online tutoring demo', url: '#' }
];