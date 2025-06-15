<script lang="ts">
  function openContactForm() {
    window.open('', '_blank');
  }
  
  function startTutoring() {
    // Navigate to tutoring page or open scheduling
    console.log('Starting tutoring session...');
  }
  
  function browseSubjects() {
    // Navigate to subjects page
    window.location.href = '/subjects';
    console.log('Browsing subjects...');
  }
</script>

<!-- Hero Section -->
<div class="text-center mb-12">
  <h1 class="text-5xl font-bold text-[#151f54] mb-6">Welcome to WiseOwl Tutoring</h1>
  <p class="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
    Unlock your potential with personalized one-on-one tutoring. Expert tutors ready to help you succeed in any subject, anytime, anywhere.
  </p>
  <div class="flex flex-col sm:flex-row gap-4 justify-center">
    <button 
      on:click={startTutoring}
      class="bg-[#151f54] text-white px-8 py-4 rounded-lg hover:bg-[#0f1a3f] transition-colors text-lg font-semibold"
    >
      Start Learning Now
    </button>
    <button 
      on:click={browseSubjects}
      class="border-2 border-[#151f54] text-[#151f54] px-8 py-4 rounded-lg hover:bg-[#151f54] hover:text-white transition-colors text-lg font-semibold"
    >
      Browse Subjects
    </button>
  </div>
</div>

<!-- Features Grid -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
  <div class="bg-white shadow-lg rounded-2xl p-8 text-center">
    <div class="text-4xl mb-4">🎓</div>
    <h3 class="text-xl font-semibold mb-3 text-[#151f54]">Expert Tutors</h3>
    <p class="text-gray-600">Connect with qualified tutors who are passionate about helping you achieve your academic goals.</p>
  </div>
  
  <div class="bg-white shadow-lg rounded-2xl p-8 text-center">
    <div class="text-4xl mb-4">📚</div>
    <h3 class="text-xl font-semibold mb-3 text-[#151f54]">All Subjects</h3>
    <p class="text-gray-600">From mathematics and science to languages and humanities - we cover every subject you need.</p>
  </div>
  
  <div class="bg-white shadow-lg rounded-2xl p-8 text-center">
    <div class="text-4xl mb-4">🕐</div>
    <h3 class="text-xl font-semibold mb-3 text-[#151f54]">Flexible Schedule</h3>
    <p class="text-gray-600">Learn at your own pace with flexible scheduling that fits your busy lifestyle.</p>
  </div>
</div>

<!-- Stats Section (Clean One-Line Version) -->
<div class="bg-gradient-to-r from-[#151f54] to-[#0f1a3f] rounded-2xl p-8 mb-16 text-white">
  <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
    <div>
      <div class="text-3xl font-bold mb-2">100%</div>
      <div class="text-lg whitespace-nowrap">Tutors scored 4–5 on APs</div>
    </div>
    <div>
      <div class="text-3xl font-bold mb-2">10+</div>
      <div class="text-lg whitespace-nowrap">Subjects available</div>
    </div>
    <div>
      <div class="text-3xl font-bold mb-2">100%</div>
      <div class="text-lg whitespace-nowrap">Parent trial satisfaction</div>
    </div>
    <div>
      <div class="text-3xl font-bold mb-2">7 Days</div>
      <div class="text-lg whitespace-nowrap">Weekly availability</div>
    </div>
  </div>
</div>


<!-- How It Works Section -->
<div class="mb-16">
  <h2 class="text-3xl font-bold text-[#151f54] text-center mb-12">How It Works</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div class="text-center">
      <div class="bg-[#151f54] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
      <h3 class="text-xl font-semibold mb-3 text-[#151f54]">Choose Your Subject</h3>
      <p class="text-gray-600">Select from our wide range of subjects and find the perfect tutor for your needs.</p>
    </div>
    <div class="text-center">
      <div class="bg-[#151f54] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
      <h3 class="text-xl font-semibold mb-3 text-[#151f54]">Schedule Your Session</h3>
      <p class="text-gray-600">Book a convenient time that works for your schedule - day or night.</p>
    </div>
    <div class="text-center">
      <div class="bg-[#151f54] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
      <h3 class="text-xl font-semibold mb-3 text-[#151f54]">Start Learning</h3>
      <p class="text-gray-600">Connect with your tutor and begin your personalized learning journey.</p>
    </div>
  </div>
</div>

<!-- Contact Us Card -->
<div class="flex justify-center">
  <div class="bg-white shadow-lg rounded-2xl p-8 max-w-2xl w-full">
    <h3 class="text-2xl font-semibold mb-4 text-[#151f54] text-center">Ready to Get Started?</h3>
    <p class="text-gray-600 mb-6 text-center text-lg">Have questions about our tutoring services? We're here to help you succeed!</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="text-center">
        <p class="text-gray-600 text-lg">📧 hello@wiseowl.com</p>
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
        Contact Us Today
      </button>
    </div>
  </div>
</div>