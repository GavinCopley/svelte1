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
  </p>
</div>

<!-- Pricing Cards -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-start">
  <!-- Basic Plan -->
  <div class="bg-white shadow-lg rounded-2xl p-8 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
    <div class="text-2xl mb-4">📚</div>
    <h3 class="text-2xl font-semibold mb-3 text-[#151f54]">Basic</h3>
    <div class="mb-6">
      <span class="text-4xl font-bold text-[#151f54]">$29</span>
      <span class="text-gray-600">/hour</span>
    </div>
    <ul class="text-left mb-8 space-y-3">
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        One-on-one tutoring sessions
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Basic subject coverage
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Email support
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Flexible scheduling
      </li>
    </ul>
    <button 
      on:click={() => selectPlan('Basic')}
      class="w-full border-2 border-[#151f54] text-[#151f54] px-6 py-3 rounded-lg hover:bg-[#151f54] hover:text-white transition-colors font-semibold"
    >
      Get Started
    </button>
  </div>

  <!-- Premium Plan -->
  <div class="bg-white shadow-lg rounded-2xl p-9 text-center border-2 border-[#151f54] relative">
    <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#151f54] text-white px-4 py-1 rounded-full text-sm font-semibold">
      Most Popular
    </div>
    <div class="text-2xl mb-5">🎓</div>
    <h3 class="text-2xl font-semibold mb-4 text-[#151f54]">Premium</h3>
    <div class="mb-7">
      <span class="text-4xl font-bold text-[#151f54]">$49</span>
      <span class="text-gray-600">/hour</span>
    </div>
    <ul class="text-left mb-10 space-y-3">
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Expert tutor matching
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        All subjects covered
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Priority support
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Study materials included
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Progress tracking
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Weekly progress reports
      </li>
    </ul>
    <button 
      on:click={() => selectPlan('Premium')}
      class="w-full bg-[#151f54] text-white px-6 py-3 rounded-lg hover:bg-[#0f1a3f] transition-colors font-semibold"
    >
      Get Started
    </button>
  </div>

  <!-- Elite Plan -->
  <div class="bg-white shadow-lg rounded-2xl p-8 text-center border-2 border-gray-200 hover:border-[#151f54] transition-colors">
    <div class="text-2xl mb-4">👑</div>
    <h3 class="text-2xl font-semibold mb-3 text-[#151f54]">Elite</h3>
    <div class="mb-6">
      <span class="text-4xl font-bold text-[#151f54]">$79</span>
      <span class="text-gray-600">/hour</span>
    </div>
    <ul class="text-left mb-8 space-y-3">
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Top-tier expert tutors
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Unlimited subject access
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        24/7 priority support
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Custom learning plans
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Exam preparation
      </li>
      <li class="flex items-center">
        <span class="text-green-500 mr-2">✓</span>
        Parent progress reports
      </li>
    </ul>
    <button 
      on:click={() => selectPlan('Elite')}
      class="w-full border-2 border-[#151f54] text-[#151f54] px-6 py-3 rounded-lg hover:bg-[#151f54] hover:text-white transition-colors font-semibold"
    >
      Get Started
    </button>
  </div>
</div>

<!-- Package Deals Section -->
<div class="bg-gradient-to-r from-[#151f54] to-[#0f1a3f] rounded-2xl p-8 mb-16 text-white">
  <h2 class="text-3xl font-bold text-center mb-8">Package Deals</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
    <div>
      <div class="text-2xl font-bold mb-2">5 Hours</div>
      <div class="text-lg mb-2">Save 10%</div>
      <div class="text-sm opacity-90">Perfect for exam prep</div>
    </div>
    <div>
      <div class="text-2xl font-bold mb-2">10 Hours</div>
      <div class="text-lg mb-2">Save 15%</div>
      <div class="text-sm opacity-90">Great for ongoing support</div>
    </div>
    <div>
      <div class="text-2xl font-bold mb-2">20 Hours</div>
      <div class="text-lg mb-2">Save 20%</div>
      <div class="text-sm opacity-90">Best value for long-term learning</div>
    </div>
  </div>
</div>

<!-- FAQ Section -->
<div class="mb-16">
  <h2 class="text-3xl font-bold text-[#151f54] text-center mb-12">Frequently Asked Questions</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
    <div class="bg-white shadow-lg rounded-2xl p-6">
      <h3 class="text-xl font-semibold mb-3 text-[#151f54]">Can I change my plan?</h3>
      <p class="text-gray-600">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
    </div>
    <div class="bg-white shadow-lg rounded-2xl p-6">
      <h3 class="text-xl font-semibold mb-3 text-[#151f54]">What if I'm not satisfied?</h3>
      <p class="text-gray-600">We offer a 100% satisfaction guarantee. If you're not happy with your first session, we'll refund it completely.</p>
    </div>
    <div class="bg-white shadow-lg rounded-2xl p-6">
      <h3 class="text-xl font-semibold mb-3 text-[#151f54]">How do I schedule sessions?</h3>
      <p class="text-gray-600">Use our easy online booking system to schedule sessions at your convenience, 24/7.</p>
    </div>
    <div class="bg-white shadow-lg rounded-2xl p-6">
      <h3 class="text-xl font-semibold mb-3 text-[#151f54]">Are there any hidden fees?</h3>
      <p class="text-gray-600">No hidden fees ever. The price you see is exactly what you pay - transparent and simple.</p>
    </div>
  </div>
</div>

<!-- Contact Section -->
<div class="flex justify-center">
  <div class="bg-white shadow-lg rounded-2xl p-8 max-w-2xl w-full">
    <h3 class="text-2xl font-semibold mb-4 text-[#151f54] text-center">Need Help Choosing?</h3>
    <p class="text-gray-600 mb-6 text-center text-lg">Not sure which plan is right for you? Our education consultants are here to help!</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="text-center">
        <p class="text-gray-600 text-lg">📧 pricing@wiseowl.com</p>
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
        Get Free Consultation
      </button>
    </div>
  </div>
</div>