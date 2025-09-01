<script lang="ts">
  import { onMount } from 'svelte';
  import { tutorService, type Tutor } from '$lib/services/tutorService';
  
  // State variables with proper types
  let tutors: Tutor[] = [];
  let loading = true;
  let error: string | null = null;
  
  // Load tutors on component mount
  onMount(async () => {
    try {
      tutors = await tutorService.getAllTutors();
    } catch (err: any) {
      console.error('Error loading tutors:', err);
      error = err?.message || 'An unknown error occurred';
    } finally {
      loading = false;
    }
  });
</script>

<div>
  <h1>Example Tutors Component</h1>
  
  {#if loading}
    <p>Loading tutors...</p>
  {:else if error}
    <p>Error: {error}</p>
  {:else if tutors.length === 0}
    <p>No tutors found</p>
  {:else}
    <ul>
      {#each tutors as tutor}
        <li>
          <h2>{tutor.name}</h2>
          <p>Subjects: {tutor.subjects.join(', ')}</p>
        </li>
      {/each}
    </ul>
  {/if}
</div>
