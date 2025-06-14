<script lang="ts">
  function selectSubject(subject: string) {
    console.log(`Selected ${subject} subject`);
    // Navigate to booking or tutor selection
  }
  
  function openContactForm() {
    window.open('', '_blank');
  }
</script>

<!-- Hero Section -->
<div class="text-center mb-12">
  <h1 class="text-5xl font-bold text-[#151f54] mb-6">Explore Our Subject Areas</h1>
  <p class="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
    From Advanced Placement courses to foundational mathematics, our expert tutors are ready to help you excel in any subject. Choose your area of study below.
  </p>
</div>

<!-- Subject Categories -->
<div class="mb-16">
  <h2 class="text-3xl font-bold text-[#151f54] text-center mb-12">Advanced Placement (AP) Classes</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <!-- AP STEM -->
    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors flex flex-col h-full">
      <div class="text-3xl mb-4">🧪</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP Chemistry</h3>
      <p class="text-gray-600 text-sm mb-4 flex-grow">Dive into the world of atoms, reactions, and equations with personalized guidance from our Chemistry specialists who received 5s on the AP exam</p>
      <button 
        on:click={() => selectSubject('AP Chemistry')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold mt-auto"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors flex flex-col h-full">
      <div class="text-3xl mb-4">⚛️</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP Physics</h3>
      <p class="text-gray-600 text-sm mb-4 flex-grow">Explore the laws that govern the universe from gravity to magnetism with constant support along the way</p>
      <button 
        on:click={() => selectSubject('AP Physics')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold mt-auto"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors flex flex-col h-full">
      <div class="text-3xl mb-4">🧬</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP Biology</h3>
      <p class="text-gray-600 text-sm mb-4 flex-grow">Journey through the science of life and get personalised assistance from one of our Biology experts who received 5s on the AP exam</p>
      <button 
        on:click={() => selectSubject('AP Biology')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold mt-auto"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors flex flex-col h-full">
      <div class="text-3xl mb-4">💻</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP Computer Science</h3>
      <p class="text-gray-600 text-sm mb-4 flex-grow">Learn to code and investigate the world of computers with one of our many coders who earned 5s on the AP exam</p>
      <button 
        on:click={() => selectSubject('AP Computer Science')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold mt-auto"
      >
        Find Tutors
      </button>
    </div>

    <!-- AP Humanities -->
    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors flex flex-col h-full">
      <div class="text-3xl mb-4">📜</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP History</h3>
      <p class="text-gray-600 text-sm mb-4 flex-grow">Learn to write Document-Based questions, or how to study for future exams, with a past APUSH student who received a 5 on the AP exam</p>
      <button 
        on:click={() => selectSubject('AP History')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold mt-auto"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors flex flex-col h-full">
      <div class="text-3xl mb-4">📝</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP World History</h3>
      <p class="text-gray-600 text-sm mb-4 flex-grow">Journey through hundreds of years of history with a personal tutor who received a 5 on the AP exam</p>
      <button 
        on:click={() => selectSubject('AP English')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold mt-auto"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors flex flex-col h-full">
      <div class="text-3xl mb-4">🌍</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP English Language</h3>
      <p class="text-gray-600 text-sm mb-4 flex-grow">Hone your rhetorical skills, build argumentation techniques, and prepare to analyze complex texts in order to get a 5 on the AP exam</p>
      <button 
        on:click={() => selectSubject('AP Languages')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold mt-auto"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors flex flex-col h-full">
      <div class="text-3xl mb-4">📊</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP Calculus AB</h3>
      <p class="text-gray-600 text-sm mb-4 flex-grow">Learn derivatives, integrals, and limits with step-by-step strategies that make even tough problems manageable with support from tutors who received 5s on their AP exams</p>
      <button 
        on:click={() => selectSubject('AP Arts')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold mt-auto"
      >
        Find Tutors
      </button>
    </div>
  </div>
</div>

<!-- Mathematics Section -->
<div class="mb-16">
  <h2 class="text-3xl font-bold text-[#151f54] text-center mb-12">Non-AP classes</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors flex flex-col h-full">
      <div class="text-3xl mb-4">🔢</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">Integrated Math 1–3</h3>
      <p class="text-gray-600 text-sm mb-4 flex-grow">Solidify foundational math skills that will be used throughout calculus with one of our mathematics experts who received 5s on the AP calculus exams</p>
      <button 
        on:click={() => selectSubject('Algebra')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold mt-auto"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors flex flex-col h-full">
      <div class="text-3xl mb-4">✏️</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">Middle School English</h3>
      <p class="text-gray-600 text-sm mb-4 flex-grow">Grow as a reader and writer with engaging support in grammar, essays, and reading comprehension with tutors who received full scores on their AP exams</p>
      <button 
        on:click={() => selectSubject('Geometry')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold mt-auto"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors flex flex-col h-full">
      <div class="text-3xl mb-4">🔬</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">Middle School Science</h3>
      <p class="text-gray-600 text-sm mb-4 flex-grow">Discover the things that make the world work, and learn them from a top AP science student who received a 5 on the AP exam</p>
      <button 
        on:click={() => selectSubject('Pre-Calculus')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold mt-auto"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors flex flex-col h-full">
      <div class="text-3xl mb-4">➕</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">Basic Math</h3>
      <p class="text-gray-600 text-sm mb-4 flex-grow">Arithmetic, fractions, decimals, and percentages</p>
      <button 
        on:click={() => selectSubject('Basic Math')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold mt-auto"
      >
        Find Tutors
      </button>
    </div>
  </div>
</div>

<!-- Stats Section -->
<div class="bg-gradient-to-r from-[#151f54] to-[#0f1a3f] rounded-2xl p-8 mb-16 text-white">
  <h2 class="text-3xl font-bold text-center mb-8">Subject Expertise</h2>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
    <div>
      <div class="text-3xl font-bold mb-2">24</div>
      <div class="text-lg">AP Subjects</div>
    </div>
    <div>
      <div class="text-3xl font-bold mb-2">15</div>
      <div class="text-lg">Math Levels</div>
    </div>
    <div>
      <div class="text-3xl font-bold mb-2">95%</div>
      <div class="text-lg">Pass Rate</div>
    </div>
    <div>
      <div class="text-3xl font-bold mb-2">4.8/5</div>
      <div class="text-lg">Average Score</div>
    </div>
  </div>
</div>

<!-- Why Choose Our Subject Tutoring -->
<div class="mb-16">
  <h2 class="text-3xl font-bold text-[#151f54] text-center mb-12">Why Choose Our Subject Tutoring?</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div class="bg-white shadow-lg rounded-2xl p-8 text-center">
      <div class="text-4xl mb-4">🎯</div>
      <h3 class="text-xl font-semibold mb-3 text-[#151f54]">Subject Specialists</h3>
      <p class="text-gray-600">Our tutors specialize in specific subjects and have deep expertise in their fields.</p>
    </div>
    
    <div class="bg-white shadow-lg rounded-2xl p-8 text-center">
      <div class="text-4xl mb-4">📋</div>
      <h3 class="text-xl font-semibold mb-3 text-[#151f54]">Exam Preparation</h3>
      <p class="text-gray-600">Focused preparation for AP exams, final exams, and standardized tests.</p>
    </div>
    
    <div class="bg-white shadow-lg rounded-2xl p-8 text-center">
      <div class="text-4xl mb-4">📚</div>
      <h3 class="text-xl font-semibold mb-3 text-[#151f54]">Custom Materials</h3>
      <p class="text-gray-600">Access to subject-specific study materials, practice problems, and resources.</p>
    </div>
  </div>
</div>

<!-- Contact Section -->
<div class="flex justify-center">
  <div class="bg-white shadow-lg rounded-2xl p-8 max-w-2xl w-full">
    <h3 class="text-2xl font-semibold mb-4 text-[#151f54] text-center">Don't See Your Subject?</h3>
    <p class="text-gray-600 mb-6 text-center text-lg">We cover many more subjects! Contact us to find the perfect tutor for your specific needs.</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="text-center">
        <p class="text-gray-600 text-lg">📧 subjects@wiseowl.com</p>
      </div>
      <div class="text-center">
        <p class="text-gray-600 text-lg">📞 (555) 123-WISE</p>
      </div>
    </div>
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