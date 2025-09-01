<script lang="ts">
  import { fade, scale, fly } from 'svelte/transition';
  import { tick } from 'svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';

  type Subject = { key: string; name: string; icon: string; tag: string; desc: string };

  const subjects: Subject[] = [
    { key: 'chem',    name: 'Chemistry',        icon: '🧪', tag: 'Reactions · Stoich · Equilibrium',
      desc: 'Balance equations, master stoichiometry, acids/bases & buffers, and write clean lab reports.' },
    { key: 'physics', name: 'Physics',          icon: '⚛️', tag: 'Forces · Energy · Circuits',
      desc: 'Set up kinematics & forces, use energy/momentum, and solve basic DC circuits step by step.' },
    { key: 'bio',     name: 'Biology',          icon: '🧬', tag: 'Cells · Genetics · Ecology',
      desc: 'Cell processes, Punnett squares, evolution data, and FRQ diagrams that actually score.' },
    { key: 'math',    name: 'Mathematics',      icon: '🔢', tag: 'Algebra · Trig · Calculus',
      desc: 'From factoring & functions to trig identities, limits, derivatives, and integrals.' },
    { key: 'english', name: 'English',          icon: '✏️', tag: 'Reading · Writing · Rhetoric',
      desc: 'Build strong theses, structure essays, fix grammar, and practice clear timed writing.' },
    { key: 'history', name: 'History',          icon: '📜', tag: 'DBQ · LEQ · Evidence',
      desc: 'Plan DBQs/LEQs fast, source documents, and use causation/CCOT/comparison for points.' },
    { key: 'cs',      name: 'Computer Science', icon: '💻', tag: 'Python · Java · Algorithms',
      desc: 'OOP, recursion, arrays/ArrayLists, basic Big-O, and debugging with real test cases.' },
    { key: 'science', name: 'Middle School Sci',icon: '🔬', tag: 'Foundations · Labs · Prep',
      desc: 'Measurement, matter, forces, and energy with simple labs and clear write-ups.' }
  ];

  const tierData = {
    ap:  {
      price: 49,
      label: 'AP',
      tagline: 'Fast-paced, exam-focused',
      desc: `College Board–aligned lessons with weekly MCQ + FRQ drills, targeted unit reviews,
             and lab/write-up coaching. Ideal for a 4–5 score target.`,
      features: ['Unit-by-unit reviews', 'FRQ writing clinic', 'Timed practice', 'Score analytics']
    },
    reg: {
      price: 29,
      label: 'No-AP (M/HS)',
      tagline: 'Concept-first, grade growth',
      desc: `Crystal-clear explanations, homework help, lab skills, and quiz/test prep.
             Great for steady mastery.`,
      features: ['Homework walkthroughs', 'Foundations refreshers', 'Lab skills', 'Test strategy']
    }
  };

  let modalOpen = false;
  let active: Subject | null = null;

  // a11y helpers
  let appRoot: HTMLElement | null = null;
  let dialogEl: HTMLElement | null = null;
  let lastTrigger: HTMLElement | null = null;

  // Tutorial feature
  let isTutorial = false;
  let tutorialStep = 1;
  let gridRef: HTMLElement | null = null;

  // Check if tutorial mode is enabled from URL parameter
  onMount(() => {
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      isTutorial = urlParams.get('tutorial') === 'true';
    }
  });

  function getFocusable(root: HTMLElement) {
    const sel = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    return Array.from(root.querySelectorAll<HTMLElement>(sel))
      .filter(el => el.offsetParent !== null || el === document.activeElement);
  }

  async function openFor(s: Subject, trigger?: HTMLElement) {
    lastTrigger = trigger ?? (document.activeElement as HTMLElement | null);
    active = s;
    modalOpen = true;
    document.body.style.overflow = 'hidden';
    await tick();

    // move focus into dialog
    if (dialogEl) {
      const focusables = getFocusable(dialogEl);
      (focusables[0] ?? dialogEl).focus();
    }
    
    // Progress tutorial to step 2 if in tutorial mode
    if (isTutorial && tutorialStep === 1) {
      tutorialStep = 2;
    }
  }

  function close() {
    modalOpen = false;
    active = null;
    document.body.style.overflow = '';
    // return focus to last trigger for a11y
    lastTrigger?.focus();
  }

  function onDialogKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab' && dialogEl) {
      const focusables = getFocusable(dialogEl);
      if (!focusables.length) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement as HTMLElement;

      if (e.shiftKey && (current === first || current === dialogEl)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function selectPlan(kind: 'ap' | 'reg') {
    // TODO: wire to router/checkout (e.g. goto(`/checkout?subject=${active?.key}&plan=${kind}`))
    alert(`Selected ${kind === 'ap' ? 'AP' : 'No-AP'} ${active?.name}`);
  }

  function openContactForm() {
    window.open('', '_blank');
  }
  
  function endTutorial() {
    if (browser) {
      window.location.href = '/subjects';
    }
  }
</script>

<svelte:head>
    <title>Subjects | WiseOwl</title>
</svelte:head>

<!-- Soft animated background -->
<div class="bg">
  <div class="blob b1"></div>
  <div class="blob b2"></div>
  <div class="blob b3"></div>
</div>

<!-- HERO -->
<section class="relative z-[1] text-center mb-12">
  <h1 class="text-5xl font-extrabold text-[#151f54] mb-4 tracking-tight">Explore Our Subject Areas</h1>
  <p class="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
    Pick a subject below. In the popup, choose <b>AP</b> or <b>No-AP</b>—same great tutors, tailored paths.
  </p>
</section>

<!-- SUBJECT GRID -->
<div
  bind:this={appRoot}
  class="relative z-[1] max-w-6xl mx-auto px-4 transition filter"
  aria-hidden={modalOpen}
>
  <!-- Tutorial box for step 1 -->
  {#if isTutorial && tutorialStep === 1}
    <div 
      class="tutorial-box"
      role="tooltip"
      aria-label="Tutorial hint"
      tabindex="0"
      transition:fly={{ y: 20, duration: 300 }}
      on:keydown={(e) => e.key === 'Enter' && (tutorialStep = 1)}
    >
      <div class="tutorial-arrow"></div>
      <h4>👋 Tutorial</h4>
      <p>Click on a subject to see your learning options.</p>
      <div class="tutorial-button-container">
        <Button 
          variant="secondary" 
          size="sm" 
          on:click={endTutorial}
        >
          Skip Tutorial
        </Button>
      </div>
    </div>
  {/if}
  
  <div bind:this={gridRef} class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {#each subjects as s, i}
      <button
        class="group relative overflow-hidden rounded-2xl p-6 text-left shadow-[0_10px_30px_rgba(16,24,40,.08)]
               transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200
               bg-white/90 border border-transparent hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(16,24,40,.14)]"
        style="
          animation: cardIn .5s cubic-bezier(.14,.75,.29,1.02) both;
          animation-delay: {70*i}ms;
          background-image:
            radial-gradient(1200px 300px at 0% 0%, rgba(99,102,241,.12), transparent 40%),
            linear-gradient(0deg, rgba(255,255,255,.9), rgba(255,255,255,.9));
        "
        on:click={(e) => openFor(s, e.currentTarget as HTMLElement)}
        aria-label={`Choose ${s.name}`}
      >
        <!-- gradient border frame -->
        <span class="absolute inset-0 rounded-2xl p-[1.5px] pointer-events-none"
              style="background: linear-gradient(135deg, #c7d2fe, #fecaca, #bbf7d0); -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude;"></span>

        <div class="flex items-start justify-between">
          <div class="text-3xl mb-3 mr-3 transition-transform group-hover:scale-110">{s.icon}</div>
          <span class="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 opacity-90">
            {s.tag}
          </span>
        </div>

        <h3 class="text-lg font-semibold text-[#151f54]">{s.name}</h3>

        <!-- specific description -->
        <p class="text-gray-600 text-sm leading-relaxed mt-3 min-h-[72px]">
          {s.desc}
        </p>
      </button>
    {/each}
  </div>
</div>

<!-- STATS -->
<div class="max-w-6xl mx-auto px-4 mt-12" aria-hidden={modalOpen}>
  <div class="bg-gradient-to-r from-[#151f54] to-[#0f1a3f] rounded-2xl p-8 text-white shadow-2xl">
    <h2 class="text-3xl font-bold text-center mb-6">Subject Expertise</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      <div class="pop"><div class="text-3xl font-bold mb-1">24</div><div>AP Subjects</div></div>
      <div class="pop d1"><div class="text-3xl font-bold mb-1">15</div><div>Math Levels</div></div>
      <div class="pop d2"><div class="text-3xl font-bold mb-1">95%</div><div>Pass Rate</div></div>
      <div class="pop d3"><div class="text-3xl font-bold mb-1">4.8/5</div><div>Avg. Rating</div></div>
    </div>
  </div>
</div>

<!-- WHY -->
<div class="max-w-6xl mx-auto px-4 mt-12 mb-16" aria-hidden={modalOpen}>
  <h2 class="text-3xl font-bold text-[#151f54] text-center mb-10">Why Choose Our Tutoring?</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div class="why"><div class="text-4xl mb-3">🎯</div><h3 class="text-xl font-semibold text-[#151f54] mb-2">Specialists by Subject</h3><p class="text-gray-600">Work with tutors who’ve aced the course and know how to teach it clearly.</p></div>
    <div class="why"><div class="text-4xl mb-3">📋</div><h3 class="text-xl font-semibold text-[#151f54] mb-2">Exam-Ready</h3><p class="text-gray-600">Targeted practice for unit tests, finals, and AP exams with analytics.</p></div>
    <div class="why"><div class="text-4xl mb-3">📚</div><h3 class="text-xl font-semibold text-[#151f54] mb-2">Custom Materials</h3><p class="text-gray-600">Guides, practice sets, and FRQ/essay feedback tailored to you.</p></div>
  </div>
</div>

<!-- CONTACT -->
<div class="flex justify-center pb-10 relative z-[1]" aria-hidden={modalOpen}>
  <div class="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full border border-gray-200">
    <h3 class="text-2xl font-semibold mb-3 text-[#151f54] text-center">Don’t see your subject?</h3>
    <p class="text-gray-600 text-center mb-6">We likely cover it. Reach out and we’ll match you with the right tutor.</p>
    <div class="text-center">
      <button
        on:click={openContactForm}
        class="bg-[#151f54] text-white px-8 py-3 rounded-lg hover:bg-[#0f1a3f] transition-colors text-lg font-medium"
      >
        Request Subject Help
      </button>
    </div>
  </div>
</div>

<!-- ACCESSIBLE MODAL -->
{#if modalOpen}
  <div class="modal-backdrop"
       role="presentation"
       on:click={close}
       transition:fade>
    <div class="modal-panel"
         bind:this={dialogEl}
         role="dialog"
         aria-modal="true"
         aria-labelledby="dialog-title"
         aria-describedby="dialog-desc"
         tabindex="0"
         on:keydown={onDialogKeydown}
         on:click|stopPropagation
         transition:scale={{ duration: 140 }}>
      <header class="modal-head">
        <div>
          <h2 id="dialog-title">{active?.name}</h2>
          <p id="dialog-desc" class="head-sub">Choose <b>AP</b> or <b>No-AP</b> for {active?.name}. Your selection will shape pacing, practice, and goals.</p>
        </div>
        <button class="icon-btn" on:click={close} aria-label="Close dialog">✕</button>
      </header>
      <!-- Tutorial box for step 2 -->
      {#if isTutorial && tutorialStep === 2}
        <div 
          class="tutorial-box tutorial-box-2"
          role="tooltip" 
          aria-label="Tutorial next step"
          tabindex="0"
          transition:fly={{ y: 20, duration: 300 }}
          on:keydown={(e) => e.key === 'Enter' && (tutorialStep = 0)}
        >
          <div class="tutorial-arrow tutorial-arrow-2"></div>
          <h4>🎯 Next Step</h4>
          <p>Select AP or non-AP depending on the class your student is taking!</p>
          <div class="tutorial-button-container">
            <Button 
              variant="secondary" 
              size="sm" 
              on:click={() => tutorialStep = 0}
            >
              Got it
            </Button>
          </div>
        </div>
      {/if}

      <section class="cards">
        <!-- AP -->
        <article class="plan" style="animation-delay:.02s">
          <div class="plan-top">
            <h3 class="plan-title"><span class="chip chip-ap">AP</span> AP {active?.name} (HS)</h3>
            <span class="badge">Most popular</span>
          </div>
          <p class="tagline">{tierData.ap.tagline}</p>
          <p class="desc">{tierData.ap.desc}</p>
          <ul class="features">{#each tierData.ap.features as f}<li>{f}</li>{/each}</ul>
          <div class="price"><span class="num">${tierData.ap.price}</span><span class="per">/mo</span></div>
          <div class="actions">
            <button class="btn btn-ap" on:click={() => selectPlan('ap')}
              aria-label={`Choose AP ${active?.name}`}>Select AP</button>
          </div>
        </article>

        <!-- No-AP -->
        <article class="plan" style="animation-delay:.10s">
          <div class="plan-top">
            <h3 class="plan-title"><span class="chip chip-reg">No-AP</span> {active?.name} — No-AP (M/HS)</h3>
          </div>
          <p class="tagline">{tierData.reg.tagline}</p>
          <p class="desc">{tierData.reg.desc}</p>
          <ul class="features">{#each tierData.reg.features as f}<li>{f}</li>{/each}</ul>
          <div class="price"><span class="num">${tierData.reg.price}</span><span class="per">/mo</span></div>
          <div class="actions">
            <button class="btn btn-reg" on:click={() => selectPlan('reg')}
              aria-label={`Choose No-AP ${active?.name}`}>Select No-AP</button>
          </div>
        </article>
      </section>

      <div class="note">Cancel anytime · 1-on-1 sessions · Online or in-person · Homework support included</div>
    </div>
  </div>
{/if}

<style>
  /* ---------- Tutorial boxes ---------- */
  .tutorial-box {
    position: absolute;
    top: -75px;
    left: 50%;
    transform: translateX(-50%);
    background: #4338ca;
    color: white;
    padding: 18px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(79, 70, 229, 0.4);
    z-index: 100;
    max-width: 400px;
    text-align: center;
    cursor: pointer;
    animation: pulse 2s infinite;
    border: none;
    font-family: inherit;
    display: block;
    width: auto;
  }
  
  .tutorial-box:focus {
    outline: 3px solid white;
    outline-offset: 2px;
  }
  
  .tutorial-box h4 {
    margin: 0 0 8px 0;
    font-size: 18px;
  }
  
  .tutorial-box p {
    margin: 0;
    font-size: 16px;
  }
  
  .tutorial-button-container {
    margin-top: 16px;
    display: flex;
    justify-content: center;
  }
  
  .tutorial-arrow {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #4338ca;
  }
  
  .tutorial-box-2 {
    top: 10px;
    right: 10px;
    left: auto;
    transform: none;
    background: #059669;
    box-shadow: 0 10px 30px rgba(5, 150, 105, 0.4);
  }
  
  .tutorial-arrow-2 {
    left: auto;
    right: 20px;
    border-top: 10px solid #059669;
  }
  
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
    100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
  }

  /* ---------- Background blobs & entrance animations ---------- */
  .bg{ position:fixed; inset:0; pointer-events:none; overflow:hidden; }
  .blob{
    position:absolute; width:56vw; height:56vw; border-radius:50%;
    filter: blur(70px); opacity:.35;
    animation: float 22s ease-in-out infinite alternate;
  }
  .b1{ left:-12vw; top:-14vw; background: radial-gradient(closest-side, #cfe1ff, transparent 70%); }
  .b2{ right:-14vw; bottom:-16vw; background: radial-gradient(closest-side, #ffe1e1, transparent 70%); animation-delay:.7s; }
  .b3{ left:20vw; bottom:-20vw; background: radial-gradient(closest-side, #bbf7d0, transparent 70%); animation-delay:1.3s; }
  @keyframes float{ from{ transform:translateY(0)} to{ transform:translateY(30px)} }
  @keyframes cardIn { from{ transform: translateY(10px); opacity:0 } to{ transform: translateY(0); opacity:1 } }

  .pop{ animation: pop .5s ease both; }
  .pop.d1{ animation-delay:.1s } .pop.d2{ animation-delay:.2s } .pop.d3{ animation-delay:.3s }
  @keyframes pop{ from{ transform:scale(.96); opacity:0 } to{ transform:scale(1); opacity:1 } }

  /* ---------- Modal theme (a11y-minded) ---------- */
  :root{
    --ink: #0e1726;
    --border: #e7eaf3;
    --paper: #ffffff;
    --shadow: 0 30px 70px rgba(16,24,40,.18);
    --red: #e83f3f;
    --ap: #3b82f6;    /* blue */
    --reg: #10b981;   /* green */
  }
  .modal-backdrop{
    position:fixed; inset:0; background: rgba(255,255,255,.60);
    backdrop-filter: blur(8px);
    display:grid; place-items:center; padding:20px; z-index:50;
  }
  .modal-panel{
    width:min(1050px, 100%); background: rgba(255,255,255,.94);
    backdrop-filter: blur(12px) saturate(1.05);
    border:1px solid var(--border); border-radius:24px; box-shadow: var(--shadow); overflow:hidden;
    outline: none; /* focus handled by children */
  }
  .modal-head{
    display:flex; align-items:start; justify-content:space-between;
    padding:22px 26px; border-bottom:1px dashed var(--border);
  }
  .modal-head h2{ margin:0 0 6px 0; font-size:28px; color:var(--ink); }
  .head-sub{ margin:0; color:#475467; }
  .icon-btn{
    border:1px solid var(--border); background:white; border-radius:12px; padding:8px 10px;
    cursor:pointer; transition: transform .15s ease; box-shadow: 0 12px 30px rgba(16,24,40,.08);
  }
  .icon-btn:hover{ transform: scale(1.04); }

  .cards{
    display:grid; grid-template-columns: 1fr; gap:16px; padding:18px;
  }
  @media (min-width: 900px){ .cards{ grid-template-columns: 1fr 1fr; } }

  .plan{
    background:var(--paper); border:1px solid var(--border); border-radius:20px;
    padding:18px 20px 20px; position:relative; overflow:hidden; box-shadow: 0 12px 30px rgba(16,24,40,.08);
    display:flex; flex-direction:column; gap:10px; transition: transform .2s ease, box-shadow .2s ease;
    animation: cardIn .42s ease both;
  }
  .plan:hover{ transform: translateY(-2px); box-shadow: 0 24px 50px rgba(16,24,40,.16); }
  .plan-top{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .plan-title{ margin:0; font-size:22px; display:flex; align-items:center; gap:.5rem; }
  .badge{ font-size:11px; background:#fff1f1; color:#b42318; padding:4px 8px; border-radius:999px; border:1px solid #ffe1e1; }

  .chip{ font-size:11px; font-weight:700; color:white; padding:3px 8px; border-radius:999px; }
  .chip-ap{ background: var(--ap); }
  .chip-reg{ background: var(--reg); }

  .tagline{ margin:0; color:#475467; font-weight:600; }
  .desc{ margin:0; color:#475467; }
  .features{ display:flex; flex-wrap:wrap; gap:8px; margin:8px 0 56px 0; padding:0; list-style:none; }
  .features li{
    font-size:12px; color:#2f3a5f; background:#eef2ff; border:1px solid #d9e2ff; padding:6px 10px; border-radius:999px;
  }
  .price{ position:absolute; right:16px; bottom:56px; display:flex; align-items:baseline; gap:4px; }
  .num{ font-weight:900; font-size:42px; letter-spacing:.5px; color: var(--red); }
  .per{ color: var(--red); font-weight:700; }

  .actions{ margin-top:auto; display:flex; gap:10px; }
  .btn{
    border:1px solid var(--border); border-radius:12px; padding:11px 14px; cursor:pointer;
    background:#151f54; color:white; transition: transform .12s ease, box-shadow .12s ease, background .12s;
    box-shadow: 0 12px 30px rgba(16,24,40,.08);
  }
  .btn:hover{ transform: translateY(-1px); box-shadow: 0 16px 34px rgba(16,24,40,.14); }
  .btn-ap{ background: var(--ap); }
  .btn-reg{ background: var(--reg); }

  .note{ text-align:center; padding: 6px 16px 20px; color:#667085; font-size:13px; }

  /* Why cards */
  .why{
    background:#ffffff; border:1px solid #e5e7eb; border-radius:16px; padding:32px; text-align:center;
    box-shadow: 0 8px 24px rgba(16,24,40,.08);
    transition: transform .25s ease, box-shadow .25s ease;
  }
  .why:hover{ transform: translateY(-4px); box-shadow: 0 18px 40px rgba(16,24,40,.14); }
</style>
