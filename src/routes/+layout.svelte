<script>
    import "../app.css";
    import Icon from '$lib/components/Icon.svelte';
    import { goto } from "$app/navigation";
</script>

<!-- Layout structure -->
<div class="min-h-screen">
  <!-- Header -->
  <header class="bg-[#151f54] text-white shadow-[0_2px_20px_0px_rgba(0,0,0,0.4)] border-b-4 border-[#212d6e]">
      <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
              <!-- Logo and Brand -->
              <div class="flex items-center space-x-3">
                  <img src="/favicon.png" alt="Logo" class="w-10 h-10" />
                  <h1 class="text-3xl font-bold">WiseOwl</h1>
              </div>

              <!-- Navigation -->
              <nav class="hidden md:flex items-center space-x-8">
                  <a href="/" class="font-semibold hover:bg-gray-700 rounded px-3 py-2 text-lg flex items-center space-x-2 text-white transition-colors">
                      <Icon name="home" />
                      <span>Home</span>
                  </a>
                  <a href="/subjects" class="font-semibold hover:bg-gray-700 rounded px-3 py-2 text-lg flex items-center space-x-2 text-white transition-colors">
                      <Icon name="subjects" />
                      <span>Subjects</span>
                  </a>
                  <a href="/pricing" class="font-semibold hover:bg-gray-700 rounded px-3 py-2 text-lg flex items-center space-x-2 text-white transition-colors">
                      <Icon name="pricing" />
                      <span>Pricing</span>
                  </a>
                  <a href="/about" class="font-semibold hover:bg-gray-700 rounded px-3 py-2 text-lg flex items-center space-x-2 text-white transition-colors">
                      <Icon name="about" />
                      <span>About Us</span>
                  </a>
              </nav>

              <!-- Settings/Profile -->
              <div class="flex items-center space-x-4">
                  <div class="navbar max-w-3xl mx-auto justify-between">
                      <div>
                      <button on:click={() => goto("/login")}>Login</button>
                      <span class="text-white text-lg ml-2">johanhardcodething</span>
                      <button on:click={() => console.log("logging out")}>Logout</button>
                      </div>
                  </div>
              </div>

              <!-- Mobile Menu Button (for future mobile implementation) -->
              <button class="md:hidden text-white" aria-label="Open mobile menu">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
              </button>
          </div>
      </div>
  </header>

  <!-- Main Content -->
  <main class="py-8 px-6 bg-amber-5 min-h-screen">
      <div class="container mx-auto max-w-6xl">
          <slot />
      </div>
  </main>

  <!-- Footer -->
  <footer class="bg-[#151f54] text-white border-t-4 border-[#212d6e]">
      <div class="container mx-auto px-6 py-8">
          <div class="grid md:grid-cols-3 gap-8">
              <!-- Company Info -->
              <div>
                  <div class="flex items-center space-x-3 mb-4">
                      <img src="/favicon.png" alt="Logo" class="w-8 h-8" />
                      <h3 class="text-xl font-bold">WiseOwl</h3>
                  </div>
                  <p class="text-gray-300 mb-4">Empowering students with quality education and comprehensive learning resources.</p>
              </div>

              <!-- Contact Info -->
              <div>
                  <h3 class="text-lg font-semibold mb-4">Contact Us</h3>
                  <div class="space-y-2 text-gray-300">
                      <div class="flex items-center space-x-2">
                          <Icon name="email" />
                          <span>contact@wiseowl.edu</span>
                      </div>
                      <div class="flex items-center space-x-2">
                          <Icon name="phone" />
                          <span>+1 (555) 123-4567</span>
                      </div>
                      <div class="flex items-center space-x-2">
                          <Icon name="location" />
                          <span>123 Education St, Learning City, LC 12345</span>
                      </div>
                  </div>
              </div>

              <!-- Quick Links -->
              <div>
                  <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
                  <div class="space-y-2">
                      <a href="/privacy" class="text-gray-300 hover:text-white transition-colors block">Privacy Policy</a>
                      <a href="/terms" class="text-gray-300 hover:text-white transition-colors block">Terms of Service</a>
                      <a href="/support" class="text-gray-300 hover:text-white transition-colors block">Support Center</a>
                      <a href="/careers" class="text-gray-300 hover:text-white transition-colors block">Careers</a>
                  </div>
              </div>
          </div>

          <!-- Copyright -->
          <div class="border-t border-gray-600 mt-8 pt-6 text-center text-gray-300">
              <p>&copy; 2025 WiseOwl. All rights reserved.</p>
          </div>
      </div>
  </footer>
</div>