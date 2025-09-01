import { firestoreDB } from '$lib/firebaseClient';

// Define TypeScript interface for Subject
export interface Subject {
  id?: string;
  name: string;
  description: string;
  category: string;
  level: string;
  imageUrl?: string;
}

// Collection name constant
const COLLECTION_NAME = 'subjects';

export const subjectService = {
  // Get all subjects
  getAllSubjects: async (): Promise<Subject[]> => {
    return await firestoreDB.getCollection(COLLECTION_NAME) as Subject[];
  },
  
  // Get a single subject by ID
  getSubjectById: async (id: string): Promise<Subject> => {
    const subject = await firestoreDB.getDocument(COLLECTION_NAME, id);
    if (subject) {
      return subject as Subject;
    } else {
      throw new Error('Subject not found');
    }
  },
  
  // Add new subject
  addSubject: async (subjectData: Omit<Subject, 'id'>): Promise<string> => {
    return await firestoreDB.addDocument(COLLECTION_NAME, subjectData);
  },
  
  // Update subject
  updateSubject: async (id: string, subjectData: Partial<Omit<Subject, 'id'>>): Promise<void> => {
    await firestoreDB.updateDocument(COLLECTION_NAME, id, subjectData);
  },
  
  // Delete subject
  deleteSubject: async (id: string): Promise<void> => {
    await firestoreDB.deleteDocument(COLLECTION_NAME, id);
  }
};
