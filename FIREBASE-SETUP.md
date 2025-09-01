# WiseOwl - Firestore Database Setup Guide

This document explains how Firestore Database is set up and used in the WiseOwl application.

## Firestore Configuration

Firestore is initialized through the following files:

- `/src/lib/firebase.ts` - Main Firestore initialization
- `/src/lib/firebaseClient.ts` - Reusable Firestore database operations
- `/src/lib/services/` - Service modules for each data type

## Firestore Structure

### Firestore Database

The application uses Firestore for data storage. The main collections are:

#### Tutors Collection

Tutors are stored with the following structure:

```typescript
interface Tutor {
  id?: string;
  name: string;
  subjects: string[];
  education: string;
  experience: string;
  bio: string;
  image: string;
}
```

#### Subjects Collection

Subjects have the following structure:

```typescript
interface Subject {
  id?: string;
  name: string;
  description: string;
  category: string;
  level: string;
  imageUrl?: string;
}
```

## Service Structure

Each data type has its own service module that provides CRUD operations:

- `tutorService.ts` - For managing tutor data
- `subjectService.ts` - For managing subject data

## How to Use Firebase in Components

### Loading Data

```svelte
<script>
  import { onMount } from 'svelte';
  import { tutorService } from '$lib/services/tutorService';
  
  let tutors = [];
  let loading = true;
  
  onMount(async () => {
    try {
      tutors = await tutorService.getAllTutors();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <p>Loading...</p>
{:else}
  <!-- Display tutors -->
{/if}
```

### Adding Data

```svelte
<script>
  import { tutorService } from '$lib/services/tutorService';
  
  async function handleSubmit(event) {
    event.preventDefault();
    
    const newTutor = {
      name: event.target.name.value,
      subjects: event.target.subjects.value.split(','),
      education: event.target.education.value,
      experience: event.target.experience.value,
      bio: event.target.bio.value,
      image: event.target.image.value
    };
    
    try {
      const id = await tutorService.addTutor(newTutor);
      console.log('Tutor added with ID:', id);
      
      // Reset form or redirect
    } catch (err) {
      console.error('Error adding tutor:', err);
    }
  }
</script>

<form on:submit={handleSubmit}>
  <!-- Form fields -->
  <button type="submit">Add Tutor</button>
</form>
```

## Security Rules

Remember to set up proper Firestore security rules in the Firebase console to secure your data. Here's a basic example:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to tutors and subjects
    match /tutors/{document=**} {
      allow read: if true;
      allow write: if false; // Restrict writing - implement admin authentication later if needed
    }
    
    match /subjects/{document=**} {
      allow read: if true;
      allow write: if false; // Restrict writing - implement admin authentication later if needed
    }
  }
}
```

## Deployment

When deploying to production, make sure to add the appropriate Firebase config to your environment variables or deployment settings.
