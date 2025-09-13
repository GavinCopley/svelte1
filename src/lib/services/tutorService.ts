import { firestoreDB } from '$lib/firebaseClient';

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
      return tutors.map(tutor => ({
        id: tutor.id,
        name: tutor.name || 'Unknown',
        subjects: Array.isArray(tutor.subjects) ? 
          tutor.subjects.filter(s => typeof s === 'string') : 
          (typeof tutor.subjects === 'string' ? [tutor.subjects] : []),
        education: tutor.education || '',
        experience: tutor.experience || '',
        bio: tutor.bio || '',
        image: tutor.image || '',
        calendlyLink: tutor.calendlyLink || ''
      }));
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
  }
};
