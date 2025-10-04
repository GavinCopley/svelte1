import { firestoreDB } from '$lib/firebaseClient';
import { availableSubjectsStore } from '$lib/stores/availableSubjectsStore';
import { categorizeSubject } from '$lib/stores/availableSubjectsStore';

// Define TypeScript interfaces for our data structures
export interface Tutor {
  id?: string;
  name: string;
  subjects: string[];
  education: string;
  experience: string;
  bio: string;
  image: string;
  calendlyLink?: string;
}

// Collection name constant
const COLLECTION_NAME = 'tutors';

export const tutorService = {
  // Get all tutors
  getAllTutors: async (): Promise<Tutor[]> => {
    try {
      const tutors = await firestoreDB.getCollection(COLLECTION_NAME) as Tutor[];
      console.log(`Retrieved ${tutors.length} tutors successfully`);
      
      // Normalize and validate tutor data
      const normalizedTutors = tutors.map(tutor => ({
        id: tutor.id,
        name: tutor.name || 'Unknown',
        subjects: normalizeSubjectsList(tutor.subjects),
        education: tutor.education || '',
        experience: tutor.experience || '',
        bio: tutor.bio || '',
        image: tutor.image || '',
        calendlyLink: tutor.calendlyLink || ''
      }));

      // Update the available subjects store while we have all the tutor data
      updateAvailableSubjectsStore(normalizedTutors);
      
      return normalizedTutors;
    } catch (error) {
      console.error('Error in tutorService.getAllTutors:', error);
      // Provide empty array as fallback
      return [];
    }
  },
  
  // Get a single tutor by ID
  getTutorById: async (id: string): Promise<Tutor> => {
    const tutor = await firestoreDB.getDocument(COLLECTION_NAME, id);
    if (tutor) {
      return tutor as Tutor;
    } else {
      throw new Error('Tutor not found');
    }
  },

  // Get tutors by subject
  getTutorsBySubject: async (subject: string): Promise<Tutor[]> => {
    return await firestoreDB.queryDocuments(
      COLLECTION_NAME, 
      'subjects', 
      'array-contains', 
      subject
    ) as Tutor[];
  },
  
  // Add new tutor
  addTutor: async (tutorData: Omit<Tutor, 'id'>): Promise<string> => {
    return await firestoreDB.addDocument(COLLECTION_NAME, tutorData);
  },
  
  // Update tutor
  updateTutor: async (id: string, tutorData: Partial<Omit<Tutor, 'id'>>): Promise<void> => {
    await firestoreDB.updateDocument(COLLECTION_NAME, id, tutorData);
  },
  
  // Delete tutor
  deleteTutor: async (id: string): Promise<void> => {
    await firestoreDB.deleteDocument(COLLECTION_NAME, id);
  },

  // Get all available subjects (subjects that have at least one tutor)
  getAvailableSubjects: async () => {
    try {
      const tutors = await tutorService.getAllTutors();
      return extractAvailableSubjects(tutors);
    } catch (error) {
      console.error('Error getting available subjects:', error);
      return [];
    }
  },
  
  // Refresh the available subjects store
  refreshAvailableSubjects: async () => {
    try {
      const tutors = await tutorService.getAllTutors();
      updateAvailableSubjectsStore(tutors);
    } catch (error) {
      console.error('Error refreshing available subjects:', error);
    }
  }
};

// Helper function to extract available subjects from tutors
function extractAvailableSubjects(tutors: Tutor[]) {
  const subjectMap = new Map<string, { count: number, category: string, isAP: boolean }>();
  
  // Count tutors for each subject and categorize them
  tutors.forEach(tutor => {
    // Normalize subjects to ensure consistency
    const normalizedSubjects = normalizeSubjectsList(tutor.subjects);
    
    normalizedSubjects.forEach(subject => {
      const normalizedSubject = subject.trim();
      if (normalizedSubject) {
        const isAP = normalizedSubject.toLowerCase().startsWith('ap ');
        const category = categorizeSubject(normalizedSubject);
        
        // Update subject count in the map
        if (subjectMap.has(normalizedSubject)) {
          const existingData = subjectMap.get(normalizedSubject)!;
          existingData.count++;
        } else {
          subjectMap.set(normalizedSubject, { count: 1, category, isAP });
        }
      }
    });
  });
  
  // Convert the map to an array of subjects
  return Array.from(subjectMap.entries()).map(([name, data]) => ({
    name,
    category: data.category,
    tutorCount: data.count,
    isAP: data.isAP
  }));
}

// Helper function to normalize a list of subjects to ensure consistency
function normalizeSubjectsList(subjects: any): string[] {
  if (!subjects) {
    return [];
  }
  
  if (Array.isArray(subjects)) {
    // Filter out non-string values and trim strings
    return subjects
      .filter(s => typeof s === 'string')
      .map(s => s.trim())
      .filter(Boolean);
  } 
  
  if (typeof subjects === 'string') {
    // Split comma-separated string and trim each item
    return subjects
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }
  
  if (typeof subjects === 'object') {
    // Handle object case (sometimes Firebase returns strange formats)
    return Object.values(subjects)
      .filter(s => typeof s === 'string')
      .map(s => s.trim())
      .filter(Boolean);
  }
  
  return [];
}

// Update the available subjects store
function updateAvailableSubjectsStore(tutors: Tutor[]) {
  const availableSubjects = extractAvailableSubjects(tutors);
  availableSubjectsStore.set(availableSubjects);
}
