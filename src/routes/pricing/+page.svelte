<script lang="ts">
  function selectPlan(plan: string) {
    console.log(`Selected ${plan} plan`);
    // Navigate to signup or contact form
  }

  function openContactForm() {
    window.open('', '_blank');
  }
</script>

<!-- Hero Section -->
<div class="text-center mb-12">
  <h1 class="text-5xl font-bold text-[#151f54] mb-6">Choose Your Learning Plan</h1>
  <p class="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
    Flexible pricing options designed to fit your learning needs and budget. All plans include access to our expert tutors and comprehensive learning resources.
    If you're not completely satisfied with your first session, we'll refund your payment in full.
  </p>
</div>

<!-- Pricing Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 items-stretch">
  <!-- Basic Plan -->
  <div class="bg-white shadow-lg rounded-2xl p-8 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors flex flex-col">
    <div class="text-2xl mb-4">📘</div>
    <h3 class="text-2xl font-semibold mb-3 text-[#151f54]">Basic</h3>
    <div class="mb-6">
      <span class="text-4xl font-bold text-[#151f54]">$25</span>
      <span class="text-gray-600">/hour</span>
    </div>
    <p class="text-gray-700 mb-6">
      Perfect for those in Elementary, Middle, or High School taking non-AP classes in nearly all subjects from Spanish to Math.
    </p>
    <ul class="text-left mb-8 space-y-3 flex-1">
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        One-on-one tutoring sessions
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Broad subject support
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Flexible scheduling
      </li>
    </ul>
    <button 
      on:click={() => selectPlan('Basic')}
      class="w-full border-2 border-[#151f54] text-[#151f54] px-6 py-3 rounded-lg hover:bg-[#151f54] hover:text-white transition-colors font-semibold mt-auto"
    >
      Get Started
    </button>
  </div>

  <!-- Advanced Plan -->
  <div class="bg-white shadow-lg rounded-2xl p-8 text-center border-2 border-[#151f54] hover:border-[#151f54] transition-colors flex flex-col">
    <div class="text-2xl mb-4">🎓</div>
    <h3 class="text-2xl font-semibold mb-3 text-[#151f54]">Advanced</h3>
    <div class="mb-6">
      <span class="text-4xl font-bold text-[#151f54]">$35</span>
      <span class="text-gray-600">/hour</span>
    </div>
    <p class="text-gray-700 mb-6">
      Perfect for those in AP classes looking to gain a better understanding of the material and raise both their scores in class and on the AP exam.
    </p>
    <ul class="text-left mb-8 space-y-3 flex-1">
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        AP subject mastery
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Exam prep strategies
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Score improvement tracking
      </li>
    </ul>
    <button 
      on:click={() => selectPlan('Advanced')}
      class="w-full bg-[#151f54] text-white px-6 py-3 rounded-lg hover:bg-[#0f1a3f] transition-colors font-semibold mt-auto"
    >
      Get Started
    </button>
  </div>
</div>

<!-- Package Deals Section -->
<div class="bg-gradient-to-r from-[#151f54] to-[#0f1a3f] rounded-2xl p-8 mb-16 text-white">
  <h2 class="text-3xl font-bold text-center mb-8">Package Deals</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
    <!-- 5 Hours -->
    <div class="flex flex-col items-center">
      <div class="text-2xl font-bold mb-2">5 Hours</div>
      <div class="text-lg mb-2">Save 10%</div>
      <div class="text-sm opacity-90 mb-4">Perfect for exam prep</div>
      <button 
        on:click={() => selectPlan('Basic 5 Hour Package')}
        class="bg-white text-[#151f54] font-semibold px-4 py-2 rounded-lg mb-2 hover:bg-gray-200 transition-colors"
      >
        Basic: $115
      </button>
      <button 
        on:click={() => selectPlan('Advanced 5 Hour Package')}
        class="bg-white text-[#151f54] font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Advanced: $160
      </button>
    </div>

    <!-- 10 Hours -->
    <div class="flex flex-col items-center">
      <div class="text-2xl font-bold mb-2">10 Hours</div>
      <div class="text-lg mb-2">Save 15%</div>
      <div class="text-sm opacity-90 mb-4">Great for ongoing support</div>
      <button 
        on:click={() => selectPlan('Basic 10 Hour Package')}
        class="bg-white text-[#151f54] font-semibold px-4 py-2 rounded-lg mb-2 hover:bg-gray-200 transition-colors"
      >
        Basic: $215
      </button>
      <button 
        on:click={() => selectPlan('Advanced 10 Hour Package')}
        class="bg-white text-[#151f54] font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Advanced: $300
      </button>
    </div>

    <!-- 20 Hours -->
    <div class="flex flex-col items-center">
      <div class="text-2xl font-bold mb-2">20 Hours</div>
      <div class="text-lg mb-2">Save 20%</div>
      <div class="text-sm opacity-90 mb-4">Best value for long-term learning</div>
      <button 
        on:click={() => selectPlan('Basic 20 Hour Package')}
        class="bg-white text-[#151f54] font-semibold px-4 py-2 rounded-lg mb-2 hover:bg-gray-200 transition-colors"
      >
        Basic: $400
      </button>
      <button 
        on:click={() => selectPlan('Advanced 20 Hour Package')}
        class="bg-white text-[#151f54] font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Advanced: $560
      </button>
    </div>
  </div>
</div>



