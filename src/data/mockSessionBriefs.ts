export interface SessionBrief {
  id: string;
  title: string;
  description: string;
  student: string;
  date: string;
  goal: string;
  todaysFocus: string;
  strengthsIdentified: string;
  lessonPlan: string;
  practiceProblems: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  student: string;
  date: string;
  objectives: string[];
  keyConcepts: string[];
  timeBreakdown: string;
  lessonSteps: string[];
  notes: string;
}

export const mockSessionBriefs: SessionBrief[] = [
  {
    id: 'sb-1',
    title: 'Geometry Fundamentals Review',
    description: 'Comprehensive review of basic geometric principles and problem-solving strategies',
    student: 'Gabe Watson',
    date: 'May 22, 2025',
    goal: 'Review fundamental geometry concepts and prepare for upcoming LSAT logical reasoning sections',
    todaysFocus: 'Basic geometric shapes, angle relationships, and spatial reasoning',
    strengthsIdentified: 'Strong analytical thinking and pattern recognition abilities',
    lessonPlan: 'Structured 60-minute session covering points, lines, angles, and basic polygons',
    practiceProblems: '15 progressive problems ranging from basic identification to complex spatial reasoning'
  },
  {
    id: 'sb-2',
    title: 'Algebraic Expressions and Equations',
    description: 'Building foundation in algebraic manipulation and equation solving',
    student: 'Sarah Johnson',
    date: 'May 23, 2025',
    goal: 'Master basic algebraic operations and linear equation solving techniques',
    todaysFocus: 'Variable manipulation, distributive property, and solving for unknowns',
    strengthsIdentified: 'Excellent attention to detail and systematic approach to problems',
    lessonPlan: 'Interactive 90-minute session with hands-on practice and real-world applications',
    practiceProblems: '20 varied problems progressing from simple to complex algebraic expressions'
  },
  {
    id: 'sb-3',
    title: 'Chemistry Bonding and Molecular Structure',
    description: 'Understanding chemical bonds and molecular geometry',
    student: 'Michael Chen',
    date: 'May 24, 2025',
    goal: 'Comprehend ionic and covalent bonding, predict molecular shapes using VSEPR theory',
    todaysFocus: 'Electron configuration, bond formation, and three-dimensional molecular structures',
    strengthsIdentified: 'Strong mathematical background and visual-spatial reasoning',
    lessonPlan: 'Visual-heavy 75-minute session with molecular models and interactive simulations',
    practiceProblems: 'Molecular drawing exercises and bonding prediction challenges'
  }
];

export const mockLessonPlans: LessonPlan[] = [
  {
    id: 'lp-1',
    title: 'Geometry Fundamentals: Points, Lines, and Angles',
    student: 'Gabe Watson',
    date: 'May 22, 2025',
    objectives: [
      'Identify and classify different types of angles (acute, obtuse, right, straight)',
      'Understand the relationship between parallel lines and transversals',
      'Apply angle properties to solve geometric problems',
      'Recognize and work with complementary and supplementary angles'
    ],
    keyConcepts: [
      'Point, line, and plane definitions',
      'Angle measurement and classification',
      'Parallel and perpendicular line relationships',
      'Angle pairs and their properties',
      'Basic geometric notation and terminology'
    ],
    timeBreakdown: 'Warm-up and review (10 min) → New concept introduction (20 min) → Guided practice (20 min) → Independent work (10 min)',
    lessonSteps: [
      'Begin with a quick review of previous geometry concepts and assess current understanding',
      'Introduce angle types using visual aids and real-world examples (clock faces, building corners)',
      'Demonstrate angle measurement techniques using protractors and estimation methods',
      'Explore parallel lines cut by transversals through interactive diagrams',
      'Practice identifying angle relationships in various geometric configurations',
      'Work through sample problems step-by-step, emphasizing problem-solving strategies',
      'Assign independent practice problems with varying difficulty levels',
      'Conclude with a summary of key concepts and preview of next session topics'
    ],
    notes: 'Student shows strong analytical skills but needs more practice with angle notation. Consider using more visual aids and hands-on activities for kinesthetic learning.'
  },
  {
    id: 'lp-2',
    title: 'Algebraic Expressions: Variables and Operations',
    student: 'Sarah Johnson',
    date: 'May 23, 2025',
    objectives: [
      'Understand the concept of variables and their role in algebraic expressions',
      'Perform basic operations with algebraic expressions',
      'Simplify expressions using the distributive property',
      'Translate word problems into algebraic expressions'
    ],
    keyConcepts: [
      'Variables as unknown quantities',
      'Coefficients and constants',
      'Like and unlike terms',
      'Distributive property',
      'Order of operations in algebra'
    ],
    timeBreakdown: 'Review and warm-up (15 min) → Concept introduction (25 min) → Guided practice (30 min) → Independent practice (15 min) → Wrap-up (5 min)',
    lessonSteps: [
      'Review basic arithmetic operations and introduce the concept of unknown quantities',
      'Explain variables using concrete examples (age problems, measurement scenarios)',
      'Demonstrate how to combine like terms through visual grouping exercises',
      'Introduce the distributive property with area models and numerical examples',
      'Practice simplifying increasingly complex algebraic expressions',
      'Work on translating word problems into mathematical expressions',
      'Complete practice problems with immediate feedback and error correction',
      'Summarize key strategies and assign homework for reinforcement'
    ],
    notes: 'Student excels at following procedures but needs support in conceptual understanding. Focus on connecting abstract concepts to concrete examples.'
  }
];