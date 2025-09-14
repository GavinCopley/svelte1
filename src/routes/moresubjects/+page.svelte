<script lang="ts">
  import { fade, fly, scale } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  // import { goto } from '$app/navigation';
  import { subjectService, type Subject } from '$lib/services/subjectService';
  import { tutorService } from '$lib/services/tutorService';
  import { tick } from 'svelte';
  import { getEmoji, categoryEmojis } from '$lib';
  // import { SessionInfoModal } from '$lib'; // Removed: no longer opening quiz from this page
  
  // Enhanced Subject interface that includes UI elements and tutor count
  interface EnhancedSubject extends Subject {
    emoji: string;
    tag?: string;
    tutorCount: number;
    apTutorCount: number;
    nonApTutorCount: number;
  }
  
  let allSubjects: EnhancedSubject[] = [];
  let filteredSubjects: EnhancedSubject[] = [];
  let categorizedSubjects: Record<string, EnhancedSubject[]> = {};
  let searchQuery = "";
  let loading = true;
  let error = "";
  
  // Modal state
  let modalOpen = false;
  let activeSubject: EnhancedSubject | null = null;
  let isAPSelected = false;
  // NEW: removed session info modal state for cross-flow prefill (we navigate to tutor search instead)
  // let sessionInfoOpen = false;
  // let pendingSubjectName: string = '';
  
  // a11y helpers
  let dialogEl: HTMLElement | null = null;
  let lastTrigger: HTMLElement | null = null;
  
  // Track which categories are expanded
  let expandedCategories: Record<string, boolean> = {};
  
  // Track which subject descriptions are expanded
  let expandedDescriptions: Record<string, boolean> = {};
  
  // Pricing and plan information
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
  
  // Function to toggle category expansion
  function toggleCategory(category: string) {
    expandedCategories[category] = !expandedCategories[category];
    expandedCategories = {...expandedCategories}; // Trigger reactivity
  }
  
  // Function to toggle subject description expansion
  function toggleDescription(subjectId: string) {
    expandedDescriptions[subjectId] = !expandedDescriptions[subjectId];
    expandedDescriptions = {...expandedDescriptions}; // Trigger reactivity
  }
  
  // Subject categories with emojis - now imported from $lib
  // Using categoryEmojis imported from $lib/utils/emojiUtils.ts
  
  // Get appropriate tag based on subject name and level
  function getTag(subject: Subject): string {
    // If it has AP in the name, it's an AP course
    if (subject.name.includes('AP ')) return 'AP Course';
    
    // Use level if available
    if (subject.level) return subject.level;
    
    // Default tags based on categories
    switch(subject.category) {
      case 'Mathematics':
        return subject.name.includes('Calculus') || subject.name.includes('Statistics') ? 
          'Advanced Math' : 'Core Math';
      case 'Science':
        return subject.name.includes('Biology') ? 'Life Science' : 
          subject.name.includes('Chemistry') || subject.name.includes('Physics') ? 
          'Physical Science' : 'Science';
      case 'Language Arts':
        return subject.name.includes('Writing') ? 'Writing' : 'Literature';
      case 'Social Studies':
        return subject.name.includes('History') ? 'History' : 
          subject.name.includes('Government') || subject.name.includes('Politics') ? 
          'Civics' : 'Social Studies';
      default:
        return subject.category;
    }
  }
  
  // Check if a subject is an AP class
  function isAPClass(subject: EnhancedSubject): boolean {
    const name = subject.name?.toLowerCase() || '';
    const category = subject.category?.toLowerCase() || '';
    const tag = subject.tag?.toLowerCase() || '';
    
    return name.startsWith('ap ') || 
           category.includes('ap ') ||
           tag.includes('ap ');
  }
  
  // Modal control functions
  async function openModal(subject: EnhancedSubject, isAP: boolean, trigger?: HTMLElement) {
    lastTrigger = trigger ?? (document.activeElement as HTMLElement | null);
    activeSubject = subject;
    isAPSelected = isAP;
    modalOpen = true;
    document.body.style.overflow = 'hidden';
    await tick();

    // move focus into dialog
    if (dialogEl) {
      const focusables = getFocusable(dialogEl);
      (focusables[0] ?? dialogEl).focus();
    }
  }
  
  function closeModal() {
    modalOpen = false;
    activeSubject = null;
    document.body.style.overflow = '';
    // return focus to last trigger for a11y
    lastTrigger?.focus();
  }

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
  
  function onDialogKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      e.preventDefault();
      closeModal();
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

  // Function to navigate to tutorfilter page with selected subject
  function selectPlan() {
    // Make sure we have an active subject
    if (!activeSubject) return;
    
    // Get the subject name
    const subjectName = activeSubject.name || '';
    
    // Format the subject name appropriately based on its type
    let fullSubjectName = '';
    if (isAPSelected) {
      // For AP subjects, ensure "AP" is in the name
      fullSubjectName = subjectName.toLowerCase().startsWith('ap ') ? subjectName : `AP ${subjectName}`;
    } else {
      // For Regular subjects, remove any "AP" prefix if present
      fullSubjectName = subjectName.replace(/^AP\s+/i, '');
    }

    // Redirect to tutor search page with subject filter (no quiz modal here)
    const target = `/tutorfilter?subject=${encodeURIComponent(fullSubjectName)}`;
    // Ensure body scroll is restored and modal closed before navigating
    document.body.style.overflow = '';
    modalOpen = false;
    activeSubject = null;
    if (typeof window !== 'undefined') {
      window.location.href = target; // force hard navigation to avoid any lingering in-page state
    }
  }
  
  // Additional subjects with descriptions
  const additionalSubjects = [
    // AP Capstone Diploma Program
    { name: "AP Research", description: "Conduct in-depth research, analyze information, and create academic papers with evidence-based arguments.", category: "AP Capstone Diploma Program", level: "Advanced Placement" },
    { name: "AP Seminar", description: "Investigate real-world issues, analyze perspectives, and craft well-reasoned arguments through various media.", category: "AP Capstone Diploma Program", level: "Advanced Placement" },
    
    // AP Arts
    { name: "AP 2-D Art and Design", description: "Develop a portfolio showcasing 2-D design skills through photography, digital art, and mixed media.", category: "AP Arts", level: "Advanced Placement" },
    { name: "AP 3-D Art and Design", description: "Create three-dimensional artwork demonstrating sculptural concepts, processes, and techniques.", category: "AP Arts", level: "Advanced Placement" },
    { name: "AP Drawing", description: "Develop drawing skills through observation, abstraction, invention, and decision-making using various media.", category: "AP Arts", level: "Advanced Placement" },
    { name: "AP Art History", description: "Explore the history of art across cultures through analysis of architecture, sculpture, painting, and other media.", category: "AP Arts", level: "Advanced Placement" },
    { name: "AP Music Theory", description: "Understand musical structure, notation, composition, and the development of aural skills.", category: "AP Arts", level: "Advanced Placement" },
    
    // AP English
    { name: "AP English Language and Composition", description: "Analyze and interpret non-fiction texts while developing evidence-based analytical and argumentative essays.", category: "AP English", level: "Advanced Placement" },
    { name: "AP English Literature and Composition", description: "Engage with literary works to analyze themes, styles, and literary devices in depth.", category: "AP English", level: "Advanced Placement" },
    
    // AP History and Social Sciences
    { name: "AP African American Studies", description: "Interdisciplinary exploration of the African American experience through historical, cultural, and political contexts.", category: "AP History and Social Sciences", level: "Advanced Placement" },
    { name: "AP Comparative Government and Politics", description: "Compare political institutions and processes across countries including the UK, Russia, China, Mexico, Nigeria, and Iran.", category: "AP History and Social Sciences", level: "Advanced Placement" },
    { name: "AP European History", description: "Examine European history from 1450 to the present, with focus on cultural, economic, political, and social developments.", category: "AP History and Social Sciences", level: "Advanced Placement" },
    { name: "AP Human Geography", description: "Study patterns and processes that have shaped human understanding, use, and alteration of Earth's surface.", category: "AP History and Social Sciences", level: "Advanced Placement" },
    { name: "AP Macroeconomics", description: "Analyze economic principles that apply to the economy as a whole, including national income and price-level determination.", category: "AP History and Social Sciences", level: "Advanced Placement" },
    { name: "AP Microeconomics", description: "Explore principles of economics that apply to individual decision-makers within economic systems.", category: "AP History and Social Sciences", level: "Advanced Placement" },
    { name: "AP Psychology", description: "Explore concepts, theories, and human behavior through scientific inquiry and psychological research methods.", category: "AP History and Social Sciences", level: "Advanced Placement" },
    { name: "AP United States Government and Politics", description: "Examine American political beliefs, constitutional foundations, civil liberties, and policy-making processes.", category: "AP History and Social Sciences", level: "Advanced Placement" },
    { name: "AP United States History", description: "Investigate significant events, individuals, developments, and processes in American history from 1491 to the present.", category: "AP History and Social Sciences", level: "Advanced Placement" },
    { name: "AP World History: Modern", description: "Study significant events, people, and developments in world history from approximately 1200 CE to the present.", category: "AP History and Social Sciences", level: "Advanced Placement" },
    
    // AP Math and Computer Science
    { name: "AP Calculus AB", description: "Cover limits, derivatives, integrals, and the Fundamental Theorem of Calculus with applications.", category: "AP Math and Computer Science", level: "Advanced Placement" },
    { name: "AP Calculus BC", description: "Extend AB calculus concepts to include series, polar functions, parametric equations, and vector calculus.", category: "AP Math and Computer Science", level: "Advanced Placement" },
    { name: "AP Computer Science A", description: "Focus on Java programming with emphasis on problem-solving, algorithms, and object-oriented design.", category: "AP Math and Computer Science", level: "Advanced Placement" },
    { name: "AP Computer Science Principles", description: "Explore creative aspects of programming, abstractions, algorithms, big data, and internet impacts.", category: "AP Math and Computer Science", level: "Advanced Placement" },
    { name: "AP Precalculus", description: "Develop a deep understanding of functions and mathematical modeling as preparation for calculus.", category: "AP Math and Computer Science", level: "Advanced Placement" },
    { name: "AP Statistics", description: "Learn concepts of statistics and probability with data analysis, experimental design, and statistical inference.", category: "AP Math and Computer Science", level: "Advanced Placement" },
    
    // AP Sciences
    { name: "AP Biology", description: "Explore evolution, cellular processes, genetics, biochemistry, and ecology through inquiry-based investigations.", category: "AP Sciences", level: "Advanced Placement" },
    { name: "AP Chemistry", description: "Study atomic structure, chemical reactions, thermodynamics, and molecular interactions through lab work.", category: "AP Sciences", level: "Advanced Placement" },
    { name: "AP Environmental Science", description: "Examine environmental concepts, Earth systems, resources, population dynamics, pollution, and global changes.", category: "AP Sciences", level: "Advanced Placement" },
    { name: "AP Physics 1: Algebra-Based", description: "Cover Newtonian mechanics, work, energy, power, mechanical waves, sound, and electric circuits.", category: "AP Sciences", level: "Advanced Placement" },
    { name: "AP Physics 2: Algebra-Based", description: "Explore fluid mechanics, thermodynamics, electricity, magnetism, optics, and quantum physics.", category: "AP Sciences", level: "Advanced Placement" },
    { name: "AP Physics C: Electricity and Magnetism", description: "Study electrostatics, conductors, capacitors, dielectrics, circuits, magnetic fields, and electromagnetism with calculus.", category: "AP Sciences", level: "Advanced Placement" },
    { name: "AP Physics C: Mechanics", description: "Cover kinematics, Newton's laws, work, energy, power, systems, rotation, and oscillations with calculus.", category: "AP Sciences", level: "Advanced Placement" },
    
    // AP World Languages and Cultures
    { name: "AP Chinese Language and Culture", description: "Develop Mandarin proficiency while exploring Chinese culture, practices, perspectives, and products.", category: "AP World Languages and Cultures", level: "Advanced Placement" },
    { name: "AP French Language and Culture", description: "Build French language skills while examining contemporary Francophone cultures worldwide.", category: "AP World Languages and Cultures", level: "Advanced Placement" },
    { name: "AP German Language and Culture", description: "Enhance German fluency and cultural understanding through authentic materials and contexts.", category: "AP World Languages and Cultures", level: "Advanced Placement" },
    { name: "AP Italian Language and Culture", description: "Develop Italian communication skills while exploring Italian culture, art, literature, and history.", category: "AP World Languages and Cultures", level: "Advanced Placement" },
    { name: "AP Japanese Language and Culture", description: "Build Japanese language proficiency and understanding of Japanese cultural perspectives and practices.", category: "AP World Languages and Cultures", level: "Advanced Placement" },
    { name: "AP Latin", description: "Read, translate, analyze, and interpret Virgil's Aeneid and Caesar's Gallic War in Latin.", category: "AP World Languages and Cultures", level: "Advanced Placement" },
    { name: "AP Spanish Language and Culture", description: "Develop Spanish communication skills through authentic materials from various Hispanic contexts.", category: "AP World Languages and Cultures", level: "Advanced Placement" },
    { name: "AP Spanish Literature and Culture", description: "Study representative works from Hispanic literature spanning from medieval to modern periods.", category: "AP World Languages and Cultures", level: "Advanced Placement" },
    
    // High School Core Subjects
    { name: "Algebra I", description: "Learn fundamental algebraic concepts, equations, functions, and problem-solving strategies.", category: "High School Core Subjects", level: "Core Math" },
    { name: "Algebra II", description: "Explore advanced algebraic topics including complex numbers, logarithms, and function analysis.", category: "High School Core Subjects", level: "Core Math" },
    { name: "Geometry", description: "Study shapes, sizes, properties of space, and geometric proofs with logical reasoning.", category: "High School Core Subjects", level: "Core Math" },
    { name: "Precalculus", description: "Prepare for calculus by covering functions, complex numbers, and analytical geometry concepts.", category: "High School Core Subjects", level: "Advanced Math" },
    { name: "Trigonometry", description: "Focus on trigonometric functions, identities, equations, and applications to triangles.", category: "High School Core Subjects", level: "Advanced Math" },
    { name: "English 9", description: "Develop reading, writing, and analytical skills through literary genres and composition.", category: "High School Core Subjects", level: "Core English" },
    { name: "English 10", description: "Explore world literature with emphasis on literary analysis and advanced composition.", category: "High School Core Subjects", level: "Core English" },
    { name: "English 11", description: "Study American literature and rhetoric with focus on critical thinking and research writing.", category: "High School Core Subjects", level: "Core English" },
    { name: "English 12", description: "Examine British and world literature with college-level writing and analytical skills.", category: "High School Core Subjects", level: "Core English" },
    { name: "Biology", description: "Investigate life processes, organisms, ecosystems, and cellular and molecular mechanisms.", category: "High School Core Subjects", level: "Core Science" },
    { name: "Chemistry", description: "Explore matter, atomic structure, bonding, reactions, and quantitative chemistry concepts.", category: "High School Core Subjects", level: "Core Science" },
    { name: "Physics", description: "Study forces, energy, motion, waves, electricity, and other fundamental physics concepts.", category: "High School Core Subjects", level: "Core Science" },
    { name: "Earth Science", description: "Learn about Earth's systems, geology, meteorology, oceanography, and astronomy.", category: "High School Core Subjects", level: "Core Science" },
    { name: "World History", description: "Examine global civilizations, events, innovations, and cultural developments over time.", category: "High School Core Subjects", level: "Core History" },
    { name: "U.S. History", description: "Study American history, politics, social movements, and cultural developments.", category: "High School Core Subjects", level: "Core History" },
    { name: "Government/Civics", description: "Analyze political systems, governance structures, rights, and civic responsibilities.", category: "High School Core Subjects", level: "Social Studies" },
    { name: "Economics", description: "Explore how societies allocate resources and make decisions in market-based economies.", category: "High School Core Subjects", level: "Social Studies" },
    
    // High School Electives
    { name: "Creative Writing", description: "Develop imaginative writing skills across various genres including poetry, fiction, and screenplays.", category: "High School Electives", level: "Language Arts" },
    { name: "Journalism", description: "Learn reporting, writing, editing, and media production skills for print and digital formats.", category: "High School Electives", level: "Language Arts" },
    { name: "Speech and Debate", description: "Develop public speaking, research, argumentation, and competitive debate skills.", category: "High School Electives", level: "Language Arts" },
    { name: "Film Studies", description: "Analyze film as an art form, examining techniques, history, genres, and cultural impacts.", category: "High School Electives", level: "Arts" },
    { name: "Computer Science", description: "Learn programming fundamentals, algorithms, data structures, and computational thinking.", category: "High School Electives", level: "Technology" },
    { name: "Web Design", description: "Create websites using HTML, CSS, JavaScript, and responsive design principles.", category: "High School Electives", level: "Technology" },
    { name: "Robotics", description: "Apply engineering concepts to design, build, program, and operate robots for specific tasks.", category: "High School Electives", level: "Technology" },
    { name: "Psychology", description: "Explore human behavior, mental processes, development, personality, and psychological disorders.", category: "High School Electives", level: "Social Sciences" },
    { name: "Sociology", description: "Study human society, social institutions, relationships, and the effects of group membership.", category: "High School Electives", level: "Social Sciences" },
    { name: "Personal Finance", description: "Develop money management skills, including budgeting, investing, credit, and financial planning.", category: "High School Electives", level: "Practical Arts" },
    
    // Middle School Core Subjects
    { name: "6th Grade Math", description: "Develop foundational math skills including ratios, proportions, basic equations, and geometry.", category: "Middle School Core Subjects", level: "Core Math" },
    { name: "7th Grade Math", description: "Build on proportional relationships, operations with rational numbers, and algebraic expressions.", category: "Middle School Core Subjects", level: "Core Math" },
    { name: "8th Grade Math", description: "Prepare for algebra with linear equations, functions, geometric transformations, and statistics.", category: "Middle School Core Subjects", level: "Core Math" },
    { name: "Pre-Algebra", description: "Bridge arithmetic and algebra with variables, expressions, equations, and problem-solving.", category: "Middle School Core Subjects", level: "Core Math" },
    { name: "6th Grade English", description: "Develop reading comprehension, writing skills, grammar, and vocabulary through literature.", category: "Middle School Core Subjects", level: "Core English" },
    { name: "7th Grade English", description: "Advance reading analysis, composition techniques, grammar usage, and research skills.", category: "Middle School Core Subjects", level: "Core English" },
    { name: "8th Grade English", description: "Strengthen literary analysis, argumentative writing, and preparation for high school English.", category: "Middle School Core Subjects", level: "Core English" },
    { name: "6th Grade Science", description: "Explore earth science, life science, and physical science with hands-on activities.", category: "Middle School Core Subjects", level: "Core Science" },
    { name: "7th Grade Science", description: "Investigate life science topics including cells, genetics, evolution, and human body systems.", category: "Middle School Core Subjects", level: "Core Science" },
    { name: "8th Grade Science", description: "Focus on physical science concepts including chemistry, physics, energy, and forces.", category: "Middle School Core Subjects", level: "Core Science" },
    { name: "6th Grade Social Studies", description: "Study ancient civilizations, world geography, and early human cultural development.", category: "Middle School Core Subjects", level: "Core History" },
    { name: "7th Grade Social Studies", description: "Explore world history from the Middle Ages through the Age of Exploration.", category: "Middle School Core Subjects", level: "Core History" },
    { name: "8th Grade Social Studies", description: "Focus on American history from colonization through Reconstruction.", category: "Middle School Core Subjects", level: "Core History" },
    
    // Middle School Electives
    { name: "Beginning Band", description: "Learn instrumental music basics, including reading music and playing techniques.", category: "Middle School Electives", level: "Arts" },
    { name: "Choir", description: "Develop vocal skills, music theory knowledge, and performance experience in group singing.", category: "Middle School Electives", level: "Arts" },
    { name: "Art", description: "Explore various art forms, techniques, materials, and principles of design.", category: "Middle School Electives", level: "Arts" },
    { name: "Drama", description: "Learn acting fundamentals, stage techniques, script analysis, and theatrical production.", category: "Middle School Electives", level: "Arts" },
    { name: "Computer Applications", description: "Master basic computing skills including typing, word processing, spreadsheets, and presentations.", category: "Middle School Electives", level: "Technology" },
    { name: "Health", description: "Study physical, mental, and social wellbeing, including nutrition and healthy choices.", category: "Middle School Electives", level: "Health" },
    { name: "Physical Education", description: "Develop physical fitness, motor skills, and knowledge of various sports and activities.", category: "Middle School Electives", level: "Physical Education" },
    { name: "Study Skills", description: "Build organizational strategies, time management, note-taking, and test preparation skills.", category: "Middle School Electives", level: "Academic Support" },
    { name: "Foreign Language Introduction", description: "Explore basic vocabulary, grammar, and cultural aspects of world languages.", category: "Middle School Electives", level: "Languages" },
    
    // Elementary Subjects
    { name: "Elementary Reading", description: "Develop phonics, comprehension, fluency, vocabulary, and reading analysis skills.", category: "Elementary Subjects", level: "Core Skills" },
    { name: "Elementary Writing", description: "Learn sentence construction, paragraph development, creative writing, and self-expression.", category: "Elementary Subjects", level: "Core Skills" },
    { name: "Elementary Math", description: "Master number sense, operations, measurement, geometry, and problem-solving strategies.", category: "Elementary Subjects", level: "Core Skills" },
    { name: "Elementary Science", description: "Explore basic scientific concepts through hands-on experiments and observations.", category: "Elementary Subjects", level: "Core Skills" },
    { name: "Elementary Social Studies", description: "Learn about communities, geography, history, cultures, and civic engagement.", category: "Elementary Subjects", level: "Core Skills" }
  ];

  // Load actual subjects from Firestore and get tutor counts
  onMount(async () => {
    if (browser) {
      try {
        loading = true;
        console.log("Starting to load subjects and tutors");
        
        // Initialize all categories as collapsed by default
        expandedCategories = {};
        
        // Fetch subjects from Firestore
        let subjects: Subject[] = [];
        try {
          subjects = await subjectService.getAllSubjects();
          console.log(`Loaded ${subjects.length} subjects from Firestore`);
        } catch (subjectError) {
          console.error("Error fetching subjects:", subjectError);
          subjects = []; // Set to empty array if fetch fails
        }
        
        // Add our comprehensive list of subjects as supplemental data
        // This ensures we have a complete catalog even if Firestore has limited subjects
        const existingSubjectNames = subjects.map(s => s.name.toLowerCase());
        
        // Add supplemental subjects that don't already exist in Firestore
        const supplementalSubjects = additionalSubjects
          .filter(subject => !existingSubjectNames.includes(subject.name.toLowerCase()))
          .map((subject, index) => ({
            ...subject,
            id: `supplemental-${index}` // Add IDs for supplemental subjects
          }));
          
        console.log(`Added ${supplementalSubjects.length} supplemental subjects`);
        subjects = [...subjects, ...supplementalSubjects];
        
        // Get all tutors (we'll use this to count tutors per subject)
        let tutors: { id?: string; name: string; subjects: string[]; education: string; experience: string; bio: string; image: string; }[] = [];
        try {
          tutors = await tutorService.getAllTutors();
          console.log(`Loaded ${tutors.length} tutors from Firestore`);
        } catch (tutorError) {
          console.error("Error fetching tutors:", tutorError);
        }
        
        // Process subjects with tutor counts - with safer handling
        const enhancedSubjects = await Promise.all(subjects.map(async (subject) => {
          // Safety check - ensure subject has a name
          if (!subject?.name) {
            console.error("Subject without name detected:", subject);
            return {
              ...subject,
              emoji: '❓',
              tag: 'Unknown',
              tutorCount: 0,
              apTutorCount: 0,
              nonApTutorCount: 0
            };
          }

          try {
            // Count tutors for this subject using actual tutor data for ALL subjects
            // For each subject, we need to count:
            // 1. Total tutors teaching this subject (in either AP or non-AP form)
            // 2. Tutors teaching specifically the AP version
            // 3. Tutors teaching specifically the non-AP version

            // Normalize subject name for comparison
            const normalizedName = subject.name.toLowerCase();
            const isAPSubject = normalizedName.startsWith('ap ');
            const baseSubjectName = isAPSubject ? normalizedName.substring(3) : normalizedName;
            
            // Find AP and non-AP versions of the subject
            const apVersionName = `ap ${baseSubjectName}`;
            const nonApVersionName = baseSubjectName;

            // Define the matching function to handle edge cases
            const matchesSubject = (tutorSubject = '', targetSubject = '') => {
              if (!tutorSubject) return false;
              
              const ts = tutorSubject.toLowerCase().trim();
              return ts === targetSubject || 
                    // Handle cases where spaces might be different
                    ts.replace(/\s+/g, '') === targetSubject.replace(/\s+/g, '') ||
                    // Handle cases where there might be period after "AP"
                    ts.replace('ap.', 'ap ') === targetSubject;
            };

            // Count tutors teaching this subject (AP or non-AP version) - with safer array handling
            const matchingTutors = tutors.filter(tutor => 
              tutor?.subjects && Array.isArray(tutor.subjects) && tutor.subjects.some((s: string) => {
                if (typeof s !== 'string') return false;
                const tutorSubject = s.toLowerCase();
                return matchesSubject(tutorSubject, normalizedName) || 
                      matchesSubject(tutorSubject, apVersionName) || 
                      (isAPSubject && matchesSubject(tutorSubject, baseSubjectName));
              })
            );
            
            const tutorCount = matchingTutors.length;
            
            // Count AP tutors specifically
            const apTutorCount = tutors.filter(tutor => 
              tutor?.subjects && Array.isArray(tutor.subjects) && tutor.subjects.some((s: string) => {
                if (typeof s !== 'string') return false;
                const tutorSubject = s.toLowerCase();
                return matchesSubject(tutorSubject, apVersionName) || 
                      (isAPSubject && matchesSubject(tutorSubject, normalizedName));
              })
            ).length;
            
            // Count non-AP tutors specifically
            const nonApTutorCount = tutors.filter(tutor => 
              tutor?.subjects && Array.isArray(tutor.subjects) && tutor.subjects.some((s: string) => {
                if (typeof s !== 'string') return false;
                const tutorSubject = s.toLowerCase();
                return matchesSubject(tutorSubject, nonApVersionName) && 
                      !matchesSubject(tutorSubject, apVersionName);
              })
            ).length;
            
            return {
              ...subject,
              emoji: getEmoji(subject),
              tag: getTag(subject),
              tutorCount,
              apTutorCount,
              nonApTutorCount
            };
          } catch (err) {
            console.error(`Error processing subject ${subject.name}:`, err);
            return {
              ...subject,
              emoji: getEmoji(subject),
              tag: getTag(subject),
              tutorCount: 0,
              apTutorCount: 0,
              nonApTutorCount: 0
            };
          }
          
          // No longer needed - this code has been moved into the try/catch block for each subject
        }));
        
        allSubjects = enhancedSubjects;
        
        // Group subjects by category
        categorizedSubjects = allSubjects.reduce((acc, subject) => {
          if (!acc[subject.category]) {
            acc[subject.category] = [];
          }
          acc[subject.category].push(subject);
          return acc;
        }, {} as Record<string, EnhancedSubject[]>);
        
        // Initialize filtered subjects with all subjects
        filteredSubjects = [...allSubjects];
        loading = false;
      } catch (e) {
        console.error("Error fetching or processing subjects:", e);
        
        // Extract more specific error message
        if (e instanceof Error) {
          console.error("Error details:", e.message);
          error = `Failed to load subjects: ${e.message}. Please try again.`;
        } else {
          error = "Failed to load subjects. Please try again.";
        }
        
        // Even with an error, we can still show supplemental subjects
        if (allSubjects.length === 0) {
          // Create fallback subjects from our additionalSubjects if we have nothing else
          allSubjects = additionalSubjects.map((subject, index) => ({
            ...subject,
            id: `supplemental-fallback-${index}`,
            emoji: getEmoji(subject),
            tag: getTag(subject),
            tutorCount: 0,
            apTutorCount: 0,
            nonApTutorCount: 0
          }));
          
          // Group subjects by category
          categorizedSubjects = allSubjects.reduce((acc, subject) => {
            if (!acc[subject.category]) {
              acc[subject.category] = [];
            }
            acc[subject.category].push(subject);
            return acc;
          }, {} as Record<string, EnhancedSubject[]>);
          
          // Initialize filtered subjects
          filteredSubjects = [...allSubjects];
          
          console.log("Using fallback subjects after error");
          error = "⚠️ Using fallback subject data. Tutor availability information is not accurate.";
        }
        
        loading = false;
      } finally {
        // Ensure loading state is reset even if there was an error
        loading = false;
      }
    }
  });
  
  // Filter subjects based on search query
  function handleSearch() {
    if (!searchQuery.trim()) {
      filteredSubjects = [...allSubjects];
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    filteredSubjects = allSubjects.filter(subject => 
      subject.name.toLowerCase().includes(query) || 
      subject.description.toLowerCase().includes(query) ||
      subject.category.toLowerCase().includes(query) ||
      (subject.tag && subject.tag.toLowerCase().includes(query))
    );
  }
  
  // Function to get gradient class based on category
  function getCategoryGradient(category: string): string {
    switch(category) {
      case 'Mathematics':
        return 'from-blue-50 to-indigo-50';
      case 'Science':
        return 'from-green-50 to-emerald-50';
      case 'Language Arts':
        return 'from-purple-50 to-violet-50';
      case 'Social Studies':
        return 'from-amber-50 to-orange-50';
      case 'College Board':
        return 'from-red-50 to-rose-50';
      case 'Foreign Languages':
        return 'from-sky-50 to-cyan-50';
      case 'Computer Science':
        return 'from-indigo-50 to-blue-50';
      case 'Test Prep':
        return 'from-teal-50 to-emerald-50';
      case 'Arts':
        return 'from-fuchsia-50 to-pink-50';
      default:
        return 'from-gray-50 to-slate-50';
    }
  }
</script>

<svelte:head>
  <title>All Subjects | WiseOwl</title>
</svelte:head>

<!-- Soft animated background -->
<div class="bg">
  <div class="blob b1"></div>
  <div class="blob b2"></div>
  <div class="blob b3"></div>
</div>

<!-- HERO -->
<section class="relative z-[1] text-center mb-12">
  <h1 class="text-5xl font-extrabold text-[#151f54] mb-4 tracking-tight">
    <span class="bg-clip-text text-transparent bg-gradient-to-r from-[#151f54] to-[#4152a8]">All Subjects</span>
  </h1>
  <p class="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
    Browse our complete catalog of subjects or search for specific topics. 
    Click on any subject card to find specialized tutors ready to help you excel.
  </p>
</section>

<!-- SEARCH & FILTER SECTION -->
<div class="max-w-6xl mx-auto px-4 mb-12 relative z-[1]">
  <!-- Search bar -->
  <div class="mb-6">
    <div class="bg-white rounded-xl shadow-lg border border-gray-100 flex items-center p-3 transition-shadow duration-300 hover:shadow-xl">
      <div class="p-2 bg-indigo-50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input 
        type="text" 
        bind:value={searchQuery} 
        on:input={handleSearch}
        class="flex-1 p-3 focus:outline-none text-gray-700 text-lg" 
        placeholder="Search subjects by name, tag, description, or category..." 
        aria-label="Search subjects"
      />
      {#if searchQuery.trim()}
        <button 
          class="p-2 text-gray-400 hover:text-gray-600"
          on:click={() => { searchQuery = ''; handleSearch(); }}
          aria-label="Clear search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </button>
      {/if}
    </div>
  </div>
  
  <!-- Category quick filters -->
  <div class="overflow-x-auto pb-3">
    <div class="flex space-x-3 min-w-max">
      {#if !loading && categorizedSubjects}
        {#each Object.keys(categorizedSubjects).sort() as category}
          <button 
            class="px-4 py-2.5 bg-white rounded-full shadow-sm border text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center"
            class:border-indigo-500={searchQuery === category}
            class:bg-indigo-50={searchQuery === category}
            class:text-indigo-700={searchQuery === category}
            class:border-gray-200={searchQuery !== category}
            on:click={() => {
              searchQuery = searchQuery === category ? '' : category;
              handleSearch();
            }}
          >
            <span class="mr-2">{categoryEmojis[category] || '📚'}</span>
            <span>{category}</span>
            <span class="ml-2 bg-gray-100 text-gray-700 text-xs rounded-full px-2 py-0.5">
              {categorizedSubjects[category].length}
            </span>
          </button>
        {/each}
      {/if}
    </div>
  </div>
</div>

<!-- CONTENT -->
<div class="max-w-7xl mx-auto px-4 relative z-[1]" aria-hidden={modalOpen}>
  {#if loading}
    <div class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#151f54]"></div>
      <p class="mt-4 text-gray-600 text-lg">Loading subjects and counting available tutors...</p>
      <p class="mt-2 text-gray-500 text-sm">This may take a moment as we check tutor availability for each subject</p>
    </div>
  {:else if error}
    <div class="text-center py-10">
      <div class="text-red-500 mb-2">⚠️</div>
      <p class="text-red-500">{error}</p>
    </div>
  {:else if filteredSubjects.length === 0}
    <div class="text-center py-10" transition:fade>
      <p class="text-gray-600">No subjects match your search. Try a different keyword.</p>
    </div>
  {:else}
    <!-- Jump to section navigation for categories -->
    {#if !searchQuery.trim() && Object.keys(categorizedSubjects).length > 5}
      <div class="mb-12 p-6 bg-white rounded-xl shadow-sm border border-gray-100" transition:fade>
        <h2 class="text-xl font-bold text-[#151f54] mb-4">Jump to Category</h2>
        <div class="flex flex-wrap gap-3">
          {#each Object.keys(categorizedSubjects).sort() as category}
            <a 
              href={`#${category.replace(/\s+/g, '-').toLowerCase()}`} 
              class="px-3 py-2 bg-gradient-to-br rounded-lg text-sm font-medium transition-transform hover:-translate-y-1 hover:shadow-md flex items-center"
              class:from-blue-50={category.includes('Math')} 
              class:to-indigo-50={category.includes('Math')}
              class:from-green-50={category.includes('Science')} 
              class:to-emerald-50={category.includes('Science')}
              class:from-red-50={category.includes('AP ')} 
              class:to-orange-50={category.includes('AP ')}
              class:from-purple-50={category.includes('English') || category.includes('Language')} 
              class:to-violet-50={category.includes('English') || category.includes('Language')}
              class:from-amber-50={category.includes('History') || category.includes('Social')} 
              class:to-yellow-50={category.includes('History') || category.includes('Social')}
              class:from-sky-50={!category.match(/Math|Science|AP|English|Language|History|Social/)} 
              class:to-cyan-50={!category.match(/Math|Science|AP|English|Language|History|Social/)}
            >
              <span class="mr-2">{categoryEmojis[category] || '📚'}</span>
              {category}
            </a>
          {/each}
        </div>
      </div>
    {/if}
    <!-- Display subject count if filtering -->
    {#if searchQuery.trim()}
      <div class="mb-6 text-center" transition:fade>
        <p class="text-gray-600">Found {filteredSubjects.length} subject{filteredSubjects.length === 1 ? '' : 's'} matching "{searchQuery}"</p>
      </div>
    {/if}
    
    <!-- Group subjects by category -->
    {#each Object.keys(categorizedSubjects).filter(category => filteredSubjects.some(s => s.category === category)) as category}
      <div class="mb-12" transition:fade id={category.replace(/\s+/g, '-').toLowerCase()}>
        <!-- Category header with expand/collapse button -->
        <button 
          on:click={() => toggleCategory(category)}
          class="flex items-center w-full bg-white p-4 rounded-xl shadow-sm border-l-4 cursor-pointer transition-all duration-300 hover:shadow-md mb-0"
          class:mb-6={expandedCategories[category] || searchQuery.trim()}
          style="border-left-color: {category === 'Mathematics' ? '#3b82f6' : category === 'Science' ? '#10b981' : category === 'Language Arts' ? '#8b5cf6' : category === 'Social Studies' ? '#f59e0b' : category === 'College Board' ? '#ef4444' : category === 'Foreign Languages' ? '#0ea5e9' : category === 'Computer Science' ? '#6366f1' : '#6b7280'}"
          aria-expanded={expandedCategories[category] === true}
          aria-controls={`category-${category.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <div class="text-4xl mr-4 p-3 bg-gradient-to-br {getCategoryGradient(category)} rounded-lg shadow-inner">{categoryEmojis[category] || '📚'}</div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-[#151f54]">{category}</h2>
            <p class="text-gray-500 text-sm">
              {categorizedSubjects[category].filter(s => filteredSubjects.includes(s)).length} subjects available
              {#if !expandedCategories[category] && !searchQuery.trim()}
                <span class="text-indigo-500 ml-1">(click to expand)</span>
              {/if}
            </p>
          </div>
          <!-- Expand/collapse icon -->
          <div class="ml-4 text-indigo-500 transition-transform duration-300" class:rotate-180={expandedCategories[category]}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        <!-- Show content when expanded or when search is active -->
        {#if expandedCategories[category] || searchQuery.trim()}
          <div 
            id={`category-${category.replace(/\s+/g, '-').toLowerCase()}`}
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6"
            transition:fly={{ y: 10, duration: 200, opacity: 0.1 }}
          >
            {#each categorizedSubjects[category].filter(s => filteredSubjects.includes(s)) as subject}
              <div 
                class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1"
                transition:fly={{ y: 20, duration: 300 }}
              >
                <div class="p-5 bg-gradient-to-r {getCategoryGradient(subject.category)} flex items-center border-b border-gray-100">
                  <div class="text-3xl mr-3 bg-white p-2 rounded-full shadow-sm">{subject.emoji || categoryEmojis[subject.category] || '📚'}</div>
                  <div>
                    <h3 class="text-xl font-semibold text-[#151f54] truncate">{subject.name}</h3>
                    {#if subject.tag}
                      <span class="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-70 text-indigo-700 border border-indigo-100">
                        {subject.tag}
                      </span>
                    {/if}
                  </div>
                </div>
                
                <div class="p-5">
                  <div class="mb-4">
                    <div class={`text-gray-600 transition-all duration-300 ${expandedDescriptions[subject.id || ''] ? 'h-auto max-h-[120px] overflow-y-auto custom-scrollbar' : 'h-[60px] overflow-hidden line-clamp-3'}`}>
                      {subject.description || "Learn about this exciting subject with our expert tutors."}
                    </div>
                    <button 
                      class="text-blue-600 hover:text-blue-800 text-sm mt-1 font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded-sm"
                      on:click={() => toggleDescription(subject.id || '')}
                      aria-expanded={expandedDescriptions[subject.id || '']}
                      aria-controls={`desc-${subject.id || ''}`}
                    >
                      {expandedDescriptions[subject.id || ''] ? 'Show less' : 'Read more'}
                      <svg xmlns="http://www.w3.org/2000/svg" class={`ml-1 h-4 w-4 transform transition-transform ${expandedDescriptions[subject.id || ''] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <!-- Tutor availability indicators -->
                  <div class="flex flex-col gap-2 mb-4">
                    <!-- Overall tutor count -->
                    <div class="flex items-center">
                      <span class={`inline-flex h-4 w-4 rounded-full mr-2 ${subject.tutorCount > 0 ? 'bg-green-500' : 'bg-red-500'} ring-2 ring-white`}></span>
                      <span class="text-sm text-gray-700 font-medium">
                        {subject.tutorCount || 0} tutor{subject.tutorCount !== 1 ? 's' : ''} available
                      </span>
                    </div>
                  </div>                    <!-- AP/No-AP selection buttons -->
                  <div class="flex flex-col space-y-3 mt-5">
                    <!-- For AP subjects, only show AP tutors button -->
                    {#if isAPClass(subject) && subject.apTutorCount > 0}
                      <button
                        on:click={(e) => openModal(subject, true, e.currentTarget as HTMLElement)}
                        class="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-colors duration-300 shadow-sm"
                      >
                        Find AP Tutors
                      </button>
                    {/if}
                    
                    <!-- For Regular subjects, only show Regular tutors button -->
                    {#if !isAPClass(subject) && subject.nonApTutorCount > 0}
                      <button
                        on:click={(e) => openModal(subject, false, e.currentTarget as HTMLElement)}
                        class="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-lg transition-colors duration-300 shadow-sm"
                      >
                        Find Regular Tutors
                      </button>
                    {/if}
                    
                    <!-- If no tutors available, show appropriate message -->
                    {#if subject.tutorCount === 0}
                      <div class="w-full py-2.5 bg-gray-100 text-gray-500 font-medium rounded-lg text-center">
                        No tutors available
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  {/if}
  
  <!-- Back to popular subjects -->
  <div class="mt-16 mb-16 text-center">
    <a 
      href="/subjects"
      class="inline-flex items-center justify-center px-8 py-4 border border-gray-200 bg-white text-[#151f54] font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-lg"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
      </svg>
      <span>Back to Popular Subjects</span>
    </a>
  </div>
</div>

<!-- ACCESSIBLE MODAL -->
{#if modalOpen && activeSubject}
  <div class="modal-backdrop"
       role="presentation"
       on:click={closeModal}
       transition:fade={{ duration: 200 }}>
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
          <h2 id="dialog-title">{activeSubject.name}</h2>
          {#if isAPSelected}
            <p id="dialog-desc" class="head-sub">AP tutors specialized in College Board curriculum and exam preparation for {activeSubject.name}.</p>
          {:else}
            <p id="dialog-desc" class="head-sub">Regular tutors specialized in grade-level curriculum and concepts for {activeSubject.name}.</p>
          {/if}
        </div>
        <button class="icon-btn" on:click={closeModal} aria-label="Close dialog">✕</button>
      </header>

      <section class="cards">
        {#if isAPSelected}
          <!-- AP Option -->
          <article class="plan" style="animation-delay:.02s; grid-column: span 2;">
            <div class="plan-top">
              <h3 class="plan-title"><span class="chip chip-ap">AP</span> AP {activeSubject.name.replace(/^AP\s+/i, '')} (HS)</h3>
              <span class="badge">College Board Aligned</span>
            </div>
            <p class="tagline">{tierData.ap.tagline}</p>
            <p class="desc">{tierData.ap.desc}</p>
            <ul class="features">{#each tierData.ap.features as f}<li>{f}</li>{/each}</ul>
            <div class="price"><span class="num">${tierData.ap.price}</span><span class="per">/mo</span></div>
            <div class="actions">
              <button class="btn btn-ap" on:click={selectPlan}
                aria-label={`Find tutors for AP ${activeSubject.name}`}>Find AP Tutors</button>
            </div>
          </article>
        {:else}
          <!-- Regular Option -->
          <article class="plan" style="animation-delay:.02s; grid-column: span 2;">
            <div class="plan-top">
              <h3 class="plan-title"><span class="chip chip-reg">Regular</span> {activeSubject.name.replace(/^AP\s+/i, '')} — Regular (M/HS)</h3>
              <span class="badge">Grade-Level Focus</span>
            </div>
            <p class="tagline">{tierData.reg.tagline}</p>
            <p class="desc">{tierData.reg.desc}</p>
            <ul class="features">{#each tierData.reg.features as f}<li>{f}</li>{/each}</ul>
            <div class="price"><span class="num">${tierData.reg.price}</span><span class="per">/mo</span></div>
            <div class="actions">
              <button class="btn btn-reg" on:click={selectPlan}
                aria-label={`Find tutors for Regular ${activeSubject.name}`}>Find Regular Tutors</button>
            </div>
          </article>
        {/if}
      </section>
      
      <div class="note">Cancel anytime · 1-on-1 sessions · Online or in-person · Homework support included</div>
    </div>
  </div>
{/if}

<!-- Removed SessionInfoModal flow: we now redirect to tutor search page with subject filter -->

<style>
  /* Background blobs & animations */
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
  
  /* Line clamping for descriptions */
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  /* Custom scrollbar for subject descriptions */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #c7d2fe #f1f1f1;
    padding-right: 5px;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 5px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 5px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #c7d2fe;
    border-radius: 5px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a5b4fc;
  }
  
  /* Button disabled state */
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Custom scrollbars */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #c7d2fe;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #a5b4fc;
  }
  
  /* Category transition styling */
  button[aria-expanded=true] {
    margin-bottom: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  
  button[aria-expanded=true] .text-indigo-500 {
    color: #4f46e5;
  }
  
  button[aria-expanded=false]:hover .text-indigo-500 {
    color: #6366f1;
  }
  
  /* Modal styling */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-panel {
    background: white;
    border-radius: 1rem;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  .modal-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .modal-head h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #151f54;
    margin: 0;
  }
  
  .head-sub {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
    max-width: 30rem;
  }
  
  .icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
  }
  
  .icon-btn:hover {
    background: #f3f4f6;
    color: #111827;
  }
  
  .cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .plan {
    border-radius: 0.75rem;
    border: 1px solid #e5e7eb;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    animation: fadeIn .3s ease-out forwards;
    opacity: 0;
    transform: translateY(10px);
  }
  
  .plan-top {
    margin-bottom: 0.75rem;
  }
  
  .plan-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #151f54;
    display: flex;
    align-items: center;
    margin: 0;
  }
  
  .chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-right: 0.5rem;
  }
  
  .chip-ap {
    background-color: #dbeafe;
    color: #1e40af;
  }
  
  .chip-reg {
    background-color: #d1fae5;
    color: #047857;
  }
  
  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #4b5563;
    background-color: #f3f4f6;
    margin-top: 0.5rem;
  }
  
  .tagline {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    margin: 0.5rem 0;
  }
  
  .desc {
    font-size: 0.875rem;
    color: #4b5563;
    margin-bottom: 1rem;
  }
  
  .features {
    margin: 0 0 1.5rem 0;
    padding: 0;
    list-style: none;
  }
  
  .features li {
    padding-left: 1.5rem;
    position: relative;
    font-size: 0.875rem;
    color: #4b5563;
    margin-bottom: 0.5rem;
  }
  
  .features li::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #10b981;
    font-weight: bold;
  }
  
  .price {
    margin-top: auto;
    margin-bottom: 1rem;
    display: flex;
    align-items: flex-end;
  }
  
  .num {
    font-size: 2rem;
    font-weight: 700;
    color: #151f54;
  }
  
  .per {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
    margin-left: 0.25rem;
  }
  
  .actions {
    display: flex;
    justify-content: center;
  }
  
  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    width: 100%;
    text-align: center;
  }
  
  .btn-ap {
    background: linear-gradient(to right, #3b82f6, #2563eb);
    color: white;
  }
  
  .btn-ap:hover {
    background: linear-gradient(to right, #2563eb, #1d4ed8);
  }
  
  .btn-reg {
    background: linear-gradient(to right, #6366f1, #4f46e5);
    color: white;
  }
  
  .btn-reg:hover {
    background: linear-gradient(to right, #4f46e5, #4338ca);
  }
  
  .note {
    text-align: center;
    font-size: 0.75rem;
    color: #6b7280;
    padding: 1rem 1.5rem 1.5rem;
  }
  
  @keyframes fadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes cardIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 640px) {
    .cards {
      grid-template-columns: 1fr;
    }
    
    .plan {
      grid-column: span 1 !important;
    }
  }
</style>
