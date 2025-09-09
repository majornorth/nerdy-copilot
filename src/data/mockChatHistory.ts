export interface ChatHistoryItem {
  id: string;
  title: string;
  student: string;
  lastMessage: string;
  timestamp: string;
  isAllStudents?: boolean;
  tabData?: any; // Store the actual tab data for restoration
}

export const mockChatHistory: ChatHistoryItem[] = [
  {
    id: 'chat-1',
    title: 'Molecular Biology: Decoding the Language of Life (HTML Version)',
    student: 'Mae Wilson',
    lastMessage: 'Last message 22 hours ago',
    timestamp: '22 hours ago'
  },
  {
    id: 'chat-2',
    title: 'Personalized Math Tutoring Recommendations',
    student: 'All students',
    lastMessage: 'Last message 1 day ago',
    timestamp: '1 day ago',
    isAllStudents: true
  },
  {
    id: 'chat-3',
    title: 'Title of the first prompt in the thread',
    student: 'All students',
    lastMessage: 'Last message 1 day ago',
    timestamp: '1 day ago',
    isAllStudents: true
  },
  {
    id: 'chat-4',
    title: 'Title of the first prompt in the thread',
    student: 'All students',
    lastMessage: 'Last message 3 day ago',
    timestamp: '3 day ago',
    isAllStudents: true
  },
  {
    id: 'chat-5',
    title: 'Title of the first prompt in the thread',
    student: 'All students',
    lastMessage: 'Last message 6 day ago',
    timestamp: '6 day ago',
    isAllStudents: true
  },
  {
    id: 'chat-6',
    title: 'Title of the first prompt in the thread',
    student: 'All students',
    lastMessage: 'Last message 6 day ago',
    timestamp: '6 day ago',
    isAllStudents: true
  },
  {
    id: 'chat-7',
    title: 'Title of the first prompt in the thread',
    student: 'All students',
    lastMessage: 'Last message 7 days ago',
    timestamp: '7 days ago',
    isAllStudents: true
  },
  {
    id: 'chat-8',
    title: 'Title of the first prompt in the thread',
    student: 'All students',
    lastMessage: 'Last message 12 days ago',
    timestamp: '12 days ago',
    isAllStudents: true
  }
];