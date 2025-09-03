<script lang="ts">
  import { fade, scale, fly } from 'svelte/transition';
  import { tick } from 'svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';

  type Subject = { 
    key: string; 
    name: string; 
    icon: string; 
    tag: string; 
    desc: string;
    isAP?: boolean; // Added AP flag
  };

  // Popular AP subjects
  const apSubjects: Subject[] = [
    { key: 'apcalc',   name: 'Calculus AB',       icon: '📊', tag: 'Limits · Derivatives · Integrals', isAP: true,
      desc: 'Master derivatives, integrals, series, and differential equations to earn a 4-5 on the College Board exam.' },
    { key: 'aplang',   name: 'English Language and Composition', icon: '📝', tag: 'Rhetoric · Synthesis · Analysis', isAP: true,
      desc: 'Build rhetorical analysis skills, timed-writing strategies, and evidence-based arguments for AP success.' },
    { key: 'apbio',    name: 'Biology',           icon: '🧬', tag: 'Cells · Evolution · Systems', isAP: true,
      desc: 'Tackle cellular processes, genetics, evolution and ecology through data analysis and FRQ practice.' },
    { key: 'apphys',   name: 'Physics 1: Algebra-Based', icon: '⚛️', tag: 'Mechanics · Rotation · Circuits', isAP: true,
      desc: 'Conquer kinematics, forces, circular motion, energy, circuits, and waves with step-by-step problem approaches.' }
  ];

  // Popular non-AP subjects
  const nonAPSubjects: Subject[] = [
    { key: 'alg1',     name: '8th Grade Algebra', icon: '🔢', tag: 'Expressions · Equations · Graphs',
      desc: 'Build middle school algebra foundations with linear equations, inequalities, and intro to functions.' },
    { key: 'eng8',     name: '8th Grade English',  icon: '✏️', tag: 'Reading · Essays · Grammar',
      desc: 'Strengthen paragraph structure, evidence use, reading comprehension, and language conventions.' },
    { key: 'sci8',     name: '8th Grade Science',  icon: '🔬', tag: 'Physical · Life · Earth Science',
      desc: 'Explore physical sciences, life sciences, and Earth systems with clear explanations and simple experiments.' },
    { key: 'precalc',  name: 'Pre-Calculus',       icon: '📈', tag: 'Functions · Trig · Analysis',
      desc: 'Prepare for calculus with function analysis, trigonometry, vectors, matrices, and sequence/series work.' }
  ];

  // Combine all subjects for any code that needs the full list
  const subjects: Subject[] = [...apSubjects, ...nonAPSubjects];

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
      label: 'Regular (M/HS)',
      tagline: 'Concept-first, grade growth',
      desc: `Crystal-clear explanations, homework help, lab skills, and quiz/test prep.
             Great for steady mastery.`,
      features: ['Homework walkthroughs', 'Foundations refreshers', 'Lab skills', 'Test strategy']
    }
  };

  // Subject-specific tier data for modal displays
  const subjectTierData: Record<string, {
    ap: { tagline: string; desc: string; features: string[] };
    reg: { tagline: string; desc: string; features: string[] };
  }> = {
    // AP Calculus
    'apcalc': {
      ap: {
        tagline: 'Fast-paced, exam-focused',
        desc: 'College Board–aligned lessons with FRQ drills, limits, derivatives, and integration techniques. Ideal for scoring 4-5 on the AP Calculus exam.',
        features: ['AB/BC content coverage', 'FRQ writing clinic', 'Integration techniques', 'Sequence & series']
      },
      reg: {
        tagline: 'Concept-first, grade growth',
        desc: 'Build a strong foundation in calculus concepts with step-by-step explanations and practice problems.',
        features: ['Precalculus review', 'Step-by-step derivatives', 'Visualization tools', 'Test preparation']
      }
    },
    // AP Language
    'aplang': {
      ap: {
        tagline: 'Fast-paced, exam-focused',
        desc: 'College Board–aligned lessons focusing on rhetorical analysis, synthesis essays, and argument construction for AP English Language.',
        features: ['Rhetorical analysis', 'Timed essay practice', 'MCQ strategies', 'Source evaluation']
      },
      reg: {
        tagline: 'Concept-first, grade growth',
        desc: 'Improve reading comprehension, essay structure, and analytical thinking for high school English success.',
        features: ['Essay structure', 'Evidence integration', 'Grammar mastery', 'Reading strategies']
      }
    },
    // AP Biology
    'apbio': {
      ap: {
        tagline: 'Fast-paced, exam-focused',
        desc: 'College Board–aligned lessons covering cellular processes, genetics, evolution, and ecology with lab analysis for AP Bio success.',
        features: ['Lab analysis skills', 'FRQ strategies', 'Data interpretation', 'Content review']
      },
      reg: {
        tagline: 'Concept-first, grade growth',
        desc: 'Build understanding of biological principles, lab skills, and science literacy for regular biology courses.',
        features: ['Concept visualizations', 'Lab report help', 'Test preparation', 'Homework support']
      }
    },
    // AP Physics
    'apphys': {
      ap: {
        tagline: 'Fast-paced, exam-focused',
        desc: 'College Board–aligned lessons on mechanics, electricity, circuits, and waves with problem-solving strategies for AP Physics 1.',
        features: ['Force diagrams', 'Lab analysis', 'Problem frameworks', 'Equation mastery']
      },
      reg: {
        tagline: 'Concept-first, grade growth',
        desc: 'Develop intuitive understanding of physics concepts with clear explanations and practical applications.',
        features: ['Conceptual foundations', 'Problem walkthroughs', 'Math skill building', 'Test preparation']
      }
    },
    // 8th Grade Algebra
    'alg1': {
      ap: {
        tagline: 'Fast-paced, advanced placement',
        desc: 'Accelerated algebra program preparing talented middle schoolers for high school math placement exams.',
        features: ['Advanced topics', 'Competition prep', 'Placement test prep', 'High school readiness']
      },
      reg: {
        tagline: 'Concept-first, grade growth',
        desc: 'Build solid algebra foundations with clear explanations of equations, expressions, and introductory functions.',
        features: ['Visual learning', 'Homework help', 'Test preparation', 'Pre-algebra review']
      }
    },
    // 8th Grade English
    'eng8': {
      ap: {
        tagline: 'Fast-paced, advanced placement',
        desc: 'Accelerated middle school English program developing advanced writing and analysis skills for high school.',
        features: ['Advanced writing', 'Literary analysis', 'Vocabulary building', 'High school readiness']
      },
      reg: {
        tagline: 'Concept-first, grade growth',
        desc: 'Strengthen reading comprehension, writing skills, and grammar mastery for middle school English success.',
        features: ['Essay structure', 'Grammar rules', 'Reading strategies', 'Speaking skills']
      }
    },
    // 8th Grade Science
    'sci8': {
      ap: {
        tagline: 'Fast-paced, advanced placement',
        desc: 'Advanced middle school science program covering physical, life, and Earth sciences with high school preparation.',
        features: ['Advanced topics', 'Lab techniques', 'Science fair help', 'High school readiness']
      },
      reg: {
        tagline: 'Concept-first, grade growth',
        desc: 'Build understanding of key scientific principles with hands-on activities and clear explanations.',
        features: ['Experiment help', 'Visual learning', 'Test preparation', 'Science literacy']
      }
    },
    // Pre-Calculus
    'precalc': {
      ap: {
        tagline: 'Fast-paced, advanced placement',
        desc: 'Accelerated pre-calculus program preparing students for AP Calculus with advanced function analysis and theory.',
        features: ['AP Calc preparation', 'Advanced topics', 'College readiness', 'Proof techniques']
      },
      reg: {
        tagline: 'Concept-first, grade growth',
        desc: 'Master functions, trigonometry, and analytical concepts needed for success in future calculus courses.',
        features: ['Function analysis', 'Trigonometry', 'Test preparation', 'Algebra review']
      }
    }
  };

  // Default tier data (fallback if subject-specific data not found)
  const defaultTierData = {
    ap:  {
      tagline: 'Fast-paced, exam-focused',
      desc: `College Board–aligned lessons with weekly MCQ + FRQ drills, targeted unit reviews,
             and lab/write-up coaching. Ideal for a 4–5 score target.`,
      features: ['Unit-by-unit reviews', 'FRQ writing clinic', 'Timed practice', 'Score analytics']
    },
    reg: {
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

  // Function to navigate to tutorfilter page with subject filter
  function findTutorsForSubject(subject: string) {
    window.location.href = `/tutorfilter?subject=${encodeURIComponent(subject)}`;
  }

  function close() {
    modalOpen = false;
    // Keep active subject selected
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
    // Make sure we have an active subject
    if (!active) return;
    
    // Get the subject name
    const subjectName = active.name || '';
    
    // Format the subject name appropriately based on its type
    let fullSubjectName = '';
    if (kind === 'ap' && active.isAP) {
      // For AP subjects, ensure "AP" is in the name
      fullSubjectName = subjectName.includes('AP') ? subjectName : `AP ${subjectName}`;
    } else {
      // For Regular subjects, remove any "AP" prefix if present
      fullSubjectName = subjectName.replace(/^AP\s+/, '');
    }

    // Close the modal but keep the selected subject highlighted
    modalOpen = false;
    document.body.style.overflow = '';

    // Redirect to find tutors
    findTutorsForSubject(fullSubjectName);
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
  <h1 class="text-5xl font-extrabold text-[#151f54] mb-4 tracking-tight">Popular Subjects</h1>
  <p class="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
    Pick a subject below. Choose <b>AP</b> or <b>Regular</b> to find specialized tutors tailored to your path.
  </p>
</section>

<!-- SUBJECT GRID -->
<div
  bind:this={appRoot}
  class="relative z-[1] max-w-6xl mx-auto px-4 transition filter"
  aria-hidden={modalOpen}
  style={modalOpen ? 'filter: blur(0px);' : ''}
>
  <!-- Tutorial box for step 1 -->
  {#if isTutorial && tutorialStep === 1}
    <div 
      class="tutorial-box"
      role="tooltip"
      aria-label="Tutorial hint"
      transition:fly={{ y: 20, duration: 300 }}
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
  
  <!-- Clear selection button when a subject is selected -->
  {#if active && !modalOpen}
    <div class="flex justify-center mb-6">
      <button
        class="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
        on:click={() => active = null}
        aria-label="Clear selection"
      >
        <span class="text-xs">✕</span>
        Clear selection: {active.name}
      </button>
    </div>
  {/if}

  <!-- AP Subjects Section -->
  <div class="mb-8">
    <h2 class="text-2xl font-bold text-[#151f54] mb-4 flex items-center">
      <span class="chip chip-ap mr-2">AP</span> Popular College Board AP Courses
    </h2>
    <div bind:this={gridRef} class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each apSubjects as s, i}
        <div
          class="group relative overflow-hidden rounded-2xl p-6 text-left shadow-[0_10px_30px_rgba(16,24,40,.08)]
                 transition-colors focus-within:outline-none focus-within:ring-4 focus-within:ring-indigo-200
                 bg-white/90 border border-transparent hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(16,24,40,.14)]
                 {active?.key === s.key ? 'selected-card ap-selected' : ''}"
          style="
            animation: cardIn .5s cubic-bezier(.14,.75,.29,1.02) both;
            animation-delay: {70*i}ms;
            background-image:
              radial-gradient(1200px 300px at 0% 0%, rgba(59, 130, 246, .15), transparent 40%),
              linear-gradient(0deg, rgba(255,255,255,.9), rgba(255,255,255,.9));
            {active?.key === s.key ? 'transform: translateY(-2px); box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);' : ''}
          "
        >
          <!-- AP gradient border frame -->
          <span class="absolute inset-0 rounded-2xl p-[1.5px] pointer-events-none"
                style="background: linear-gradient(135deg, #93c5fd, #bfdbfe, #dbeafe); -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude;"></span>

          <div class="flex items-start justify-between">
            <div class="text-3xl mb-3 mr-3 transition-transform group-hover:scale-110">{s.icon}</div>
            <span class="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 opacity-90">
              {s.tag}
            </span>
          </div>

          <button
            class="w-full text-left focus:outline-none"
            on:click={(e) => openFor(s, e.currentTarget as HTMLElement)}
            aria-label={active?.key === s.key ? `${s.name} selected` : `Choose ${s.name}`}
            aria-pressed={active?.key === s.key}
            class:selected={active?.key === s.key}
          >
            <h3 class="text-lg font-semibold text-[#151f54]">{s.name}</h3>

            <!-- specific description -->
            <p class="text-gray-600 text-sm leading-relaxed mt-3 min-h-[72px]">
              {s.desc}
            </p>
          </button>
          
          <!-- Find a Tutor button -->
          <button 
            class="mt-4 w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm hover:bg-blue-200 transition-colors"
            on:click={(e) => {
              e.stopPropagation();
              openFor(s, e.currentTarget as HTMLElement);
            }}
            aria-label={`Find a tutor for ${s.name}`}
          >
            Find a Tutor
          </button>
        </div>
      {/each}
    </div>
  </div>

  <!-- Regular (Non-AP) Subjects Section -->
  <div class="mt-12">
    <h2 class="text-2xl font-bold text-[#151f54] mb-4 flex items-center">
      <span class="chip chip-reg mr-2">Regular</span> Popular Grade-Level Courses
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each nonAPSubjects as s, i}
        <div
          class="group relative overflow-hidden rounded-2xl p-6 text-left shadow-[0_10px_30px_rgba(16,24,40,.08)]
                 transition-colors focus-within:outline-none focus-within:ring-4 focus-within:ring-indigo-200
                 bg-white/90 border border-transparent hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(16,24,40,.14)]
                 {active?.key === s.key ? 'selected-card reg-selected' : ''}"
          style="
            animation: cardIn .5s cubic-bezier(.14,.75,.29,1.02) both;
            animation-delay: {70*(i+4)}ms;
            background-image:
              radial-gradient(1200px 300px at 0% 0%, rgba(16, 185, 129, .12), transparent 40%),
              linear-gradient(0deg, rgba(255,255,255,.9), rgba(255,255,255,.9));
            {active?.key === s.key ? 'transform: translateY(-2px); box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);' : ''}
          "
        >
          <!-- Regular gradient border frame -->
          <span class="absolute inset-0 rounded-2xl p-[1.5px] pointer-events-none"
                style="background: linear-gradient(135deg, #6ee7b7, #a7f3d0, #d1fae5); -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude;"></span>

          <div class="flex items-start justify-between">
            <div class="text-3xl mb-3 mr-3 transition-transform group-hover:scale-110">{s.icon}</div>
            <span class="text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 opacity-90">
              {s.tag}
            </span>
          </div>

          <button
            class="w-full text-left focus:outline-none"
            on:click={(e) => openFor(s, e.currentTarget as HTMLElement)}
            aria-label={active?.key === s.key ? `${s.name} selected` : `Choose ${s.name}`}
            aria-pressed={active?.key === s.key}
            class:selected={active?.key === s.key}
          >
            <h3 class="text-lg font-semibold text-[#151f54]">{s.name}</h3>

            <!-- specific description -->
            <p class="text-gray-600 text-sm leading-relaxed mt-3 min-h-[72px]">
              {s.desc}
            </p>
          </button>
          
          <!-- Find a Tutor button -->
          <button 
            class="mt-4 w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm hover:bg-blue-200 transition-colors"
            on:click={(e) => {
              e.stopPropagation();
              openFor(s, e.currentTarget as HTMLElement);
            }}
            aria-label={`Find a tutor for ${s.name}`}
          >
            Find a Tutor
          </button>
        </div>
      {/each}
    </div>
  </div>

  <!-- MORE SUBJECTS BUTTON -->
  <div class="mt-12 text-center">
    <a href="/moresubjects" class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#151f54] to-[#3a4792] text-white font-semibold rounded-lg hover:from-[#1c2a6e] hover:to-[#4152a8] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg">
      <span>Explore More Subjects</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </a>
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
          {#if active?.isAP}
            <p id="dialog-desc" class="head-sub">AP tutors specialized in College Board curriculum and exam preparation for {active.name}.</p>
          {:else}
            <p id="dialog-desc" class="head-sub">Regular tutors specialized in grade-level curriculum and concepts for {active?.name}.</p>
          {/if}
        </div>
        <button class="icon-btn" on:click={close} aria-label="Close dialog">✕</button>
      </header>
      <!-- Tutorial box for step 2 -->
      {#if isTutorial && tutorialStep === 2}
        <div 
          class="tutorial-box tutorial-box-2"
          role="tooltip" 
          aria-label="Tutorial next step"
          transition:fly={{ y: 20, duration: 300 }}
        >
          <div class="tutorial-arrow tutorial-arrow-2"></div>
          <h4>🎯 Next Step</h4>
          <p>Select AP or non-AP to find tutors specialized in that subject path!</p>
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
        {#if active && active.isAP}
          <!-- AP Option Only for AP Classes -->
          <article class="plan" style="animation-delay:.02s; grid-column: span 2;">
            <div class="plan-top">
              <h3 class="plan-title"><span class="chip chip-ap">AP</span> AP {active.name} (HS)</h3>
              <span class="badge">College Board Aligned</span>
            </div>
            {#if subjectTierData[active.key]}
              <p class="tagline">{subjectTierData[active.key].ap.tagline}</p>
              <p class="desc">{subjectTierData[active.key].ap.desc}</p>
              <ul class="features">{#each subjectTierData[active.key].ap.features as f}<li>{f}</li>{/each}</ul>
            {:else}
              <p class="tagline">{tierData.ap.tagline}</p>
              <p class="desc">{tierData.ap.desc}</p>
              <ul class="features">{#each tierData.ap.features as f}<li>{f}</li>{/each}</ul>
            {/if}
            <div class="price"><span class="num">${tierData.ap.price}</span><span class="per">/mo</span></div>
            <div class="actions">
              <button class="btn btn-ap" on:click={() => selectPlan('ap')}
                aria-label={`Find tutors for AP ${active.name}`}>Find AP Tutors</button>
            </div>
          </article>
        {:else if active}
          <!-- Regular Option Only for Non-AP Classes -->
          <article class="plan" style="animation-delay:.02s; grid-column: span 2;">
            <div class="plan-top">
              <h3 class="plan-title"><span class="chip chip-reg">Regular</span> {active.name} — Regular (M/HS)</h3>
              <span class="badge">Grade-Level Focus</span>
            </div>
            {#if subjectTierData[active.key]}
              <p class="tagline">{subjectTierData[active.key].reg.tagline}</p>
              <p class="desc">{subjectTierData[active.key].reg.desc}</p>
              <ul class="features">{#each subjectTierData[active.key].reg.features as f}<li>{f}</li>{/each}</ul>
            {:else}
              <p class="tagline">{tierData.reg.tagline}</p>
              <p class="desc">{tierData.reg.desc}</p>
              <ul class="features">{#each tierData.reg.features as f}<li>{f}</li>{/each}</ul>
            {/if}
            <div class="price"><span class="num">${tierData.reg.price}</span><span class="per">/mo</span></div>
            <div class="actions">
              <button class="btn btn-reg" on:click={() => selectPlan('reg')}
                aria-label={`Find tutors for Regular ${active.name}`}>Find Regular Tutors</button>
            </div>
          </article>
        {/if}
      </section>
      
      <!-- Note: Find Tutors section removed as buttons now directly link to tutor filter page -->

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
    width: 100%;
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
  
  .actions{
    margin-top:auto; display:flex; gap:10px; width: 100%;
  }
  .price{ position:absolute; right:16px; bottom:56px; display:flex; align-items:baseline; gap:4px; }
  .num{ font-weight:900; font-size:42px; letter-spacing:.5px; color: var(--red); }
  .per{ color: var(--red); font-weight:700; }

  .actions{ margin-top:auto; display:flex; gap:10px; width: 100%; }
  .btn{
    border:1px solid var(--border); border-radius:12px; padding:11px 14px; cursor:pointer;
    background:#151f54; color:white; transition: transform .12s ease, box-shadow .12s ease, background .12s;
    box-shadow: 0 12px 30px rgba(16,24,40,.08);
    width: 100%;
    text-align: center;
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
  
  /* Selected subject card styles */
  .selected-card {
    border-color: #3b82f6 !important;
    border-width: 2px !important;
    position: relative;
    z-index: 2;
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.5) !important;
  }
  .ap-selected {
    background-color: rgba(239, 246, 255, 0.9) !important;
  }
  .reg-selected {
    background-color: rgba(236, 253, 245, 0.9) !important;
  }
  .selected-card h3 {
    color: #1e40af !important;
  }
  .selected-card p {
    color: #1e3a8a !important;
    font-weight: 500;
  }
  /* Make sure all text in selected cards is visible */
  .selected-card * {
    color: inherit !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  /* Enhance icon in selected cards */
  .selected-card .text-3xl {
    color: #3b82f6 !important;
    transform: scale(1.1);
  }
  
  /* Enhance tag in selected AP cards */
  .ap-selected .rounded-full {
    background-color: #dbeafe !important;
    border-color: #3b82f6 !important;
    color: #1e40af !important;
  }
  
  /* Enhance tag in selected Regular cards */
  .reg-selected .rounded-full {
    background-color: #d1fae5 !important;
    border-color: #10b981 !important;
    color: #065f46 !important;
  }
</style>
