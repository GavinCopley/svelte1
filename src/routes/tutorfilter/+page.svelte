<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { collection, getDocs } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import type { Tutor } from '$lib/services/tutorService';
  import { Modal } from '$lib/components';
  
  // Initialize tutors array with loading state
  let tutors: Tutor[] = [];
  let filteredTutors: Tutor[] = [];
  let loading = true;
  let error: string | null = null;
  
  // Filter state
  let selectedSubjects: string[] = [];
  let searchQuery = '';
  let showFilters = true;
  
  // Modal state
  let modalOpen = false;
  let selectedTutor: Tutor | null = null;
  let subjectsModalOpen = false; // For showing all subjects
  
  // Subject categories from the existing tutors page
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
  
  // Get all unique subjects
  const allSubjects = subjectCategories.flatMap(category => category.subjects);
  
  // Function to open the tutor profile modal
  function openTutorProfile(tutor: Tutor) {
    selectedTutor = tutor;
    modalOpen = true;
  }
  
  // Function to open the subjects detail modal
  function openSubjectsDetail(tutor: Tutor, event: MouseEvent) {
    event.stopPropagation(); // Prevent the main card click from firing
    selectedTutor = tutor;
    subjectsModalOpen = true;
  }
  
  // Function to toggle a subject filter
  function toggleSubjectFilter(subject: string) {
    const index = selectedSubjects.indexOf(subject);
    if (index === -1) {
      selectedSubjects = [...selectedSubjects, subject];
    } else {
      selectedSubjects = selectedSubjects.filter(s => s !== subject);
    }
    applyFilters();
  }
  
  // Function to clear all filters
  function clearFilters() {
    selectedSubjects = [];
    searchQuery = '';
    applyFilters();
  }
  
  // Function to apply filters to tutors list
  function applyFilters() {
    if (selectedSubjects.length === 0 && !searchQuery.trim()) {
      filteredTutors = [...tutors];
      return;
    }
    
    filteredTutors = tutors.filter(tutor => {
      // Check if tutor teaches any of the selected subjects
      const matchesSubjects = selectedSubjects.length === 0 || 
        selectedSubjects.some(subject => 
          tutor.subjects.some(tutorSubject => 
            tutorSubject.toLowerCase().includes(subject.toLowerCase())
          )
        );
      
      // Check if tutor name or subjects match search query
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || 
        tutor.name.toLowerCase().includes(query) ||
        tutor.subjects.some(subject => subject.toLowerCase().includes(query)) ||
        (tutor.bio && tutor.bio.toLowerCase().includes(query));
      
      return matchesSubjects && matchesSearch;
    });
  }
  
  // Function to get the subject category from a subject name
  function getSubjectCategory(subject: string) {
    for (const category of subjectCategories) {
      if (category.subjects.includes(subject)) {
        return category.name;
      }
    }
    return "Other";
  }
  
  // Load tutors from Firestore
  onMount(async () => {
    try {
      loading = true;
      
      // Get tutors from Firestore
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
        
        // Ensure we always have a valid array even if processing failed
        if (!Array.isArray(formattedSubjects)) {
          formattedSubjects = [];
        }
        
        // For safety, filter out any non-string values
        formattedSubjects = formattedSubjects.filter(s => typeof s === 'string');
        
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
      
      // Get subject from URL parameter if provided
      const urlParams = new URLSearchParams(window.location.search);
      const subjectParam = urlParams.get('subject');
      
      if (subjectParam) {
        // Find the closest subject match
        const decodedSubject = decodeURIComponent(subjectParam);
        const matchingSubject = allSubjects.find(s => 
          s.toLowerCase() === decodedSubject.toLowerCase() ||
          s.toLowerCase().includes(decodedSubject.toLowerCase()) ||
          decodedSubject.toLowerCase().includes(s.toLowerCase())
        );
        
        if (matchingSubject) {
          selectedSubjects = [matchingSubject];
        }
      }
      
      // Apply initial filters
      applyFilters();
      
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
  });
  
  // Re-apply filters when selectedSubjects or searchQuery changes
  $: {
    if (tutors.length > 0) {
      applyFilters();
    }
  }
  
  // Track number of selected tutors
  $: tutorCount = filteredTutors.length;
  
  // Get popular subjects based on tutor count
  $: popularSubjects = allSubjects
    .map(subject => ({
      subject,
      count: tutors.filter(tutor => 
        tutor.subjects.some(s => s.toLowerCase() === subject.toLowerCase())
      ).length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
</script>

<svelte:head>
  <title>Find Tutors by Subject | WiseOwl</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-8">
  <!-- Hero Section -->
  <section class="relative z-[1] text-center mb-12">
    <h1 class="text-5xl font-extrabold text-[#151f54] mb-4 tracking-tight">Find Your Perfect Tutor</h1>
    <p class="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
      Filter by subject to find tutors who specialize in exactly what you need help with.
    </p>
  </section>
  
  <div class="flex flex-col lg:flex-row gap-8">
    <!-- Filter Sidebar -->
    <div class="lg:w-1/4">
      <div class="bg-white rounded-lg shadow-md p-6 sticky top-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-[#151f54]">Filters</h2>
          <button 
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            on:click={clearFilters}
          >
            Clear all
          </button>
        </div>
        
        <!-- Search input -->
        <div class="mb-6">
          <label for="search-tutors" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div class="relative">
            <input
              id="search-tutors"
              type="text"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:border-[#151f54]"
              placeholder="Tutor name or keyword..."
              bind:value={searchQuery}
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Mobile toggle for filters -->
        <button 
          class="lg:hidden w-full flex items-center justify-between py-2 px-4 bg-gray-100 rounded-md mb-4"
          on:click={() => showFilters = !showFilters}
        >
          <span class="font-medium">Subject Filters</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform transition-transform" class:rotate-180={showFilters} viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <!-- Subject filters -->
        <div class={showFilters ? 'block' : 'hidden lg:block'}>
          <div class="mb-6">
            <h3 class="text-sm font-medium text-gray-900 mb-2">Popular Subjects</h3>
            <div class="flex flex-wrap gap-2">
              {#each popularSubjects as { subject, count }}
                <button
                  class="text-xs px-3 py-1.5 rounded-full border transition-colors"
                  class:bg-[#151f54]:={selectedSubjects.includes(subject)}
                  class:text-white={selectedSubjects.includes(subject)}
                  class:border-[#151f54]={selectedSubjects.includes(subject)}
                  class:bg-gray-50={!selectedSubjects.includes(subject)}
                  class:hover:bg-gray-100={!selectedSubjects.includes(subject)}
                  class:border-gray-300={!selectedSubjects.includes(subject)}
                  on:click={() => toggleSubjectFilter(subject)}
                >
                  {subject} ({count})
                </button>
              {/each}
            </div>
          </div>
          
          {#each subjectCategories as category}
            {#if category.subjects.some(s => tutors.some(tutor => tutor.subjects.includes(s)))}
              <div class="mb-6 border-t pt-4">
                <h3 class="text-sm font-medium text-gray-900 mb-2">{category.name}</h3>
                <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {#each category.subjects.filter(s => tutors.some(tutor => tutor.subjects.includes(s))) as subject}
                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        class="h-4 w-4 text-[#151f54] rounded border-gray-300 focus:ring-[#151f54]"
                        checked={selectedSubjects.includes(subject)}
                        on:change={() => toggleSubjectFilter(subject)}
                      />
                      <span class="ml-2 text-sm text-gray-700">{subject}</span>
                    </label>
                  {/each}
                </div>
              </div>
            {/if}
          {/each}
        </div>
        
        <!-- Selected filters summary -->
        {#if selectedSubjects.length > 0}
          <div class="mt-4 pt-4 border-t">
            <h3 class="text-sm font-medium text-gray-900 mb-2">Selected Filters</h3>
            <div class="flex flex-wrap gap-2">
              {#each selectedSubjects as subject}
                <div class="bg-[#e8eaf6] flex items-center text-[#151f54] text-xs px-3 py-1 rounded-full">
                  <span>{subject}</span>
                  <button
                    class="ml-1 focus:outline-none hover:text-red-600"
                    on:click={() => toggleSubjectFilter(subject)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Tutors Grid -->
    <div class="lg:w-3/4">
      <!-- Results summary -->
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-xl font-bold text-[#151f54]">
          {tutorCount} {tutorCount === 1 ? 'Tutor' : 'Tutors'} {selectedSubjects.length > 0 ? 'Found' : 'Available'}
        </h2>
        <div class="text-sm text-gray-500">
          {selectedSubjects.length > 0 ? `Filtered by ${selectedSubjects.length} subject${selectedSubjects.length !== 1 ? 's' : ''}` : ''}
        </div>
      </div>
      
      {#if loading}
        <div class="bg-white rounded-lg p-8 text-center shadow-md">
          <div class="animate-spin inline-block w-12 h-12 border-4 border-current border-t-transparent text-[#151f54] rounded-full mb-4" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <h3 class="text-2xl font-bold mb-2">Finding Tutors</h3>
          <p class="text-gray-600">Please wait while we search for tutors that match your criteria...</p>
        </div>
      {:else if error}
        <div class="bg-white rounded-lg p-8 text-center shadow-md border-l-4 border-red-500">
          <div class="text-5xl mb-4 text-red-500">⚠️</div>
          <h3 class="text-2xl font-bold mb-2">Error Loading Tutors</h3>
          <p class="text-red-600 mb-4">{error}</p>
        </div>
      {:else if filteredTutors.length > 0}
        <div class="grid grid-cols-1 gap-8">
          {#each filteredTutors as tutor (tutor.id)}
            <div 
              class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              on:click={() => openTutorProfile(tutor)}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === 'Enter' && openTutorProfile(tutor)}
            >
              <div class="flex flex-col md:flex-row">
                <!-- Larger Tutor Image -->
                <div class="md:w-1/4 lg:w-1/5 aspect-square">
                  <img 
                    src={tutor.image} 
                    alt={tutor.name} 
                    class="w-full h-full object-cover"
                  />
                </div>
                
                <!-- Tutor Information -->
                <div class="p-6 md:w-3/4 lg:w-4/5">
                  <div class="flex flex-col h-full">
                    <!-- Header with Name -->
                    <div class="mb-3">
                      <div class="flex items-center flex-wrap gap-2 mb-1">
                        <h3 class="text-2xl font-bold text-[#151f54]">{tutor.name}</h3>
                        
                        <!-- Display selected subjects first if present -->
                        {#each selectedSubjects.filter(s => tutor.subjects.includes(s)) as subject, i}
                          <span class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                            {subject}
                          </span>
                        {/each}
                      </div>
                      <p class="text-gray-600">{tutor.education}</p>
                    </div>
                    
                    <!-- Experience Section -->
                    <div class="mb-4 flex-grow">
                      <div class="mb-3">
                        <div class="font-medium text-gray-800">Experience</div>
                        <p class="text-sm text-gray-700">{tutor.experience || 'Not specified'}</p>
                      </div>
                      
                      <!-- Subjects Section -->
                      <div>
                        <div class="font-medium text-gray-800 mb-1 flex items-center gap-2">
                          <span>Subjects</span>
                          {#if tutor.subjects.length > 0}
                            <span class="text-gray-500 text-xs font-normal">
                              ({tutor.subjects.length} total)
                            </span>
                          {/if}
                        </div>
                        
                        <div class="flex flex-wrap gap-1.5 mb-2">
                          {#each tutor.subjects
                            .filter(s => !selectedSubjects.includes(s))
                            .slice(0, 5 - selectedSubjects.filter(s => tutor.subjects.includes(s)).length) as subject}
                            <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                              {subject}
                            </span>
                          {/each}
                          
                          {#if tutor.subjects.length > 5 || (tutor.subjects.length > selectedSubjects.filter(s => tutor.subjects.includes(s)).length + 5)}
                            <button 
                              class="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center underline"
                              on:click={(event) => { event.stopPropagation(); openSubjectsDetail(tutor, event); }}
                              on:keydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); openSubjectsDetail(tutor, e); }}}
                            >
                              See all {tutor.subjects.length} subjects
                            </button>
                          {/if}
                        </div>
                      </div>
                      
                      <!-- Bio Preview -->
                      <div class="mt-3">
                        <div class="font-medium text-gray-800 mb-1">About</div>
                        <p class="text-sm text-gray-700 line-clamp-2">{tutor.bio || 'No bio available'}</p>
                      </div>
                    </div>
                    
                    <!-- Footer with Action Button -->
                    <div class="flex justify-end mt-2">
                      <button
                        class="bg-[#151f54] text-white px-5 py-2 rounded-md hover:bg-[#212d6e] transition-colors flex items-center font-medium"
                        on:click={(event) => {event.stopPropagation(); openTutorProfile(tutor);}}
                      >
                        View Full Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="bg-white rounded-lg p-8 text-center shadow-md">
          <div class="text-5xl mb-4">🔍</div>
          <h3 class="text-2xl font-bold mb-2">No Tutors Found</h3>
          <p class="text-gray-600 mb-4">We couldn't find any tutors matching your current filters. Try broadening your search or selecting different subjects.</p>
          <button
            class="bg-[#151f54] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#212d6e] shadow"
            on:click={clearFilters}
          >
            Clear All Filters
          </button>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Tutor Profile Modal -->
  {#if modalOpen && selectedTutor}
    <Modal bind:open={modalOpen}>
      <svelte:fragment slot="header">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center space-x-3">
            <h2 class="text-2xl font-bold text-[#151f54]">{selectedTutor.name}</h2>
            {#if selectedSubjects.some(s => selectedTutor.subjects.includes(s))}
              <div class="flex flex-wrap gap-2">
                {#each selectedSubjects.filter(s => selectedTutor.subjects.includes(s)) as subject}
                  <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {subject}
                  </span>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </svelte:fragment>
      
      <svelte:fragment slot="content">
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Tutor Image and Subjects -->
          <div class="md:w-1/3">
            <!-- Larger Tutor Image -->
            <div class="aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-md bg-gray-50">
              <img 
                src={selectedTutor.image} 
                alt={selectedTutor.name} 
                class="w-full h-full object-cover"
              />
            </div>
            
            <!-- Contact Button for Mobile -->
            <div class="mt-4 md:hidden">
              <a 
                href="/booking" 
                class="w-full block text-center px-4 py-3 bg-[#151f54] text-white rounded-md hover:bg-[#212d6e] transition-colors font-medium"
              >
                Book a Session with {selectedTutor.name.split(' ')[0]}
              </a>
            </div>
            
            <!-- Subjects Card -->
            <div class="mt-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-lg text-[#151f54]">Subjects</h3>
                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {selectedTutor.subjects?.length || 0} total
                </span>
              </div>
              
              {#if selectedTutor.subjects && selectedTutor.subjects.length > 0}
                <div class="max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  <!-- Show selected subjects first -->
                  {#if selectedSubjects.some(s => selectedTutor.subjects.includes(s))}
                    <div class="mb-3">
                      <h4 class="text-sm font-medium text-blue-700 mb-2">Selected Subjects</h4>
                      <ul class="space-y-1.5">
                        {#each selectedSubjects.filter(s => selectedTutor.subjects.includes(s)) as subject}
                          <li class="flex items-center">
                            <span class="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>
                            <span class="text-blue-800 font-medium">{subject}</span>
                          </li>
                        {/each}
                      </ul>
                    </div>
                  {/if}
                  
                  <!-- Other subjects -->
                  <div>
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Other Subjects</h4>
                    <ul class="space-y-1.5">
                      {#each selectedTutor.subjects.filter(s => !selectedSubjects.includes(s)) as subject}
                        <li class="flex items-center">
                          <span class="w-2.5 h-2.5 rounded-full bg-[#151f54] mr-2"></span>
                          {subject}
                        </li>
                      {/each}
                    </ul>
                  </div>
                </div>
              {:else}
                <p class="text-gray-500">No subjects specified</p>
              {/if}
            </div>
          </div>
          
          <!-- Tutor Details -->
          <div class="md:w-2/3">
            <!-- Education Card -->
            <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
              <h3 class="text-lg font-semibold mb-3 text-[#151f54]">Education</h3>
              <p class="text-gray-700">{selectedTutor.education || 'Not specified'}</p>
            </div>
            
            <!-- Experience Card -->
            <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
              <h3 class="text-lg font-semibold mb-3 text-[#151f54]">Experience</h3>
              <p class="text-gray-700">{selectedTutor.experience || 'Not specified'}</p>
            </div>
            
            <!-- About Card -->
            <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 class="text-lg font-semibold mb-3 text-[#151f54]">About</h3>
              <div class="prose max-w-none text-gray-700">
                <p class="whitespace-pre-line">{selectedTutor.bio || 'No biography available.'}</p>
              </div>
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
          
          <a 
            href="/booking" 
            class="hidden md:flex px-4 py-2 bg-[#151f54] text-white rounded-md hover:bg-[#212d6e] transition-colors items-center font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
            </svg>
            Book a Session
          </a>
        </div>
      </svelte:fragment>
    </Modal>
  {/if}
  
  <!-- Subjects Detail Modal -->
  {#if subjectsModalOpen && selectedTutor}
    <Modal bind:open={subjectsModalOpen}>
      <svelte:fragment slot="header">
        <div class="flex items-center justify-between w-full">
          <h2 class="text-xl font-bold text-[#151f54]">All Subjects for {selectedTutor.name}</h2>
        </div>
      </svelte:fragment>
      
      <svelte:fragment slot="content">
        {#if selectedTutor.subjects && selectedTutor.subjects.length > 0}
          <div class="max-h-96 overflow-y-auto custom-scrollbar pr-2">
            <!-- Group subjects by category for better organization -->
            {#each subjectCategories as category}
              {#if selectedTutor.subjects.some(s => category.subjects.includes(s))}
                <div class="mb-4">
                  <h3 class="font-semibold text-[#151f54] mb-2">{category.name}</h3>
                  <div class="flex flex-wrap gap-2">
                    {#each selectedTutor.subjects.filter(s => category.subjects.includes(s)) as subject}
                      <span class="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full text-sm font-medium">
                        {subject}
                      </span>
                    {/each}
                  </div>
                </div>
              {/if}
            {/each}
            
            <!-- For any subjects that don't match categories -->
            {#if selectedTutor.subjects.some(s => !subjectCategories.some(cat => cat.subjects.includes(s)))}
              <div class="mb-4">
                <h3 class="font-semibold text-[#151f54] mb-2">Other Subjects</h3>
                <div class="flex flex-wrap gap-2">
                  {#each selectedTutor.subjects.filter(s => !subjectCategories.some(cat => cat.subjects.includes(s))) as subject}
                    <span class="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full text-sm font-medium">
                      {subject}
                    </span>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <p class="text-gray-500">No subjects specified for this tutor.</p>
        {/if}
      </svelte:fragment>
      
      <svelte:fragment slot="footer">
        <div class="flex justify-end w-full">
          <button
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:ring-offset-2"
            on:click={() => subjectsModalOpen = false}
          >
            Close
          </button>
        </div>
      </svelte:fragment>
    </Modal>
  {/if}
</div>

<style lang="css">
  /* Custom scrollbar styling */
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
  
  /* Card hover effects */
  .bg-white.rounded-xl {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .bg-white.rounded-xl:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  /* Highlight selected subjects */
  .bg-blue-100 {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  /* Line clamp for bio text */
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>
