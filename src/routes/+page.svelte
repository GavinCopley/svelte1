<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from "$lib/components/ui/button";
  import { fade } from 'svelte/transition';
  import Fuse from 'fuse.js';

  let visible = false;
  let showInitialContent = true;
  let showNewContent = false;
  let searchQuery = '';
  let searchResults: {subject: string, category: string}[] = [];
  let showResults = false;
  
  // Subject categories - copied from tutors page to have access to all subjects
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
  
  // Extract all subjects and create a searchable array with category information
  const allSubjects = subjectCategories.flatMap(category => 
    category.subjects.map(subject => ({
      subject: subject,
      category: category.name
    }))
  );
  
  // Initialize Fuse.js for fuzzy searching
  const fuseOptions = {
    keys: ['subject', 'category'],
    threshold: 0.3, // Lower threshold means more strict matching
    includeScore: true
  };
  const fuse = new Fuse(allSubjects, fuseOptions);
  
  // Function to perform search
  function performSearch() {
    if (!searchQuery.trim()) {
      searchResults = [];
      showResults = false;
      return;
    }
    
    // First check for exact matches (case-insensitive)
    const exactMatches = allSubjects.filter(item => 
      item.subject.toLowerCase() === searchQuery.toLowerCase()
    );
    
    // Then use Fuse.js for fuzzy searching
    const fuseResults = fuse.search(searchQuery);
    const fuzzyMatches = fuseResults
      .map(result => result.item)
      // Filter out any exact matches to avoid duplicates
      .filter(item => !exactMatches.some(exact => 
        exact.subject.toLowerCase() === item.subject.toLowerCase()
      ));
    
    // Combine exact matches first, then fuzzy matches
    searchResults = [...exactMatches, ...fuzzyMatches];
    showResults = true;
  }
  
  // Handle subject selection
  function selectSubject(subject: string) {
    // Navigate to tutorfilter page with the selected subject as a parameter
    // Use exact=true to prevent tutorfilter from trying to find partial matches
    window.location.href = `/tutorfilter?subject=${encodeURIComponent(subject)}&exact=true`;
  }

  function handleGetStarted() {
    // First fade out the initial content
    showInitialContent = false;
    
    // After initial content fades out, show the new content
    setTimeout(() => {
      showNewContent = true;
    }, 700); // Match the duration of the fade-out transition
  }

  // Clear search when clicked outside
  function handleClickOutside(event: MouseEvent) {
    const searchContainer = document.getElementById('search-container');
    if (searchContainer && !searchContainer.contains(event.target as Node)) {
      showResults = false;
    }
  }

  onMount(() => {
    visible = true;
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<svelte:head>
    <title>WiseOwl</title>
</svelte:head>

<div class="flex flex-col items-center justify-center p-4 text-slate-900 min-h-[calc(100vh-4rem)]">
  {#if showInitialContent}
    <div 
      class="container mx-auto flex max-w-3xl flex-col items-center justify-center space-y-8 text-center transition-all duration-700 ease-in-out {visible ? 'opacity-100' : 'opacity-0 translate-y-4'}"
      out:fade={{ duration: 700 }}
    >
      <!-- Logo/Icon -->
      <div class="mb-2">
        <img src="/favicon.png" alt="WiseOwl Tutoring Logo" width="120" height="120" class="mx-auto" />
      </div>

      <!-- Title with subtle animation -->
      <h1 class="text-5xl font-extrabold tracking-tight leading-tight sm:text-6xl md:text-7xl">
        <span class="inline-block animate-fade-in-up opacity-0 text-slate-900" style="animation-delay: 200ms; animation-fill-mode: forwards;">Welcome to</span>
        <br />
        <span class="inline-block animate-fade-in-up bg-gradient-to-r from-[#151f54] to-[#5564ab] bg-clip-text text-transparent opacity-0 pb-2" style="animation-delay: 400ms; animation-fill-mode: forwards;">
          WiseOwl Tutoring
        </span>
      </h1>

      <!-- Subtitle -->
      <p class="max-w-lg text-xl font-medium text-slate-900 animate-fade-in-up opacity-0" style="animation-delay: 600ms; animation-fill-mode: forwards;">
        Empowering students to achieve academic excellence through personalized learning experiences
      </p>

      <!-- Get Started Button -->
      <div class="pt-6 animate-fade-in-up opacity-0" style="animation-delay: 800ms; animation-fill-mode: forwards;">
        <Button variant="default" size="lg" class="px-10 h-14 text-lg font-medium" on:click={handleGetStarted}>
          Get Started
        </Button>
      </div>
    </div>
  {/if}
  
  {#if showNewContent}
    <div 
      class="container mx-auto flex max-w-3xl flex-col items-center justify-center space-y-8 text-center"
      in:fade={{ duration: 700 }}
    >
      <!-- Logo remains visible -->
      <div class="mb-2">
        <img src="/favicon.png" alt="WiseOwl Tutoring Logo" width="120" height="120" class="mx-auto" />
      </div>

      <!-- Search Bar -->
      <div class="w-full max-w-xl mx-auto mb-4 relative" id="search-container">
        <div class="relative">
          <input
            type="text"
            bind:value={searchQuery}
            on:input={performSearch}
            on:focus={() => searchQuery && (showResults = true)}
            placeholder="Search for subjects (e.g. Algebra, AP Biology, English...)"
            class="w-full px-4 py-3 pl-12 rounded-full shadow-md border-2 border-[#151f54]/20 focus:border-[#151f54] focus:ring-2 focus:ring-[#151f54]/30 focus:outline-none transition-all"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#151f54]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {#if searchQuery}
            <button 
              on:click={() => { searchQuery = ''; searchResults = []; showResults = false; }}
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </button>
          {/if}
        </div>
        
        <!-- Search Results -->
        {#if showResults && searchResults.length > 0}
          <div class="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto" transition:fade={{ duration: 200 }}>
            <div class="p-2 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-200">
              Select a subject to find tutors
            </div>
            <ul class="py-2 divide-y divide-gray-100">
              {#each searchResults as result, i}
                <li 
                  class="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors flex flex-col items-start text-left"
                  on:click={() => selectSubject(result.subject)}
                >
                  <div class="flex items-center">
                    <span class="font-medium text-[#151f54]">{result.subject}</span>
                  </div>
                  <span class="text-xs text-gray-500">{result.category}</span>
                </li>
              {/each}
            </ul>
          </div>
        {:else if showResults && searchQuery.trim() !== ''}
          <div class="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center" transition:fade={{ duration: 200 }}>
            <p class="text-gray-500">No subjects found matching "{searchQuery}"</p>
          </div>
        {/if}
      </div>

      <!-- New Content Header -->
      <h2 class="text-4xl font-bold tracking-tight sm:text-5xl text-slate-900">
        Why Choose WiseOwl Tutoring?
      </h2>

      <!-- Benefits in a grid layout -->
      <div class="grid grid-cols-1 gap-8 pt-6 md:grid-cols-2">
        <div class="flex flex-col items-center text-center p-4">
          <div class="mb-4 rounded-full bg-purple-100 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Expert Tutors</h3>
          <p class="text-slate-700">Highly qualified educators with proven track records in their respective subjects.</p>
        </div>

        <div class="flex flex-col items-center text-center p-4">
          <div class="mb-4 rounded-full bg-purple-100 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Proven Results</h3>
          <p class="text-slate-700">Our students consistently show significant improvement in grades and confidence.</p>
        </div>
      </div>
      
      <!-- Centered button linking to subjects page -->
      <div class="flex flex-col items-center mt-8">
        <p class="text-gray-600 mb-3">Search for a subject above or browse all our offerings</p>
        <Button variant="default" size="lg" class="px-10 h-14 text-lg font-medium" href="/subjects?tutorial=true">
          Explore All Subjects
        </Button>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Custom animations */
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
  }
  
  /* Search bar styling */
  input[type="text"]:focus {
    box-shadow: 0 0 0 2px rgba(21, 31, 84, 0.2);
  }
  
  /* Search results styling */
  .search-results {
    transition: all 0.2s ease-in-out;
  }
  
  .search-results li:hover {
    background-color: rgba(21, 31, 84, 0.05);
  }
  
  /* Custom scrollbar for search results */
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 8px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 8px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background-color: #a8a8a8;
  }
</style>
