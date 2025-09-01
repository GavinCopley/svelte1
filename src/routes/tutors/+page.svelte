<script lang="ts"> 
  import { onMount } from 'svelte';
  import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import type { Tutor } from '$lib/services/tutorService';
  
  // Initialize tutors array with loading state
  let tutors: Tutor[] = [];
  let loading = true;
  let error = null;
  
  // Load tutors directly from Firestore with verbose logging
  onMount(async () => {
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
          return {
            id: doc.id,
            name: data.name || "Unknown",
            subjects: Array.isArray(data.subjects) ? data.subjects : [],
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
      console.error("Error details:", err.stack);
      error = err.message || "Failed to load tutors";
      loading = false;
    }
  });

  // Form state
  let showForm = false;

  let form = {
    name: '',
    subjects: '',
    education: '',
    experience: '',
    bio: '',
    image: ''
  };
  let errors = {};

  function resetForm() {
    form = { name:'', subjects:'', education:'', experience:'', bio:'', image:'' };
    errors = {};
  }

  function validate() {
    errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.subjects.trim()) errors.subjects = 'At least one subject';
    if (!form.education.trim()) errors.education = 'Education is required';
    if (!form.experience.trim()) errors.experience = 'Experience is required';
    if (!form.bio.trim()) errors.bio = 'Bio is required';
    if (form.image && !/^https?:\/\/\S+$/i.test(form.image)) {
      errors.image = 'Use a valid image URL (or leave blank)';
    }
    return Object.keys(errors).length === 0;
  }

  async function addTutor() {
    if (!validate()) return;

    try {
      const newTutor = {
        name: form.name.trim(),
        subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean),
        education: form.education.trim(),
        experience: form.experience.trim(),
        bio: form.bio.trim(),
        image: form.image.trim() || `https://placehold.co/200x200?text=${encodeURIComponent(form.name.split(' ').map(n=>n[0]||'').join('').toUpperCase())}`
      };
      
      console.log("Adding new tutor to Firestore:", newTutor);
      
      // Add directly to Firestore
      const tutorsCollection = collection(db, "tutors");
      const docRef = await addDoc(tutorsCollection, newTutor);
      console.log("Document written with ID:", docRef.id);
      
      // Refresh tutors with direct Firestore access
      const querySnapshot = await getDocs(tutorsCollection);
      tutors = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Unknown",
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
          education: data.education || "",
          experience: data.experience || "",
          bio: data.bio || "",
          image: data.image || `https://placehold.co/200x200?text=${encodeURIComponent((data.name || '?').charAt(0))}`
        };
      });
      
      resetForm();
      showForm = false;
    } catch (err) {
      console.error('Error adding tutor:', err);
      console.error('Error details:', err.stack);
      alert('Failed to add tutor: ' + (err.message || 'Unknown error'));
    }
  }
</script>

<svelte:head>
  <title>Tutors | WiseOwl</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4">
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
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-3xl font-bold text-[#151f54]">Featured Tutors</h2>
  </div>

  <!-- Inline Add Tutor Form -->
  {#if showForm}
    <div id="add-tutor-form" class="bg-white rounded-lg shadow-md p-6 mb-10 border border-gray-100">
      <h3 class="text-xl font-bold mb-4 text-[#151f54]">New Tutor</h3>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium mb-1">Full Name *</label>
          <input class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring" bind:value={form.name} />
          {#if errors.name}<p class="text-sm text-red-600 mt-1">{errors.name}</p>{/if}
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Subjects (comma-separated) *</label>
          <input class="w-full border rounded-md px-3 py-2" placeholder="e.g. Algebra, Physics" bind:value={form.subjects} />
          {#if errors.subjects}<p class="text-sm text-red-600 mt-1">{errors.subjects}</p>{/if}
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Education *</label>
          <input class="w-full border rounded-md px-3 py-2" placeholder="e.g. Ph.D. in ..." bind:value={form.education} />
          {#if errors.education}<p class="text-sm text-red-600 mt-1">{errors.education}</p>{/if}
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Experience *</label>
          <input class="w-full border rounded-md px-3 py-2" placeholder="e.g. 10+ years ..." bind:value={form.experience} />
          {#if errors.experience}<p class="text-sm text-red-600 mt-1">{errors.experience}</p>{/if}
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">Bio *</label>
          <textarea class="w-full border rounded-md px-3 py-2 min-h-[90px]" bind:value={form.bio}></textarea>
          {#if errors.bio}<p class="text-sm text-red-600 mt-1">{errors.bio}</p>{/if}
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">Image URL (optional)</label>
          <input class="w-full border rounded-md px-3 py-2" placeholder="https://..." bind:value={form.image} />
          {#if errors.image}<p class="text-sm text-red-600 mt-1">{errors.image}</p>{/if}
        </div>
      </div>

      <!-- Live preview -->
      <div class="mt-6">
        <p class="text-sm text-gray-600 mb-2">Preview</p>
        <div class="bg-gray-50 rounded-lg overflow-hidden shadow-sm border">
          <div class="flex">
            <div class="w-1/3">
              <img
                src={form.image || `https://placehold.co/200x200?text=${encodeURIComponent((form.name || 'Tutor').split(' ').map(n=>n[0]||'').join('').toUpperCase())}`}
                alt="Preview"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="w-2/3 p-4">
              <h4 class="text-lg font-bold mb-1">{form.name || 'Full Name'}</h4>
              <p class="text-gray-600 mb-1">{form.education || 'Education'}</p>
              <p class="mb-1"><strong>Subjects:</strong> {(form.subjects || 'Subject 1, Subject 2')}</p>
              <p class="mb-1"><strong>Experience:</strong> {form.experience || 'Experience'}</p>
              <p class="text-sm">{form.bio || 'Short bio...'}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex gap-3">
        <button class="bg-[#151f54] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#212d6e] shadow"
          on:click={addTutor}>Save Tutor</button>
        <button class="px-4 py-2 rounded-md border hover:bg-gray-50"
          on:click={() => { resetForm(); showForm = false; }}>Cancel</button>
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
          on:click={() => window.location.reload()}>Try Again</button>
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
              <p class="mb-2"><strong>Subjects:</strong> {tutor.subjects.join(", ")}</p>
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
