<script> 
  import { onMount } from 'svelte';

  // Initialize empty tutors array
  let tutors = [];

  // Add Tutor form state
  let showForm = false;

  // Password modal state
  let showPasswordModal = false;
  let adminAuthed = false;
  let tempPassword = '';
  let pwdError = '';

  let form = {
    name: '',
    subjects: '',
    education: '',
    experience: '',
    bio: '',
    image: '',
    password: '' // optional (kept for compatibility)
  };
  let errors = {};

  function resetForm() {
    form = { name:'', subjects:'', education:'', experience:'', bio:'', image:'', password:'' };
    errors = {};
  }

  function nextId() {
    return tutors.length ? Math.max(...tutors.map(t => t.id)) + 1 : 1;
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

  function addTutor() {
    if (!validate()) return;

    const newTutor = {
      id: nextId(),
      name: form.name.trim(),
      subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean),
      education: form.education.trim(),
      experience: form.experience.trim(),
      bio: form.bio.trim(),
      image: form.image.trim() || `https://placehold.co/200x200?text=${encodeURIComponent(form.name.split(' ').map(n=>n[0]||'').join('').toUpperCase())}`
    };
    tutors = [newTutor, ...tutors]; // add to top
    resetForm();
    showForm = false;
  }

  // -------- Password modal actions --------
  function openAddTutor() {
    if (!adminAuthed) {
      console.log('[Admin Modal] Opening password verification modal');
      showPasswordModal = true;
      return;
    }
    console.log('[Admin Modal] User already authenticated, toggling form');
    showForm = !showForm;
  }

  function confirmPassword() {
    console.log('[Admin Auth] Attempting password verification');
    if (tempPassword === '83120258808') {
      console.log('[Admin Auth] SUCCESS: Password verified correctly');
      adminAuthed = true;
      pwdError = '';
      tempPassword = '';
      showPasswordModal = false;
      showForm = true; // go straight to the form after success
    } else {
      console.log('[Admin Auth] FAILED: Incorrect password entered');
      pwdError = 'Incorrect password';
    }
  }

  function closeModal() {
    showPasswordModal = false;
    pwdError = '';
    tempPassword = '';
  }

  function handleModalKey(e) {
    console.log(`[Admin Modal Key] Modal key pressed: "${e.key}"`);
    if (e.key === 'Enter') confirmPassword();
    if (e.key === 'Escape') closeModal();
  }

  // -------- Secret sequence: "Admin1" (case-insensitive, ≤2s gaps) --------
  const SECRET = 'admin1';
  const MAX_GAP_MS = 2000;
  let typedBuffer = '';
  let lastKeyTime = 0;

  onMount(() => {
    // Set up keyboard listener for admin sequence
    const listener = (e) => {
      const now = Date.now();
      if (now - lastKeyTime > MAX_GAP_MS) {
        typedBuffer = '';
        console.log('[Admin Sequence] Reset: Timeout exceeded');
      }
      lastKeyTime = now;

      // Only consider single printable characters
      if (e.key && e.key.length === 1) {
        typedBuffer += e.key.toLowerCase();
        console.log(`[Admin Sequence] Key pressed: "${e.key}" | Current buffer: "${typedBuffer}"`);
        
        if (typedBuffer.length > SECRET.length) {
          typedBuffer = typedBuffer.slice(-SECRET.length);
          console.log(`[Admin Sequence] Buffer trimmed to: "${typedBuffer}"`);
        }
        
        if (typedBuffer.endsWith(SECRET)) {
          console.log('[Admin Sequence] SUCCESS: Admin sequence completed!');
          typedBuffer = '';
          openAddTutor();
        }
      }
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  });
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

  <!-- Featured Tutors + Add button -->
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-3xl font-bold text-[#151f54]">Featured Tutors</h2>
    <!-- Button is intentionally hidden -->
    <button
      class="hidden"
      on:click={openAddTutor}
      aria-expanded={showForm}
      aria-controls="add-tutor-form"
    >
      <span>➕</span> Add Tutor
    </button>
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

        <!-- Optional password field kept (not required) -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">Password (optional)</label>
          <input type="password" class="w-full border rounded-md px-3 py-2" bind:value={form.password} />
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
    {#if tutors.length > 0}
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
        <p class="text-gray-600 mb-4">Our team of expert tutors will be added soon.</p>
        <p class="text-sm text-gray-500">Administrators can use the admin access to add tutors.</p>
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

  <!-- Debug Button (admin modal) -->
  <div class="mb-12">
    <button class="bg-red-500 text-white p-2" on:click={openAddTutor}>
      Debug: Open Admin Modal
    </button>
  </div>
</div>

<!-- Password Modal -->
{#if showPasswordModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center" on:keydown={handleModalKey} tabindex="0" aria-modal="true" role="dialog">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/50" on:click={closeModal}></div>

    <!-- Panel -->
    <div class="relative w-[92%] max-w-md rounded-2xl shadow-2xl overflow-hidden">
      <!-- Header / gradient -->
      <div class="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6">
        <h3 class="text-white text-xl font-bold">Admin Access</h3>
        <p class="text-blue-100 text-sm mt-1">Enter the password to add a new tutor.</p>
      </div>

      <!-- Body -->
      <div class="bg-white p-6">
        <label class="block text-sm font-medium mb-2 text-gray-700">Password</label>
        <input
          type="password"
          class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          bind:value={tempPassword}
        />
        {#if pwdError}
          <p class="text-sm text-red-600 mt-2">{pwdError}</p>
        {/if}

        <div class="mt-6 flex items-center gap-3">
          <button
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-blue-700 active:scale-[.98] transition"
            on:click={confirmPassword}
          >Unlock</button>
          <button
            class="px-4 py-2 rounded-md border hover:bg-gray-50"
            on:click={closeModal}
          >Cancel</button>
        </div>
      </div>

      <!-- Subtle bottom bar -->
      <div class="bg-blue-50 px-6 py-3 text-xs text-blue-900/80 flex items-center gap-2">
        <span class="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
        Authorized users only
      </div>
    </div>
  </div>
{/if}
