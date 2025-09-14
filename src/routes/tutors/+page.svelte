<script lang="ts"> 
  // Remove legacy Calendly script initialization to avoid conflicts with the CalendlyWidget component
  // The widget now handles script/style loading and re-initialization
  
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import type { Tutor } from '$lib/services/tutorService';
  import { Modal } from '$lib/components';
  import { getEmoji } from '$lib/utils/emojiUtils';
  // NEW: session info + calendly helper & widget
  import { SessionInfoModal, CalendlyWidget } from '$lib';
  import { buildCalendlyPrefill } from '$lib/utils/calendlyHelper';
  
  // Initialize tutors array with loading state
  let tutors: Tutor[] = [];
  let loading = true;
  let error: string | null = null;
  
  // Subject selection modal
  let subjectsModalOpen = false;
  let searchQuery = '';
  let selectedSubjects: string[] = [];
  
  // Booking modal state
  let bookingModalOpen = false;
  let subjectSelectionModalOpen = false; // For displaying subjects before booking
  // NEW: pre-calendly session info state
  let sessionInfoOpen = false;
  let sessionPrefill: any = {};
  // NEW: enforce single subject selection for booking
  let selectedBookingSubject: string = '';
  // NEW: capture preferred subject from URL for preselection
  let preferredSubjectFromParam: string = '';
  
  // Subject categories
  const subjectCategories = [
    {
      name: "AP Capstone Diploma Program",
      subjects: ["AP Research", "AP Seminar"]
    },
    {
      name: "AP Arts",
      subjects: ["AP 2-D Art and Design", "AP 3-D Art and Design", "AP Drawing", "AP Art History", "AP Music Theory"]
    },
    {
      name: "AP English",
      subjects: ["AP English Language and Composition", "AP English Literature and Composition"]
    },
    {
      name: "AP History and Social Sciences",
      subjects: [
        "AP African American Studies", "AP Comparative Government and Politics", "AP European History", 
        "AP Human Geography", "AP Macroeconomics", "AP Microeconomics", "AP Psychology", 
        "AP United States Government and Politics", "AP United States History", "AP World History: Modern"
      ]
    },
    {
      name: "AP Math and Computer Science",
      subjects: [
        "AP Calculus AB", "AP Calculus BC", "AP Computer Science A", 
        "AP Computer Science Principles", "AP Precalculus", "AP Statistics"
      ]
    },
    {
      name: "AP Sciences",
      subjects: [
        "AP Biology", "AP Chemistry", "AP Environmental Science", "AP Physics 1: Algebra-Based",
        "AP Physics 2: Algebra-Based", "AP Physics C: Electricity and Magnetism", "AP Physics C: Mechanics"
      ]
    },
    {
      name: "AP World Languages and Cultures",
      subjects: [
        "AP Chinese Language and Culture", "AP French Language and Culture", "AP German Language and Culture",
        "AP Italian Language and Culture", "AP Japanese Language and Culture", "AP Latin",
        "AP Spanish Language and Culture", "AP Spanish Literature and Culture"
      ]
    },
    {
      name: "High School Core Subjects",
      subjects: [
        "Algebra I", "Algebra II", "Geometry", "Precalculus", "Trigonometry", 
        "English 9", "English 10", "English 11", "English 12", 
        "Biology", "Chemistry", "Physics", "Earth Science",
        "World History", "U.S. History", "Government/Civics", "Economics"
      ]
    },
    {
      name: "High School Electives",
      subjects: [
        "Creative Writing", "Journalism", "Speech and Debate", "Film Studies",
        "Computer Science", "Web Design", "Robotics", 
        "Psychology", "Sociology", "Personal Finance"
      ]
    },
    {
      name: "Middle School Core Subjects",
      subjects: [
        "6th Grade Math", "7th Grade Math", "8th Grade Math", "Pre-Algebra",
        "6th Grade English", "7th Grade English", "8th Grade English",
        "6th Grade Science", "7th Grade Science", "8th Grade Science",
        "6th Grade Social Studies", "7th Grade Social Studies", "8th Grade Social Studies"
      ]
    },
    {
      name: "Middle School Electives",
      subjects: [
        "Beginning Band", "Choir", "Art", "Drama",
        "Computer Applications", "Health", "Physical Education",
        "Study Skills", "Foreign Language Introduction"
      ]
    },
    {
      name: "Elementary Subjects",
      subjects: [
        "Elementary Reading", "Elementary Writing", "Elementary Math",
        "Elementary Science", "Elementary Social Studies"
      ]
    }
  ];
  
  // Function to handle subject selection
  function toggleSubject(subject: string) {
    const index = selectedSubjects.indexOf(subject);
    if (index === -1) {
      selectedSubjects = [...selectedSubjects, subject];
    } else {
      selectedSubjects = selectedSubjects.filter(s => s !== subject);
    }
  }
  
  // Function to save selected subjects
  function saveSelectedSubjects() {
    form.subjects = selectedSubjects.join(', ');
    subjectsModalOpen = false;
  }
  
  // Function to open subjects modal and initialize selected subjects
  function openSubjectsModal() {
    // Parse existing subjects from form
    if (form.subjects) {
      selectedSubjects = form.subjects.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      selectedSubjects = [];
    }
    searchQuery = '';
    subjectsModalOpen = true;
  }
  
  // Function to filter subjects based on search query
  function getFilteredCategories() {
    if (!searchQuery.trim()) {
      return subjectCategories;
    }
    
    const query = searchQuery.toLowerCase();
    return subjectCategories.map(category => {
      return {
        name: category.name,
        subjects: category.subjects.filter(
          subject => subject.toLowerCase().includes(query)
        )
      };
    }).filter(category => category.subjects.length > 0);
  }
  
  // Modal states
  let modalOpen = false;
  let subjectsModalDetailOpen = false; // Modal for viewing all subjects
  let selectedTutor: Tutor | null = null;
  let isEditing = false; // Track if we're in edit mode
  
  // Function to open the tutor profile modal
  function openTutorProfile(tutor: Tutor) {
    selectedTutor = tutor;
    modalOpen = true;
    isEditing = false; // Reset edit mode when opening modal
  }
  
  // Function to open the subjects detail modal
  function openSubjectsDetailModal(tutor: Tutor) {
    if (tutor) {
      selectedTutor = tutor;
      subjectsModalDetailOpen = true;
    }
  }
  
  // Function to open the booking modal with Calendly
  function openBookingModal() {
    if (selectedTutor) {
      // If we don't have any subjects selected yet, use the subjects from the tutor
      if (selectedSubjects.length === 0 && selectedTutor.subjects) {
        // Default to first subject if available
        if (selectedTutor.subjects.length > 0) {
          selectedSubjects = [selectedTutor.subjects[0]];
        }
      }
      bookingModalOpen = true;
    }
  }
  
  // Function to open the subject selection modal before booking
  function openSubjectSelectionModal(tutor: Tutor) {
    selectedTutor = tutor;
    // Initialize single selected subject for booking, preferring URL param if tutor teaches it
    const list = (tutor.subjects || []) as string[];
    const match = preferredSubjectFromParam
      ? (list.find(s => s.toLowerCase() === preferredSubjectFromParam.toLowerCase()) ||
         list.find(s => s.toLowerCase().includes(preferredSubjectFromParam.toLowerCase())) || '')
      : '';
    selectedBookingSubject = match || list[0] || '';
    subjectSelectionModalOpen = true;
  }

  // Function to get a dynamic Calendly URL for a tutor
  function getCalendlyUrl(tutor: Tutor | null): string {
    if (!tutor) return '';
    const raw = (tutor.calendlyLink || '').trim();
    if (!raw) return '';

    // Normalize to a full https URL
    let normalized = raw;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    if (!/calendly\.com/i.test(normalized)) {
      // If it's just a slug/username, build a Calendly URL
      normalized = `https://calendly.com/${normalized.replace(/^\/+/, '')}`;
    }

    try {
      const url = new URL(normalized);
      url.searchParams.set('hide_gdpr_banner', '1');
      return url.toString();
    } catch (e) {
      console.warn('Invalid Calendly URL for tutor:', tutor?.name, raw, e);
      return '';
    }
  }
  
  // Secret code detection
  let keyBuffer: string[] = [];
  const secretCode = "admin1";
  let secretActivated = false;
  
  // Load tutors directly from Firestore with verbose logging
  onMount(() => {
    // Capture subject from URL (if coming from Subjects/front page)
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      const subjectParam = urlParams.get('subject');
      preferredSubjectFromParam = subjectParam ? decodeURIComponent(subjectParam) : '';
    }

    const loadTutors = async () => {
      try {
        loading = true;
        console.log("Starting to load tutors from Firestore...");
        
        // Get tutors from Firestore
        const tutorsCollection = collection(db, "tutors");
        const querySnapshot = await getDocs(tutorsCollection);
        
        // Process tutor data
        tutors = querySnapshot.docs.map(doc => {
          const data = doc.data();
          let formattedSubjects: string[] = [];
          
          // Normalize subjects data
          if (Array.isArray(data.subjects)) {
            formattedSubjects = [...data.subjects];
          } else if (typeof data.subjects === 'string') {
            formattedSubjects = data.subjects.split(',').map(s => s.trim()).filter(Boolean);
          } else if (data.subjects && typeof data.subjects === 'object') {
            formattedSubjects = Object.values(data.subjects).filter(s => typeof s === 'string');
          }
          
          return {
            id: doc.id,
            name: data.name || "Unknown",
            subjects: formattedSubjects,
            education: data.education || "",
            experience: data.experience || "",
            bio: data.bio || "",
            image: data.image || `https://placehold.co/200x200?text=${encodeURIComponent((data.name || '?').charAt(0))}`,
            calendlyLink: data.calendlyLink || ""
          };
        });
        
        console.log(`Loaded ${tutors.length} tutors successfully.`);
        loading = false;
      } catch (err) {
        console.error("Error loading tutors:", err);
        error = err instanceof Error ? err.message : "Failed to load tutors";
        loading = false;
      }
    };
    
    // Start loading tutors
    loadTutors();
    
    // Set up keyboard listener for secret code
    const handleKeyPress = (event: KeyboardEvent) => {
      // Skip if user is typing in an input field, textarea, or similar
      if (event.target instanceof HTMLElement) {
        const tagName = event.target.tagName.toLowerCase();
        if (['input', 'textarea', 'select'].includes(tagName) || 
            event.target.isContentEditable) {
          return;
        }
      }
      
      // Add the pressed key to the buffer
      keyBuffer.push(event.key.toLowerCase());
      
      // Keep the buffer at the same length as our secret code
      if (keyBuffer.length > secretCode.length) {
        keyBuffer.shift();
      }
      
      // Check if the buffer matches our secret code
      const currentInput = keyBuffer.join('');
      if (currentInput === secretCode) {
        console.log('Secret admin code activated');
        secretActivated = true;
        showForm = true;
        
        // Visual feedback animation
        showSecretCodeFeedback();
        
        // Reset the buffer
        keyBuffer = [];
      }
    };
    
    // Add and later remove the event listener
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  });

  // Form state for adding new tutors
  let showForm = false;
  
  // Initialize form data
  let form = {
    name: '',
    subjects: '',
    education: '',
    experience: '',
    bio: '',
    image: '',
    calendlyLink: ''
  };
  
  // Form validation errors
  type FormErrors = {
    name?: string;
    subjects?: string;
    education?: string;
    experience?: string;
    bio?: string;
    image?: string;
    calendlyLink?: string;
  };
  let errors: FormErrors = {};
  
  // Reset form to initial state
  function resetForm() {
    form = { 
      name: '',
      subjects: '',
      education: '',
      experience: '',
      bio: '',
      image: '',
      calendlyLink: ''
    };
    errors = {};
  }
  
  // Close form function (since form can only be opened via secret code)
  function closeForm() {
    showForm = false;
    isEditing = false; // Reset editing state
    resetForm();
  }
  
  // Show visual feedback when secret code is activated
  let showSecretNotification = false;
  function showSecretCodeFeedback() {
    showSecretNotification = true;
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      showSecretNotification = false;
    }, 3000);
  }
  
  // Function to refresh tutors data (used after adding a new tutor)
  async function refreshTutorsData() {
    try {
      loading = true;
      const tutorsCollection = collection(db, "tutors");
      const querySnapshot = await getDocs(tutorsCollection);
      
      tutors = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Process subjects data
        let formattedSubjects: string[] = [];
        if (Array.isArray(data.subjects)) {
          formattedSubjects = [...data.subjects];
        } else if (typeof data.subjects === 'string') {
          formattedSubjects = data.subjects.split(',').map(s => s.trim()).filter(Boolean);
        } else if (data.subjects && typeof data.subjects === 'object') {
          formattedSubjects = Object.values(data.subjects);
        }
        
        return {
          id: doc.id,
          name: data.name || "Unknown",
          subjects: formattedSubjects,
          education: data.education || "",
          experience: data.experience || "",
          bio: data.bio || "",
          image: data.image || `https://placehold.co/200x200?text=${encodeURIComponent((data.name || '?').charAt(0))}`
        };
      });
      
      loading = false;
    } catch (err) {
      console.error("Error refreshing tutors:", err);
      error = err instanceof Error ? err.message : "Failed to load tutors";
      loading = false;
    }
  }
  
  // Validate form data
  function validateForm() {
    errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.subjects.trim()) errors.subjects = 'At least one subject is required';
    if (!form.education.trim()) errors.education = 'Education is required';
    if (!form.experience.trim()) errors.experience = 'Experience is required';
    if (!form.bio.trim()) errors.bio = 'Bio is required';
    else if (form.bio.length > 500) errors.bio = 'Bio must be 500 characters or less';
    if (form.image && !/^https?:\/\/\S+$/i.test(form.image)) {
      errors.image = 'Image URL must be valid (or leave blank)';
    }
    if (form.calendlyLink && !/^https?:\/\/calendly\.com\/\S+$/i.test(form.calendlyLink)) {
      errors.calendlyLink = 'Calendly link must be a valid Calendly URL (e.g., https://calendly.com/username/event)';
    }
    return Object.keys(errors).length === 0;
  }
  
  // Add new tutor to Firestore
  async function addTutor() {
    if (!validateForm()) return;
    
    try {
      // Format tutor data for Firestore
      const newTutor = {
        name: form.name.trim(),
        subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean),
        education: form.education.trim(),
        experience: form.experience.trim(),
        bio: form.bio.trim(),
        image: form.image.trim() || `https://placehold.co/200x200?text=${encodeURIComponent(form.name.trim().split(' ').map(n=>n[0]||'').join('').toUpperCase())}`,
        calendlyLink: form.calendlyLink.trim()
      };
      
      console.log("Adding new tutor to Firestore:", newTutor);
      
      // Add to Firestore
      const tutorsCollection = collection(db, "tutors");
      const docRef = await addDoc(tutorsCollection, newTutor);
      console.log("Document written with ID:", docRef.id);
      
      // Refresh tutors list
      await refreshTutorsData();
      
      // Close form and reset
      showForm = false;
      resetForm();
      
      // Show success notification
      alert("Tutor added successfully!");
    } catch (err) {
      console.error('Error adding tutor:', err);
      alert('Failed to add tutor: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }
  
  // Start editing a tutor
  function startEditingTutor() {
    if (selectedTutor) {
      isEditing = true;
      // Populate form with selected tutor data
      form = {
        name: selectedTutor.name,
        subjects: selectedTutor.subjects.join(', '),
        education: selectedTutor.education,
        experience: selectedTutor.experience,
        bio: selectedTutor.bio,
        image: selectedTutor.image,
        calendlyLink: selectedTutor.calendlyLink || ''
      };
      // Close the modal
      modalOpen = false;
      // Show the form
      showForm = true;
    }
  }
  
  // Update an existing tutor
  async function updateTutor(tutorId: string) {
    if (!validateForm()) return;
    
    try {
      // Format tutor data for Firestore
      const updatedTutor = {
        name: form.name.trim(),
        subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean),
        education: form.education.trim(),
        experience: form.experience.trim(),
        bio: form.bio.trim(),
        image: form.image.trim() || `https://placehold.co/200x200?text=${encodeURIComponent(form.name.trim().split(' ').map(n=>n[0]||'').join('').toUpperCase())}`,
        calendlyLink: form.calendlyLink.trim()
      };
      
      console.log("Updating tutor in Firestore:", updatedTutor);
      
      // Update in Firestore
      const tutorDocRef = doc(db, "tutors", tutorId);
      await updateDoc(tutorDocRef, updatedTutor);
      console.log("Document updated with ID:", tutorId);
      
      // Refresh tutors list
      await refreshTutorsData();
      
      // Close form and reset
      showForm = false;
      isEditing = false;
      resetForm();
      
      // Show success notification
      alert("Tutor updated successfully!");
    } catch (err) {
      console.error('Error updating tutor:', err);
      alert('Failed to update tutor: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }
  
  // Delete a tutor
  async function deleteTutor(tutorId: string) {
    if (confirm("Are you sure you want to delete this tutor? This action cannot be undone.")) {
      try {
        // Delete from Firestore
        const tutorDocRef = doc(db, "tutors", tutorId);
        await deleteDoc(tutorDocRef);
        console.log("Document deleted with ID:", tutorId);
        
        // Refresh tutors list
        await refreshTutorsData();
        
        // Close modal
        modalOpen = false;
        
        // Show success notification
        alert("Tutor deleted successfully!");
      } catch (err) {
        console.error('Error deleting tutor:', err);
        alert('Failed to delete tutor: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    }
  }
  
  // Helper function to get the emoji for a subject string
  function getSubjectEmoji(subjectName: string): string {
    // Create a mock Subject object that matches the expected structure
    const mockSubject = { 
      name: subjectName, 
      category: '',
      id: '',
      description: '',
      level: '' 
    };
    
    // Use the getEmoji function from emojiUtils
    return getEmoji(mockSubject);
  }
</script>

<svelte:head>
  <title>Tutors | WiseOwl</title>
</svelte:head>

<!-- Secret Code Notification -->
{#if showSecretNotification}
  <div class="fixed top-5 right-5 bg-[#151f54] text-white py-2 px-4 rounded-md shadow-lg z-50 animate-fade-in-out">
    <div class="flex items-center space-x-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span>Admin mode activated - Tutor management enabled</span>
    </div>
  </div>
{/if}

<div class="max-w-6xl mx-auto px-4" class:secret-activated={secretActivated}>
  <!-- Hero Section -->
  <section class="relative z-[1] text-center mb-12">
    <h1 class="text-5xl font-extrabold text-[#151f54] mb-4 tracking-tight">Meet Our Tutors</h1>
    <p class="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-6">
      We have evaluated all of our tutors for their teaching skills and mastery of their subjects.
    </p>
  </section>

  <!-- Tutor Selection Process -->
  <div class="mb-12">
    <h2 class="text-3xl font-bold mb-6 text-[#151f54]">How We Select Our Tutors</h2>

    <div class="grid md:grid-cols-3 gap-8">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-4xl mb-3">🎓</div>
        <h3 class="text-xl font-bold mb-2">Academic Excellence</h3>
        <p>All tutors have advanced degrees in their subjects and proven academic track records.</p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-4xl mb-3">👨‍🏫</div>
        <h3 class="text-xl font-bold mb-2">Teaching Experience</h3>
        <p>We require significant teaching experience and conduct sample lessons before hiring.</p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-4xl mb-3">💭</div>
        <h3 class="text-xl font-bold mb-2">Communication Skills</h3>
        <p>Our tutors excel at explaining complex concepts in clear, understandable ways.</p>
      </div>
    </div>
  </div>

  <!-- Tutors -->
  <div class="mb-6">
    <h2 class="text-3xl font-bold text-[#151f54]">Tutors</h2>
  </div>

  <!-- Add Tutor Form -->
  {#if showForm}
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200 transition-all duration-300">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-[#151f54]">{isEditing ? 'Edit Tutor' : 'Add New Tutor'}</h3>
        <button 
          class="text-gray-400 hover:text-gray-600"
          on:click={closeForm}
          aria-label="Close form">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Name Field -->
        <div class="form-group">
          <label for="tutor-name" class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            id="tutor-name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:border-[#151f54]"
            placeholder="John Doe"
            bind:value={form.name}
          />
          {#if errors.name}
            <p class="mt-1 text-sm text-red-600">{errors.name}</p>
          {/if}
        </div>

        <!-- Subjects Field -->
        <div class="form-group">
          <label for="tutor-subjects" class="block text-sm font-medium text-gray-700 mb-1">Subjects *</label>
          <div class="flex items-center space-x-2">
            <div class="flex-grow relative">
              <button 
                type="button"
                class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm bg-gray-50 min-h-[2.5rem] max-h-[5rem] overflow-y-auto text-left flex flex-col justify-center"
                aria-label="Selected subjects"
                on:click={openSubjectsModal}
              >
                {#if form.subjects}
                  <div class="flex flex-wrap gap-1">
                    {#each form.subjects.split(',').map(s => s.trim()).filter(Boolean) as subject}
                      <span class="bg-[#e8eaf6] text-[#151f54] text-xs px-2 py-1 rounded-full inline-block mb-1 shadow-sm">
                        {subject}
                      </span>
                    {/each}
                  </div>
                  <div class="mt-1 text-xs text-gray-500">
                    {form.subjects.split(',').filter(Boolean).length} subject{form.subjects.split(',').filter(Boolean).length !== 1 ? 's' : ''} selected • Click "Select Classes" to modify
                  </div>
                {:else}
                  <span class="text-gray-400">No subjects selected • Click "Select Classes" button to choose subjects</span>
                {/if}
              </button>
            </div>
            <button
              type="button"
              class="self-center h-8 px-2 flex items-center bg-[#151f54] hover:bg-[#212d6e] text-white rounded-md shadow-sm text-xs whitespace-nowrap flex-shrink-0 transition-colors"
              on:click={openSubjectsModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Select
            </button>
          </div>
          {#if errors.subjects}
            <p class="mt-1 text-sm text-red-600">{errors.subjects}</p>
          {/if}
        </div>
        
        <!-- Education Field -->
        <div class="form-group">
          <label for="tutor-education" class="block text-sm font-medium text-gray-700 mb-1">Education *</label>
          <input
            id="tutor-education"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:border-[#151f54]"
            placeholder="Ph.D. in Mathematics, MIT"
            bind:value={form.education}
          />
          {#if errors.education}
            <p class="mt-1 text-sm text-red-600">{errors.education}</p>
          {/if}
        </div>
        
        <!-- Experience Field -->
        <div class="form-group">
          <label for="tutor-experience" class="block text-sm font-medium text-gray-700 mb-1">Experience *</label>
          <input
            id="tutor-experience"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:border-[#151f54]"
            placeholder="10+ years teaching high school and college mathematics"
            bind:value={form.experience}
          />
          {#if errors.experience}
            <p class="mt-1 text-sm text-red-600">{errors.experience}</p>
          {/if}
        </div>
        
        <!-- Bio Field (Full Width) -->
        <div class="form-group md:col-span-2">
          <div class="flex justify-between items-center mb-1">
            <label for="tutor-bio" class="block text-sm font-medium text-gray-700">Bio *</label>
            <span class={form.bio.length > 500 ? 'text-xs font-medium text-red-600' : form.bio.length > 400 ? 'text-xs font-medium text-amber-600' : 'text-xs font-medium text-green-600'}>
              {form.bio.length}/500 characters
            </span>
          </div>
          <textarea
            id="tutor-bio"
            class={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:border-[#151f54] ${form.bio.length > 500 ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
            rows="4"
            placeholder="Brief description of the tutor's background, teaching philosophy, etc."
            bind:value={form.bio}
          ></textarea>
          {#if errors.bio}
            <p class="mt-1 text-sm text-red-600">{errors.bio}</p>
          {:else if form.bio.length > 500}
            <p class="mt-1 text-sm text-red-600">Bio exceeds the 500 character limit.</p>
          {/if}
        </div>
        
        <!-- Image URL Field (Full Width) -->
        <div class="form-group md:col-span-2">
          <label for="tutor-image" class="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
          <input
            id="tutor-image"
            type="url"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:border-[#151f54]"
            placeholder="https://example.com/image.jpg"
            bind:value={form.image}
          />
          {#if errors.image}
            <p class="mt-1 text-sm text-red-600">{errors.image}</p>
          {/if}
          <p class="mt-1 text-xs text-gray-500">If left blank, a placeholder with the tutor's initials will be used.</p>
        </div>
        
        <!-- Calendly Link Field -->
        <div class="form-group md:col-span-2">
          <label for="tutor-calendly" class="block text-sm font-medium text-gray-700 mb-1">Calendly Link (optional)</label>
          <input
            id="tutor-calendly"
            type="url"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:border-[#151f54]"
            placeholder="https://calendly.com/username/tutoring"
            bind:value={form.calendlyLink}
          />
          {#if errors.calendlyLink}
            <p class="mt-1 text-sm text-red-600">{errors.calendlyLink}</p>
          {/if}
          <p class="mt-1 text-xs text-gray-500">Your personal Calendly scheduling link for booking sessions.</p>
        </div>
      </div>
      
      <!-- Tutor Preview Section -->
      <div class="mt-6">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Preview</h4>
        <div class="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div class="flex flex-col md:flex-row">
            <div class="md:w-1/3 aspect-square">
              <img
                src={form.image || `https://placehold.co/400x400?text=${encodeURIComponent((form.name || 'New Tutor').split(' ').map(n=>n[0]||'').join('').toUpperCase())}`}
                alt="Tutor preview"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-4 md:w-2/3">
              <h3 class="text-xl font-bold">{form.name || 'Tutor Name'}</h3>
              <p class="text-gray-600">{form.education || 'Education'}</p>
              <p class="mt-2">
                <strong>Subjects:</strong> {form.subjects || 'No subjects specified'}
              </p>
              <p class="mt-1">
                <strong>Experience:</strong> {form.experience || 'No experience specified'}
              </p>
              <p class="mt-2 text-sm">{form.bio || 'No bio provided yet.'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Form Actions -->
      <div class="mt-6 flex justify-end space-x-3">
        <button
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          on:click={closeForm}>
          Cancel
        </button>
        {#if isEditing && selectedTutor}
          <button
            class="px-4 py-2 bg-[#151f54] hover:bg-[#212d6e] text-white rounded-md shadow-sm"
            on:click={() => {
              if (selectedTutor && selectedTutor.id) {
                updateTutor(selectedTutor.id);
              } else {
                console.error('Cannot update tutor: Invalid tutor ID');
                alert('Error: Unable to update tutor due to missing ID.');
              }
            }}>
            Update Tutor
          </button>
        {:else}
          <button
            class="px-4 py-2 bg-[#151f54] hover:bg-[#212d6e] text-white rounded-md shadow-sm"
            on:click={addTutor}>
            Add Tutor
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Featured Tutors Grid -->
  <div class="mb-12">
    {#if loading}
      <div class="bg-white rounded-lg p-8 text-center shadow-md">
        <div class="animate-spin inline-block w-12 h-12 border-4 border-current border-t-transparent text-[#151f54] rounded-full mb-4" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <h3 class="text-2xl font-bold mb-2">Loading Tutors</h3>
        <p class="text-gray-600">Please wait while we fetch our tutor profiles...</p>
      </div>
    {:else if error}
      <div class="bg-white rounded-lg p-8 text-center shadow-md border-l-4 border-red-500">
        <div class="text-5xl mb-4 text-red-500">⚠️</div>
        <h3 class="text-2xl font-bold mb-2">Error Loading Tutors</h3>
        <p class="text-red-600 mb-4">{error}</p>
        <button class="bg-[#151f54] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#212d6e] shadow"
          on:click={refreshTutorsData}>Try Again</button>
      </div>
    {:else if tutors.length > 0}
      <div class="grid md:grid-cols-2 gap-8">
        {#each tutors as tutor (tutor.id)}
          <div class="bg-white rounded-lg overflow-hidden shadow-md flex">
            <div class="w-1/3">
              <img src={tutor.image} alt={tutor.name} class="w-full h-full object-cover" />
            </div>
            <div class="w-2/3 p-6 relative flex flex-col">
              <div class="flex-grow">
                <h3 class="text-2xl font-bold mb-2">{tutor.name}</h3>
                <p class="text-gray-600 mb-2">{tutor.education}</p>
                <div class="mb-2">
                  <div class="flex items-center gap-1">
                    <strong>Subjects:</strong>
                    {#if tutor.subjects && tutor.subjects.length > 10}
                      <button
                        class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full hover:bg-blue-200 transition-colors"
                        on:click|stopPropagation={() => openSubjectsDetailModal(tutor)}
                      >
                        Show all ({tutor.subjects.length})
                      </button>
                    {/if}
                  </div>
                  {#if tutor.subjects && tutor.subjects.length > 0}
                    <div class="text-sm">
                      {tutor.subjects.slice(0, 10).join(", ")}
                      {#if tutor.subjects.length > 10}
                        <span class="text-gray-500">... and {tutor.subjects.length - 10} more</span>
                      {/if}
                    </div>
                  {:else}
                    <span>Not specified</span>
                  {/if}
                </div>
                <p class="mb-2"><strong>Experience:</strong> {tutor.experience}</p>
                <p class="line-clamp-2 text-sm mb-3">{tutor.bio}</p>
              </div>
              <div class="flex justify-end">
                <button
                  class="bg-[#151f54] text-white px-5 py-2 rounded-md hover:bg-[#212d6e] transition-colors flex items-center font-medium"
                  on:click={() => openTutorProfile(tutor)}
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="bg-white rounded-lg p-8 text-center shadow-md">
        <div class="text-5xl mb-4">👩‍🏫</div>
        <h3 class="text-2xl font-bold mb-2">No Tutors Available</h3>
        <p class="text-gray-600 mb-4">No tutors found in the database. Please check back later.</p>
      </div>
    {/if}
  </div>

  <!-- Tutor Profile Modal -->
  {#if modalOpen && selectedTutor}
    <Modal bind:open={modalOpen}>
      <svelte:fragment slot="header">
        <div class="flex items-center w-full">
          <div class="flex items-center flex-grow">
            <h2 class="text-2xl font-bold text-[#151f54]">{selectedTutor.name}</h2>
            {#if selectedTutor.subjects && selectedTutor.subjects.length > 0}
              <span class="ml-3 px-3 py-1 bg-blue-50 text-blue-800 text-xs rounded-full">
                {selectedTutor.subjects[0]}
                {#if selectedTutor.subjects.length > 1}
                  +{selectedTutor.subjects.length - 1} more
                {/if}
              </span>
            {/if}
          </div>
          
          {#if secretActivated}
            <div class="flex space-x-2">
              <button
                class="px-3 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 flex items-center shadow-sm transition-colors"
                on:click={startEditingTutor}
                title="Edit Tutor"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span class="font-medium text-sm">Edit</span>
              </button>
              <button
                class="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center shadow-sm transition-colors"
                on:click={() => selectedTutor && selectedTutor.id ? deleteTutor(selectedTutor.id) : null}
                title="Delete Tutor"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span class="font-medium text-sm">Delete</span>
              </button>
            </div>
          {/if}
        </div>
      </svelte:fragment>
      
      <svelte:fragment slot="content">
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Tutor Image -->
          <div class="md:w-1/3">
            <img 
              src={selectedTutor.image} 
              alt={selectedTutor.name} 
              class="w-full aspect-square object-cover rounded-lg shadow-md"
            />
            
            <div class="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-semibold text-lg">Subjects</h3>
                {#if selectedTutor.subjects && selectedTutor.subjects.length > 0}
                  <button 
                    class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    on:click={() => selectedTutor && openSubjectsDetailModal(selectedTutor)}
                  >
                    <span>View all</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                {/if}
              </div>
              
              {#if selectedTutor.subjects && selectedTutor.subjects.length > 0}
                <div class="flex flex-wrap gap-2">
                  {#each selectedTutor.subjects.slice(0, 5) as subject}
                    <span class="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm">
                      {subject}
                    </span>
                  {/each}
                  {#if selectedTutor.subjects.length > 5}
                    <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      +{selectedTutor.subjects.length - 5} more
                    </span>
                  {/if}
                </div>
              {:else}
                <p class="text-gray-500">No subjects specified</p>
              {/if}
            </div>
          </div>
          
          <!-- Tutor Details -->
          <div class="md:w-2/3">
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-2">Education</h3>
              <p>{selectedTutor.education || 'Not specified'}</p>
            </div>
            
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-2">Experience</h3>
              <p>{selectedTutor.experience || 'Not specified'}</p>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-2">About</h3>
              <p class="whitespace-pre-line">{selectedTutor.bio || 'No biography available.'}</p>
            </div>
          </div>
        </div>
      </svelte:fragment>
      
      <svelte:fragment slot="footer">
        <div class="flex justify-between w-full">
          <button
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:ring-offset-2"
            on:click={() => modalOpen = false}
          >
            Close
          </button>
          
          <button 
            class="px-4 py-2 bg-[#151f54] text-white rounded-md hover:bg-[#212d6e] focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:ring-offset-2 flex items-center"
            on:click={openSubjectSelectionModal.bind(null, selectedTutor)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a1 1 0 100-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
            </svg>
            Book a Session
          </button>
        </div>
      </svelte:fragment>
    </Modal>
  {/if}

<!-- Call to Action -->
  <div class="bg-blue-50 border-l-4 border-blue-500 p-8 rounded-lg shadow-md mb-12">
    <h2 class="text-2xl font-bold mb-3">Ready to Learn with Our Expert Tutors?</h2>
    <p class="mb-4">Schedule a session with one of our tutors and experience the difference personalized education can make.</p>
    <a href="/booking" class="bg-[#151f54] text-white px-6 py-3 rounded-md font-bold hover:bg-[#212d6e] transition-colors inline-block">Book a Session</a>
  </div>

  <!-- Testimonials -->
  <div class="mb-12">
    <h2 class="text-3xl font-bold mb-6 text-[#151f54]">What Our Students Say</h2>

    <div class="grid md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex items-center mb-4">
          <div class="text-yellow-400 text-2xl">★★★★★</div>
        </div>
        <p class="italic mb-4">"My tutor helped me go from struggling with calculus to acing my AP exam. Their patience and clear explanations made all the difference."</p>
        <p class="font-bold">- Alex T., High School Senior</p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex items-center mb-4">
          <div class="text-yellow-400 text-2xl">★★★★★</div>
        </div>
        <p class="italic mb-4">"The biology tutoring helped me understand complex concepts that my textbooks couldn't explain. They made learning fun and interesting!"</p>
        <p class="font-bold">- Maya R., College Freshman</p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex items-center mb-4">
          <div class="text-yellow-400 text-2xl">★★★★★</div>
        </div>
        <p class="italic mb-4">"The programming lessons were exactly what I needed to switch careers into tech. My tutor explains coding in a way that finally made sense to me."</p>
        <p class="font-bold">- Jamie K., Career Changer</p>
      </div>
    </div>
  </div>
</div>

<!-- Subject Selection Modal -->
{#if subjectsModalOpen}
  <div class="fixed inset-0 bg-gray-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
    <div class="bg-white rounded-lg shadow-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] flex flex-col animate-fadeIn">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-xl font-bold text-[#151f54]">Select Subjects</h3>
        <button 
          class="text-gray-400 hover:text-gray-600"
          on:click={() => subjectsModalOpen = false}
          aria-label="Close modal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Search Bar -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:border-[#151f54]"
            placeholder="Search subjects..."
            bind:value={searchQuery}
          />
        </div>
        
        <div class="mt-2">
          {#if selectedSubjects.length > 0}
            <div class="mb-1 flex items-center justify-between">
              <span class="text-sm text-gray-600 font-medium">{selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected</span>
              {#if selectedSubjects.length > 0}
                <button 
                  class="text-xs text-[#151f54] hover:text-red-600 underline"
                  on:click={() => selectedSubjects = []}
                >
                  Clear all
                </button>
              {/if}
            </div>
            <div class="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border border-gray-200 rounded-md bg-gray-50">
              {#each selectedSubjects as subject}
                <div class="bg-[#151f54] text-white text-xs font-medium px-2 py-1 rounded-full flex items-center group shadow-sm">
                  {subject}
                  <button 
                    class="ml-1 focus:outline-none opacity-70 group-hover:opacity-100 hover:bg-[#0f183e] rounded-full" 
                    on:click={() => toggleSubject(subject)}
                    aria-label="Remove {subject}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-sm text-gray-500">No subjects selected yet. Choose from the categories below.</p>
          {/if}
        </div>
      </div>
      
      <!-- Subject Categories -->
      <div class="overflow-y-auto flex-grow p-6">
        {#each getFilteredCategories() as category}
          {#if category.subjects.length > 0}
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-[#151f54] mb-2">{category.name}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {#each category.subjects as subject}
                  <label 
                    class="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer {selectedSubjects.includes(subject) ? 'bg-blue-50 border border-blue-200' : ''}" 
                    title={subject}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedSubjects.includes(subject)}
                      on:change={() => toggleSubject(subject)}
                      class="rounded text-[#151f54] focus:ring-[#151f54]"
                    />
                    <span class="text-sm {selectedSubjects.includes(subject) ? 'font-medium text-[#151f54]' : ''}">{subject}</span>
                  </label>
                {/each}
              </div>
            </div>
          {/if}
        {/each}
        
        {#if getFilteredCategories().length === 0 || getFilteredCategories().every(cat => cat.subjects.length === 0)}
          <div class="text-center py-10 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="mt-2 text-lg font-medium">No subjects found matching your search</p>
            <p class="mt-1">Try a different search term or clear the search</p>
          </div>
        {/if}
      </div>
      
      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">{selectedSubjects.length} subjects selected</span>
          {#if selectedSubjects.length > 0}
            <button
              class="text-xs text-red-600 hover:text-red-800 underline"
              on:click={() => selectedSubjects = []}
            >
              Clear all
            </button>
          {/if}
        </div>
        <div class="flex space-x-2">
          <button
            class="h-9 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center transition-colors"
            on:click={() => subjectsModalOpen = false}
          >
            Cancel
          </button>
          <button
            class="h-9 px-4 bg-[#151f54] text-white rounded-md hover:bg-[#212d6e] flex items-center transition-colors"
            on:click={saveSelectedSubjects}
          >
            Apply Selection
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- All Subjects Modal -->
{#if subjectsModalDetailOpen && selectedTutor}
  <div class="fixed inset-0 bg-gray-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
    <div class="bg-white rounded-lg shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] flex flex-col animate-fadeIn">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-xl font-bold text-[#151f54]">{selectedTutor.name}'s Subjects</h3>
        <button 
          class="text-gray-400 hover:text-gray-600"
          on:click={() => subjectsModalDetailOpen = false}
          aria-label="Close modal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Subjects List -->
      <div class="overflow-y-auto custom-scrollbar p-6 flex-grow">
        {#if selectedTutor.subjects && selectedTutor.subjects.length > 0}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {#each selectedTutor.subjects as subject}
              <div class="p-2 bg-blue-50 rounded-lg border border-blue-100 text-[#151f54] flex items-center">
                <span class="text-xl mr-2">{getSubjectEmoji(subject)}</span>
                <span class="text-sm font-medium">{subject}</span>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-gray-500">
            <p>This tutor has not specified any subjects.</p>
          </div>
        {/if}
      </div>
      
      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
        <button
          class="px-4 py-2 bg-[#151f54] text-white rounded-md hover:bg-[#212d6e] transition-colors"
          on:click={() => subjectsModalDetailOpen = false}
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Subject Selection Modal (before booking) -->
{#if subjectSelectionModalOpen && selectedTutor}
  <Modal bind:open={subjectSelectionModalOpen}>
    <svelte:fragment slot="header">
      <div class="w-full">
        <h2 class="text-xl font-bold text-[#151f54]">Select a Subject with {selectedTutor.name}</h2>
      </div>
    </svelte:fragment>
    
    <svelte:fragment slot="content">
      <div class="py-4">
        <p class="text-gray-700 mb-6">
          Select one subject you'd like to work on with {selectedTutor.name}:
        </p>
        
        {#if selectedTutor.subjects && selectedTutor.subjects.length > 0}
          <!-- Selected subject display -->
          {#if selectedBookingSubject}
            <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h3 class="text-sm font-semibold text-blue-800 mb-2">Selected Subject</h3>
              <div class="flex items-center bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium w-fit gap-1.5">
                <span aria-hidden="true">{getSubjectEmoji(selectedBookingSubject)}</span>
                <span>{selectedBookingSubject}</span>
                <button 
                  class="ml-2 text-blue-500 hover:text-blue-700"
                  on:click={() => selectedBookingSubject = ''}
                  aria-label="Remove {selectedBookingSubject}"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          {/if}
          
          <!-- Subject cards section -->
          <div class="grid gap-3">
            <!-- AP Subjects Section -->
            {#if selectedTutor.subjects.some(s => s.includes('AP '))}
              <h3 class="text-lg font-semibold text-[#151f54] mt-2 mb-3">AP Subjects</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {#each selectedTutor.subjects.filter(s => s.includes('AP ')) as subject}
                  <button 
                    type="button"
                    class={`relative bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer p-4 flex flex-col text-left w-full ${selectedBookingSubject === subject ? 'ring-2 ring-blue-700 border-blue-700 bg-blue-50' : ''}`}
                    on:click={() => selectedBookingSubject = (selectedBookingSubject === subject ? '' : subject)}
                    aria-pressed={selectedBookingSubject === subject}
                  >
                    <div class="text-3xl mb-2">{getSubjectEmoji(subject)}</div>
                    <h3 class="text-base font-semibold text-[#151f54] mb-1">{subject.replace('AP ', '')}</h3>
                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full inline-block w-fit">
                      AP Course
                    </span>
                  </button>
                {/each}
              </div>
            {/if}
            
            <!-- Regular Subjects Section -->
            {#if selectedTutor.subjects.some(s => !s.includes('AP '))}
              <h3 class="text-lg font-semibold text-[#151f54] mt-2 mb-3">Regular Subjects</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {#each selectedTutor.subjects.filter(s => !s.includes('AP ')) as subject}
                  <button 
                    type="button"
                    class={`relative bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer p-4 flex flex-col text-left w-full ${selectedBookingSubject === subject ? 'ring-2 ring-blue-700 border-blue-700 bg-blue-50' : ''}`}
                    on:click={() => selectedBookingSubject = (selectedBookingSubject === subject ? '' : subject)}
                    aria-pressed={selectedBookingSubject === subject}
                  >
                    <div class="text-3xl mb-2">{getSubjectEmoji(subject)}</div>
                    <h3 class="text-base font-semibold text-[#151f54] mb-1">{subject}</h3>
                    <span class="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full inline-block w-fit">
                      Regular Course
                    </span>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {:else}
          <div class="col-span-full text-center py-8">
            <p class="text-gray-500">This tutor has no subjects specified.</p>
          </div>
        {/if}
      </div>
    </svelte:fragment>
    
    <svelte:fragment slot="footer">
      <div class="flex justify-between w-full">
        <button
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:ring-offset-2"
          on:click={() => subjectSelectionModalOpen = false}
        >
          Cancel
        </button>
        
        <button
          class="px-4 py-2 bg-[#151f54] text-white rounded-md hover:bg-[#212d6e] transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#151f54]"
          on:click={() => {
            subjectSelectionModalOpen = false;
            // NEW: open session info modal prior to Calendly
            sessionInfoOpen = true;
          }}
          disabled={selectedTutor.subjects && selectedTutor.subjects.length > 0 && !selectedBookingSubject}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
          </svg>
          Continue
        </button>
      </div>
    </svelte:fragment>
  </Modal>
{/if}

<!-- Booking Modal (Calendly) -->
{#if bookingModalOpen && selectedTutor}
  <Modal bind:open={bookingModalOpen}>
    <svelte:fragment slot="header">
      <div class="w-full">
        <h2 class="text-xl font-bold text-[#151f54]">Book a Session with {selectedTutor.name}</h2>
      </div>
    </svelte:fragment>
    
    <svelte:fragment slot="content">
      <div class="py-4">
        {#if selectedBookingSubject}
          <div class="mb-6">
            <h3 class="font-medium text-gray-700 mb-2">Selected Subject:</h3>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1.5">
                <span aria-hidden="true">{getSubjectEmoji(selectedBookingSubject)}</span>
                <span>{selectedBookingSubject}</span>
              </span>
            </div>
          </div>
        {/if}
        
        {#if getCalendlyUrl(selectedTutor)}
          <p class="text-gray-700 mb-4">
            Choose a time slot that works for you to schedule a session with {selectedTutor.name}.
          </p>
          
          <!-- Calendly inline widget using component with prefill -->
          <CalendlyWidget url={getCalendlyUrl(selectedTutor)} prefill={sessionPrefill} utm={{}} />
        {:else}
          <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Booking Not Available</h3>
            <p class="text-gray-600 max-w-md">
              {selectedTutor.name} is currently not available for direct booking. Please check back later or contact support for assistance.
            </p>
          </div>
        {/if}
      </div>
    </svelte:fragment>
    
    <svelte:fragment slot="footer">
      <div class="flex justify-end w-full">
        <button
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:ring-offset-2"
          on:click={() => bookingModalOpen = false}
        >
          Close
        </button>
      </div>
    </svelte:fragment>
  </Modal>
{/if}

<!-- NEW: Session Info Modal shown before Calendly -->
{#if sessionInfoOpen && selectedTutor}
  <SessionInfoModal
    bind:open={sessionInfoOpen}
    subject={selectedBookingSubject}
    on:submit={(e) => {

      sessionPrefill = buildCalendlyPrefill(e.detail.answers);
      bookingModalOpen = true;
    }}
    on:cancel={() => { sessionInfoOpen = false; }}
  />
{/if}

<style lang="css">
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
  
  /* Custom scrollbar styling for the subjects modal */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #a8a8a8;
  }
  
  /* Selected subject card styles */
  .selected-card {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  .ap-selected {
    background-color: #dbeafe; /* Light blue background */
    border-color: #93c5fd !important; /* Blue border */
  }
  .reg-selected {
    background-color: #dcfce7; /* Light green background */
    border-color: #86efac !important; /* Green border */
  }
  .selected-card h3 {
    font-weight: 700;
  }
  .selected-card {
    color: #1e3a8a;
  }
  /* Make sure all text in selected cards is visible */
  .selected-card * {
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  /* Enhance icon in selected cards */
  .selected-card .text-3xl {
    transform: scale(1.05);
  }
  
  /* Enhance tag in selected AP cards */
  .ap-selected .rounded-full {
    background-color: #bfdbfe;
    color: #1e40af;
    font-weight: 600;
  }
  
  /* Enhance tag in selected Regular cards */
  .reg-selected .rounded-full {
    background-color: #bbf7d0;
    color: #166534;
    font-weight: 600;
  }
</style>
