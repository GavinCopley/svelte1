import { writable, derived } from 'svelte/store';

// Define the subject interface
export interface AvailableSubject {
  name: string;
  category?: string;
  tutorCount: number;
  isAP?: boolean;
}

// Create a writable store for available subjects
export const availableSubjectsStore = writable<AvailableSubject[]>([]);

// Derived store for AP subjects
export const apSubjects = derived(
  availableSubjectsStore,
  $subjects => $subjects.filter(subject => subject.isAP || subject.name.toLowerCase().startsWith('ap '))
);

// Derived store for regular (non-AP) subjects
export const regularSubjects = derived(
  availableSubjectsStore,
  $subjects => $subjects.filter(subject => !subject.isAP && !subject.name.toLowerCase().startsWith('ap '))
);

// Derived store for subject categories
export const subjectCategories = derived(
  availableSubjectsStore,
  $subjects => {
    const categories: Record<string, AvailableSubject[]> = {};
    $subjects.forEach(subject => {
      const category = subject.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(subject);
    });
    return categories;
  }
);

// Helper function to categorize a subject based on its name
export function categorizeSubject(subject: string): string {
  if (subject.toLowerCase().startsWith('ap ')) {
    if (subject.includes('Calculus') || subject.includes('Statistics') || subject.includes('Computer Science')) {
      return 'AP Math and Computer Science';
    } else if (subject.includes('English')) {
      return 'AP English';
    } else if (subject.includes('Biology') || subject.includes('Chemistry') || subject.includes('Physics') || subject.includes('Environmental')) {
      return 'AP Sciences';
    } else if (
      subject.includes('History') || 
      subject.includes('Government') || 
      subject.includes('Economics') || 
      subject.includes('Geography')
    ) {
      return 'AP History and Social Sciences';
    } else if (subject.includes('Research') || subject.includes('Seminar')) {
      return 'AP Capstone Diploma Program';
    } else if (subject.includes('Art') || subject.includes('Music') || subject.includes('Drawing')) {
      return 'AP Arts';
    } else if (
      subject.includes('Spanish') || 
      subject.includes('French') || 
      subject.includes('German') || 
      subject.includes('Chinese') || 
      subject.includes('Japanese') || 
      subject.includes('Italian') || 
      subject.includes('Latin')
    ) {
      return 'AP World Languages and Cultures';
    }
    return 'AP Other';
  }
  
  // Regular subjects
  if (subject.includes('Algebra') || subject.includes('Geometry') || subject.includes('Calculus') || subject.includes('Statistics') || subject.includes('Trigonometry') || subject.includes('Math')) {
    return 'Mathematics';
  } else if (subject.includes('Biology') || subject.includes('Chemistry') || subject.includes('Physics') || subject.includes('Science')) {
    return 'Science';
  } else if (subject.includes('English') || subject.includes('Writing') || subject.includes('Literature') || subject.includes('Reading')) {
    return 'Language Arts';
  } else if (subject.includes('History') || subject.includes('Government') || subject.includes('Economics') || subject.includes('Geography') || subject.includes('Social Studies')) {
    return 'Social Studies';
  } else if (subject.includes('Spanish') || subject.includes('French') || subject.includes('German') || subject.includes('Chinese') || subject.includes('Japanese') || subject.includes('Italian') || subject.includes('Latin')) {
    return 'Foreign Languages';
  } else if (subject.includes('Computer') || subject.includes('Programming') || subject.includes('Coding')) {
    return 'Computer Science';
  }
  
  // Default category
  return 'Other';
}