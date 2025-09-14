<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Modal } from '$lib/components';
  import Calendar from '$lib/components/ui/calendar/calendar.svelte';

  export let open = false;
  const dispatch = createEventDispatcher();

  let selected: any = null;

  function close() {
    open = false;
  }
  function confirm() {
    if (selected && selected.toDate) {
      const jsDate: Date = selected.toDate?.() ?? selected;
      const label = jsDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      dispatch('pick', { label, date: jsDate });
      open = false;
    } else if (selected instanceof Date) {
      const jsDate = selected as Date;
      const label = jsDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      dispatch('pick', { label, date: jsDate });
      open = false;
    } else {
      open = false;
    }
  }
</script>

{#if open}
  <Modal bind:open title="Choose a date">
    <svelte:fragment slot="content">
      <div class="space-y-4">
        <div class="rounded-2xl overflow-hidden border border-blue-100 shadow-xl bg-gradient-to-b from-white to-blue-50/60">
          <div class="relative p-4 sm:p-6">
            <!-- Glow -->
            <div class="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-400/20 via-cyan-300/20 to-blue-400/20 blur-2xl"></div>
            <div class="relative">
              <Calendar type="single" bind:value={selected} class="[--cell-size:44px]" captionLayout="dropdown" buttonVariant="ghost" />
            </div>
          </div>
        </div>
      </div>
    </svelte:fragment>

    <svelte:fragment slot="footer">
      <div class="w-full flex items-center justify-between">
        <button class="px-4 py-2 border border-blue-200 rounded-md text-[#0f1a3f] bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" on:click={close}>Cancel</button>
        <button class="px-4 py-2 rounded-md text-white bg-[#151f54] hover:bg-[#212d6e] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]" on:click={confirm}>Use this date</button>
      </div>
    </svelte:fragment>
  </Modal>
{/if}
