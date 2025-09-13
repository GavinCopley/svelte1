<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Modal } from '$lib/components';
  import type { MainGoal, Urgency, Confidence, PreferredStyle, SessionAnswers } from '$lib/utils/calendlyHelper';

  export let open = false;
  export let subject: string | undefined;
  export let initialName = '';
  export let initialEmail = '';

  const dispatch = createEventDispatcher();

  // Form model matching product spec
  let name = initialName;
  let email = initialEmail;

  let a1: MainGoal | '' = '';
  let a2: Urgency | '' = '';
  let a3: Confidence | '' = '';
  let a4: PreferredStyle | '' = '';
  let a5: string = subject || '';
  let a6: string = '';
  let a7: string = '';
  let a8: string = '';
  let a9: string = '';
  let a10: string = '';

  $: if (subject && !a5) a5 = subject; // keep prefill

  // Counters
  $: topicCount = a6.trim().length;
  $: notesCount = a9.trim().length;

  type Errors = Partial<Record<'name'|'email'|'a1'|'a2'|'a3'|'a5'|'a6'|'a8'|'a9', string>>;
  let errors: Errors = {};

  const goalOptions: MainGoal[] = [
    'Homework help',
    'Concept review',
    'Test/quiz prep',
    'Project/paper guidance',
    'Skill development'
  ];
  const urgencyOptions: Urgency[] = ['Today/24h', 'This week', 'Planning ahead'];
  const confidenceOptions: Confidence[] = [
    'Very confused—start from basics',
    'Somewhat confused—need clarification + practice',
    'Mostly confident—need refinement/test strategies'
  ];
  const styleOptions: PreferredStyle[] = [
    'Step-by-step explanations',
    'Practice problems/drills',
    'Brainstorming',
    'Review my work + feedback'
  ];

  function suggestNotes() {
    if (a4 === 'Practice problems/drills' && !a9.includes('Bring')) {
      a9 = (a9 ? a9 + '\n' : '') + 'Bring calculator/textbook.';
    }
  }

  function validate(): boolean {
    errors = {};
    if (!name || name.trim().length < 2 || name.trim().length > 60) errors.name = 'Name must be 2–60 characters';
    if (!email || !/^\S+@\S+\.[\w-]{2,}$/i.test(email)) errors.email = 'Enter a valid email';
    if (!a1) errors.a1 = 'Required';
    if (!a2) errors.a2 = 'Required';
    if (!a3) errors.a3 = 'Required';
    if (!a5 || !a5.trim()) errors.a5 = 'Confirm the class or exam';
    if (!a6 || !a6.trim()) errors.a6 = 'One line about what we’ll cover';
    if (a6 && a6.trim().length > 500) errors.a6 = 'Max 500 characters';
    if (a9 && a9.trim().length > 500) errors.a9 = 'Max 500 characters';
    if (a8) {
      // Validate URLs loosely; allow comma-separated and tolerate spaces
      const parts = a8.split(',').map((p) => p.trim()).filter(Boolean);
      const invalid = parts.filter((p) => !/^https?:\/\//i.test(p));
      if (invalid.length && invalid.length === parts.length) {
        // if none look like URLs, still allow (as plain text). Only flag if some look bad while others good
        // No error in that case per tolerant spec
      }
    }
    return Object.keys(errors).length === 0;
  }

  function continueToScheduling() {
    if (!validate()) return;
    const payload: SessionAnswers = {
      name: name.trim(),
      email: email.trim(),
      a1: a1 as MainGoal,
      a2: a2 as Urgency,
      a3: a3 as Confidence,
      a4: a4 || undefined,
      a5: a5.trim(),
      a6: a6.trim().slice(0, 500),
      a7: a7 ? a7.trim() : undefined,
      a8: a8 ? a8.trim() : undefined,
      a9: a9 ? a9.trim().slice(0, 500) : undefined,
      a10: a10 ? a10.trim() : undefined
    };
    dispatch('submit', { answers: payload });
    open = false;
  }

  function cancel() {
    dispatch('cancel');
    open = false;
  }
</script>

{#if open}
  <Modal bind:open title="Tell us what you need (15–20 sec)">
    <svelte:fragment slot="content">
      <div class="space-y-6">
        <!-- Contact -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="nameInput" class="block text-sm font-medium text-gray-700">Name *</label>
            <input
              id="nameInput"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#151f54]"
              placeholder="Full name"
              bind:value={name}
              aria-invalid={!!errors.name}
              aria-describedby="name-hint name-err"
            />
            <p id="name-hint" class="text-xs text-gray-500 mt-1">2–60 chars</p>
            {#if errors.name}<p id="name-err" class="text-xs text-red-600 mt-1">{errors.name}</p>{/if}
          </div>
          <div>
            <label for="emailInput" class="block text-sm font-medium text-gray-700">Email *</label>
            <input
              id="emailInput"
              type="email"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#151f54]"
              placeholder="name@email.com"
              bind:value={email}
              aria-invalid={!!errors.email}
              aria-describedby="email-err"
            />
            {#if errors.email}<p id="email-err" class="text-xs text-red-600 mt-1">{errors.email}</p>{/if}
          </div>
        </div>

        <!-- Multiple Choice -->
        <div class="space-y-5">
          <fieldset>
            <legend class="block text-sm font-medium text-gray-700">Main Goal of the Session *</legend>
            <p class="text-xs text-gray-500 mb-2">Pick the main purpose so we prep the right way.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {#each goalOptions as opt}
                <label class="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="a1" value={opt} bind:group={a1} />
                  <span class="text-sm">{opt}</span>
                </label>
              {/each}
            </div>
            {#if errors.a1}<p class="text-xs text-red-600 mt-1">{errors.a1}</p>{/if}
          </fieldset>

          <fieldset>
            <legend class="block text-sm font-medium text-gray-700">Urgency *</legend>
            <p class="text-xs text-gray-500 mb-2">When do you need this by?</p>
            <div class="flex flex-wrap gap-2">
              {#each urgencyOptions as opt}
                <label class="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="a2" value={opt} bind:group={a2} />
                  <span class="text-sm">{opt}</span>
                </label>
              {/each}
            </div>
            {#if errors.a2}<p class="text-xs text-red-600 mt-1">{errors.a2}</p>{/if}
          </fieldset>

          <fieldset>
            <legend class="block text-sm font-medium text-gray-700">Current Confidence Level *</legend>
            <p class="text-xs text-gray-500 mb-2">How are you feeling on this topic?</p>
            <div class="space-y-2">
              {#each confidenceOptions as opt}
                <label class="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="a3" value={opt} bind:group={a3} />
                  <span class="text-sm">{opt}</span>
                </label>
              {/each}
            </div>
            {#if errors.a3}<p class="text-xs text-red-600 mt-1">{errors.a3}</p>{/if}
          </fieldset>

          <fieldset>
            <legend class="block text-sm font-medium text-gray-700">Preferred Style of Support (optional)</legend>
            <p class="text-xs text-gray-500 mb-2">We’ll match our approach to you.</p>
            <div class="flex flex-wrap gap-2">
              {#each styleOptions as opt}
                <label class="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="a4" value={opt} bind:group={a4} on:change={suggestNotes} />
                  <span class="text-sm">{opt}</span>
                </label>
              {/each}
            </div>
          </fieldset>
        </div>

        <!-- Free Response -->
        <div class="space-y-5">
          <div>
            <label for="a5Input" class="block text-sm font-medium text-gray-700">Subject / Course *</label>
            <input
              id="a5Input"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#151f54]"
              placeholder="AP Calculus AB"
              bind:value={a5}
              aria-invalid={!!errors.a5}
              aria-describedby="a5-hint a5-err"
            />
            <p id="a5-hint" class="text-xs text-gray-500 mt-1">Confirm the class or exam.</p>
            {#if errors.a5}<p id="a5-err" class="text-xs text-red-600 mt-1">{errors.a5}</p>{/if}
          </div>

          <div>
            <label for="a6Input" class="block text-sm font-medium text-gray-700">Specific Topic / Chapter / Skill *</label>
            <input
              id="a6Input"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#151f54]"
              placeholder={
                a5 && a5.toLowerCase().includes('lang') ? 'passage analysis, FRQ2' :
                a5 && (a5.toLowerCase().includes('spanish') || a5.toLowerCase().includes('french') || a5.toLowerCase().includes('latin')) ? 'interpretive reading/listening; presentational writing' :
                a5 && (a5.toLowerCase().includes('art') || a5.toLowerCase().includes('music')) ? 'portfolio piece critique; sight-reading' :
                'Related rates (3.8)'
              }
              bind:value={a6}
            />
            <div class="flex items-center justify-between">
              <p class="text-xs text-gray-500 mt-1">One line about what we’ll cover.</p>
              <p class="text-xs text-gray-400 mt-1">{topicCount}/500</p>
            </div>
            {#if errors.a6}<p class="text-xs text-red-600 mt-1">{errors.a6}</p>{/if}
          </div>

          <div>
            <label for="a7Input" class="block text-sm font-medium text-gray-700">Upcoming assignment/project/exam? Include date (optional)</label>
            <div class="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                id="a7Input"
                class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#151f54]"
                placeholder="Unit test Friday 10/03; essay due Monday"
                bind:value={a7}
              />
              {#if a1 === 'Test/quiz prep'}
                <input type="date" class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#151f54]" on:change={(e)=>{ const v=(e.target as HTMLInputElement).value; a7 = a7 ? `${a7} (${v})` : v; }} />
              {/if}
            </div>
          </div>

          <div>
            <label for="a8Input" class="block text-sm font-medium text-gray-700">Materials link(s) (optional)</label>
            <input
              id="a8Input"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#151f54]"
              placeholder="Drive/Docs/Photos links"
              bind:value={a8}
            />
            <p class="text-xs text-gray-500 mt-1">Share worksheets, prompts, rubrics, past work. Separate multiple with commas.</p>
          </div>

          <div>
            <label for="a9Textarea" class="block text-sm font-medium text-gray-700">Anything else that would help your tutor prepare? (optional)</label>
            <textarea
              id="a9Textarea"
              rows="3"
              class="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#151f54]"
              placeholder="I struggle with timed tests; prefer visuals; TI-84; IEP accommodations."
              bind:value={a9}
            ></textarea>
            <div class="flex items-center justify-between">
              <p class="text-xs text-gray-500 mt-1">Learning preferences, constraints, tools, etc.</p>
              <p class="text-xs text-gray-400 mt-1">{notesCount}/500</p>
            </div>
          </div>

          <div>
            <label for="a10Select" class="block text-sm font-medium text-gray-700">Grade / Level (optional)</label>
            <select id="a10Select" class="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#151f54]" bind:value={a10}>
              <option value="">Select</option>
              <option>6–8</option>
              <option>9–10</option>
              <option>11–12</option>
              <option>AP/IB</option>
              <option>College</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Gives us the right depth.</p>
          </div>
        </div>

        {#if Object.keys(errors).length}
          <p class="text-sm text-red-600">Please complete required fields.</p>
        {/if}
      </div>
    </svelte:fragment>

    <svelte:fragment slot="footer">
      <div class="flex justify-between w-full">
        <button class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50" on:click={cancel}>Cancel</button>
        <button class="px-4 py-2 bg-[#151f54] text-white rounded-md hover:bg-[#212d6e]" on:click={continueToScheduling}>Continue to scheduling</button>
      </div>
    </svelte:fragment>
  </Modal>
{/if}
