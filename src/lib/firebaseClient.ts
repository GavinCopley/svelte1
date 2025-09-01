import { db } from '$lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

// Basic Firestore database operations for reuse
export const firestoreDB = {
  // Get a collection
  getCollection: async (collectionName: string) => {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },
  
  // Get a document by ID
  getDocument: async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  },
  
  // Add a document to a collection
  addDocument: async (collectionName: string, data: any) => {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, data);
    return docRef.id;
  },
  
  // Update a document
  updateDocument: async (collectionName: string, id: string, data: any) => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
  },
  
  // Delete a document
  deleteDocument: async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  },
  
  // Query documents with a simple where clause
  queryDocuments: async (collectionName: string, field: string, operator: any, value: any) => {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where(field, operator, value));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};
