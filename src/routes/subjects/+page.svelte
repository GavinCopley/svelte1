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
    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">🧪</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP Chemistry</h3>
      <p class="text-gray-600 text-sm mb-4">Master chemical reactions, thermodynamics, and molecular structures</p>
      <button 
        on:click={() => selectSubject('AP Chemistry')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">⚛️</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP Physics</h3>
      <p class="text-gray-600 text-sm mb-4">Explore mechanics, electricity, magnetism, and modern physics</p>
      <button 
        on:click={() => selectSubject('AP Physics')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">🧬</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP Biology</h3>
      <p class="text-gray-600 text-sm mb-4">Study cellular processes, genetics, evolution, and ecology</p>
      <button 
        on:click={() => selectSubject('AP Biology')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">💻</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP Computer Science</h3>
      <p class="text-gray-600 text-sm mb-4">Learn programming, algorithms, and software development</p>
      <button 
        on:click={() => selectSubject('AP Computer Science')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>

    <!-- AP Humanities -->
    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">📜</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP History</h3>
      <p class="text-gray-600 text-sm mb-4">US History, World History, and European History</p>
      <button 
        on:click={() => selectSubject('AP History')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">📝</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP English</h3>
      <p class="text-gray-600 text-sm mb-4">Literature & Composition and Language & Composition</p>
      <button 
        on:click={() => selectSubject('AP English')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">🌍</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP Languages</h3>
      <p class="text-gray-600 text-sm mb-4">Spanish, French, German, and more foreign languages</p>
      <button 
        on:click={() => selectSubject('AP Languages')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">🎨</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP Arts</h3>
      <p class="text-gray-600 text-sm mb-4">Art History, Studio Art, and Music Theory</p>
      <button 
        on:click={() => selectSubject('AP Arts')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>
  </div>
</div>

<!-- Mathematics Section -->
<div class="mb-16">
  <h2 class="text-3xl font-bold text-[#151f54] text-center mb-12">Mathematics Classes</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">📊</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">Algebra I & II</h3>
      <p class="text-gray-600 text-sm mb-4">Linear equations, quadratics, and polynomial functions</p>
      <button 
        on:click={() => selectSubject('Algebra')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">📐</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">Geometry</h3>
      <p class="text-gray-600 text-sm mb-4">Shapes, proofs, area, volume, and spatial reasoning</p>
      <button 
        on:click={() => selectSubject('Geometry')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">📈</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">Pre-Calculus</h3>
      <p class="text-gray-600 text-sm mb-4">Trigonometry, logarithms, and advanced functions</p>
      <button 
        on:click={() => selectSubject('Pre-Calculus')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">∫</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP Calculus</h3>
      <p class="text-gray-600 text-sm mb-4">Derivatives, integrals, and advanced calculus concepts</p>
      <button 
        on:click={() => selectSubject('AP Calculus')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">📉</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">AP Statistics</h3>
      <p class="text-gray-600 text-sm mb-4">Data analysis, probability, and statistical inference</p>
      <button 
        on:click={() => selectSubject('AP Statistics')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">🔢</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">Discrete Math</h3>
      <p class="text-gray-600 text-sm mb-4">Logic, set theory, combinatorics, and graph theory</p>
      <button 
        on:click={() => selectSubject('Discrete Math')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">🔤</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">Linear Algebra</h3>
      <p class="text-gray-600 text-sm mb-4">Matrices, vectors, and linear transformations</p>
      <button 
        on:click={() => selectSubject('Linear Algebra')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
      >
        Find Tutors
      </button>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-6 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
      <div class="text-3xl mb-4">➕</div>
      <h3 class="text-lg font-semibold mb-3 text-[#151f54]">Basic Math</h3>
      <p class="text-gray-600 text-sm mb-4">Arithmetic, fractions, decimals, and percentages</p>
      <button 
        on:click={() => selectSubject('Basic Math')}
        class="w-full bg-[#151f54] text-white px-4 py-2 rounded-lg hover:bg-[#0f1a3f] transition-colors text-sm font-semibold"
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