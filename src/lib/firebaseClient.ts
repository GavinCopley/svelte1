import { db } from '$lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

// Basic Firestore database operations for reuse
export const firestoreDB = {
  // Get a collection
  getCollection: async (collectionName: string) => {
    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      throw new Error(`Failed to retrieve ${collectionName} collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  // Get a document by ID
  getDocument: async (collectionName: string, id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    } catch (error) {
      console.error(`Error getting document ${id} from ${collectionName}:`, error);
      throw new Error(`Failed to retrieve document ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  // Add a document to a collection
  addDocument: async (collectionName: string, data: any) => {
    try {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, data);
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw new Error(`Failed to add document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  // Update a document
  updateDocument: async (collectionName: string, id: string, data: any) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}:`, error);
      throw new Error(`Failed to update document ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  // Delete a document
  deleteDocument: async (collectionName: string, id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      throw new Error(`Failed to delete document ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  // Query documents with a simple where clause
  queryDocuments: async (collectionName: string, field: string, operator: any, value: any) => {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, where(field, operator, value));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error querying ${collectionName} where ${field} ${operator} ${value}:`, error);
      throw new Error(`Failed to query documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
