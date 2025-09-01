<script lang="ts"> 
  import { onMount } from 'svelte';
  import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import type { Tutor } from '$lib/services/tutorService';
  
  // Initialize tutors array with loading state
  let tutors: Tutor[] = [];
  let loading = true;
  let error: string | null = null;
  
  // Secret code detection
  let keyBuffer: string[] = [];
  const secretCode = "admin1";
  let secretActivated = false;
  
  // Load tutors directly from Firestore with verbose logging
  onMount(() => {
    const loadTutors = async () => {
      try {
        loading = true;
        console.log("Attempting to load tutors from Firestore...");
        console.log("Firestore instance:", db ? "Available" : "Not Available");
        
        // Direct Firestore access for debugging
        const tutorsCollection = collection(db, "tutors");
        console.log("Collection reference created:", tutorsCollection);
        
        const querySnapshot = await getDocs(tutorsCollection);
        console.log("Firestore query complete. Documents found:", querySnapshot.size);
        
        if (querySnapshot.empty) {
          console.log("No tutors found in collection");
          tutors = [];
        } else {
          tutors = querySnapshot.docs.map(doc => {
            const data = doc.data();
            console.log("Document ID:", doc.id);
            console.log("Document data:", data);
            console.log("Subjects type:", typeof data.subjects, "Value:", data.subjects);
            
            // Handle different ways subjects might be stored in Firestore
            let formattedSubjects: string[] = [];
            
            if (Array.isArray(data.subjects)) {
              // Handle regular array
              formattedSubjects = [...data.subjects];
              console.log("Handled as array:", formattedSubjects);
            } else if (typeof data.subjects === 'string') {
              // Handle string format
              formattedSubjects = data.subjects.split(',').map(s => s.trim()).filter(Boolean);
              console.log("Handled as string:", formattedSubjects);
            } else if (data.subjects && typeof data.subjects === 'object') {
              // Handle object format (Firebase often converts arrays to objects with numeric keys)
              try {
                // Try to extract values and convert back to array
                formattedSubjects = Object.values(data.subjects);
                console.log("Handled as object:", formattedSubjects);
              } catch (e) {
                console.error("Error processing subjects as object:", e);
                formattedSubjects = [];
              }
            } else if (data.subject) {
              // Check if the field name might be singular instead of plural
              if (typeof data.subject === 'string') {
                formattedSubjects = [data.subject];
              } else if (Array.isArray(data.subject)) {
                formattedSubjects = [...data.subject];
              }
              console.log("Used singular 'subject' field:", formattedSubjects);
            } else {
              console.log("No subjects data found");
            }
            
            // Ensure we always have a valid array even if processing failed
            if (!Array.isArray(formattedSubjects)) {
              console.warn("Subjects is not an array after processing, defaulting to empty array");
              formattedSubjects = [];
            }
            
            // For safety, filter out any non-string values
            formattedSubjects = formattedSubjects.filter(s => typeof s === 'string');
            
            console.log("Final formatted subjects:", formattedSubjects);
            
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
          console.log("Processed tutors data:", tutors);
        }
        loading = false;
      } catch (err) {
        console.error("Error fetching tutors:", err);
        if (err instanceof Error) {
          console.error("Error details:", err.stack);
          error = err.message || "Failed to load tutors";
        } else {
          error = "Failed to load tutors";
        }
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
    image: ''
  };
  
  // Form validation errors
  type FormErrors = {
    name?: string;
    subjects?: string;
    education?: string;
    experience?: string;
    bio?: string;
    image?: string;
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
      image: ''
    };
    errors = {};
  }
  
  // Close form function (since form can only be opened via secret code)
  function closeForm() {
    showForm = false;
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
    if (form.image && !/^https?:\/\/\S+$/i.test(form.image)) {
      errors.image = 'Image URL must be valid (or leave blank)';
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
        image: form.image.trim() || `https://placehold.co/200x200?text=${encodeURIComponent(form.name.trim().split(' ').map(n=>n[0]||'').join('').toUpperCase())}`
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
  <div class="bg-[#151f54] text-white rounded-lg p-10 mb-12 shadow-lg">
    <h1 class="text-4xl font-bold mb-4">Meet Our Expert Tutors</h1>
    <p class="text-xl max-w-3xl">
      Learn from passionate educators who are experts in their fields. Our tutors are carefully selected
      for their deep subject knowledge and ability to connect with students.
    </p>
  </div>

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

  <!-- Featured Tutors -->
  <div class="mb-6">
    <h2 class="text-3xl font-bold text-[#151f54]">Featured Tutors</h2>
  </div>

  <!-- Add Tutor Form -->
  {#if showForm}
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200 transition-all duration-300">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-[#151f54]">Add New Tutor</h3>
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
          <label for="tutor-subjects" class="block text-sm font-medium text-gray-700 mb-1">Subjects (comma-separated) *</label>
          <input
            id="tutor-subjects"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:border-[#151f54]"
            placeholder="Mathematics, Physics, Chemistry"
            bind:value={form.subjects}
          />
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
          <label for="tutor-bio" class="block text-sm font-medium text-gray-700 mb-1">Bio *</label>
          <textarea
            id="tutor-bio"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:border-[#151f54]"
            rows="4"
            placeholder="Brief description of the tutor's background, teaching philosophy, etc."
            bind:value={form.bio}
          ></textarea>
          {#if errors.bio}
            <p class="mt-1 text-sm text-red-600">{errors.bio}</p>
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
        <button
          class="px-4 py-2 bg-[#151f54] hover:bg-[#212d6e] text-white rounded-md shadow-sm"
          on:click={addTutor}>
          Add Tutor
        </button>
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
            <div class="w-2/3 p-6">
              <h3 class="text-2xl font-bold mb-2">{tutor.name}</h3>
              <p class="text-gray-600 mb-2">{tutor.education}</p>
              <p class="mb-2">
                <strong>Subjects:</strong> 
                {#if tutor.subjects && tutor.subjects.length > 0}
                  {tutor.subjects.join(", ")}
                {:else}
                  Not specified
                {/if}
              </p>
              <p class="mb-2"><strong>Experience:</strong> {tutor.experience}</p>
              <p>{tutor.bio}</p>
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
