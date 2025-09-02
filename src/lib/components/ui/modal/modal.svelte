<!--
  Simple Modal Component for Svelte
  Usage:
  <Modal bind:open title="My Title" content={<div>Content</div>} />
-->
<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let closeOnClickOutside = true;
  export let closeOnEsc = true;
  export let title: string | null = null;

  const dispatch = createEventDispatcher();

  function closeModal() {
    open = false;
    dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (closeOnEsc && e.key === 'Escape' && open) {
      closeModal();
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (closeOnClickOutside && e.target === e.currentTarget && open) {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
    transition:fade={{ duration: 200 }}
    on:click={handleClickOutside}
    on:keydown={() => {}}
    role="dialog"
    aria-modal="true"
  >
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black/50" 
      transition:fade={{ duration: 150 }}
    ></div>
    
    <!-- Modal -->
    <div
      class="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl"
      transition:scale={{ duration: 200, start: 0.95 }}
    >
      <!-- Header -->
      <div class="flex items-center border-b p-4 sm:p-6">
        <div class="flex-grow text-lg font-semibold">
          <slot name="header">{title || 'Modal'}</slot>
        </div>
        <button
          type="button"
          class="ml-2 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#151f54]"
          on:click={closeModal}
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-4 sm:p-6">
        <slot name="content">No content provided</slot>
      </div>
      
      <!-- Footer -->
      <div class="border-t p-4 sm:p-6 flex justify-end space-x-3">
        <slot name="footer">
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#151f54] focus:ring-offset-2"
            on:click={closeModal}
          >
            Close
          </button>
        </slot>
      </div>
    </div>
  </div>
{/if}
