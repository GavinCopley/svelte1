<script>
    import "../app.css";
    import Icon from '$lib/components/Icon.svelte';
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
                        <Icon name="about" />
                        <span>Subjects</span>
                    </a>
                    <a href="/pricing" class="font-semibold hover:bg-gray-700 rounded px-3 py-2 text-lg flex items-center space-x-2 text-white transition-colors">
                        <Icon name="about" />
                        <span>Pricing</span>
                    </a>
                    <a href="/about" class="font-semibold hover:bg-gray-700 rounded px-3 py-2 text-lg flex items-center space-x-2 text-white transition-colors">
                        <Icon name="about" />
                        <span>About Us</span>
                    </a>
                </nav>

                <!-- Settings/Profile -->
                <div class="flex items-center space-x-4">
                    <a href="/settings" 
                       class="font-semibold bg-[#293da6] hover:bg-[#212d6e] rounded px-4 py-2 text-lg flex items-center space-x-2 text-white border-2 border-[#212d6e] transition-colors">
                        <Icon name="settings" />
                        <span>Settings</span>
                    </a>
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
    <main class="py-8 px-6 bg-[#f5f7ff] min-h-screen">
        <div class="container mx-auto max-w-6xl">
            <slot />
        </div>
    </main>
</div>