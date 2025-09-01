<script>
  import { onMount } from 'svelte';
  import { Button } from "$lib/components/ui/button";
  import { fade } from 'svelte/transition';

  let visible = false;
  let showInitialContent = true;
  let showNewContent = false;

  function handleGetStarted() {
    // First fade out the initial content
    showInitialContent = false;
    
    // After initial content fades out, show the new content
    setTimeout(() => {
      showNewContent = true;
    }, 700); // Match the duration of the fade-out transition
  }

  onMount(() => {
    visible = true;
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
      <div class="flex justify-center mt-8">
        <Button variant="default" size="lg" class="px-10 h-14 text-lg font-medium" href="/subjects?tutorial=true">
          Explore Our Subjects
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
</style>
