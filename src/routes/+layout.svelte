<script>
    import "../app.css";
    import Icon from '$lib/components/Icon.svelte';
</script>

<!-- Layout structure -->
<div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="w-64 bg-[#151f54] text-white p-4 space-y-4 shadow-[0_2px_20px_0px_rgba(0,0,0,0.4)] z-10 relative border-r-4 border-[#212d6e] flex flex-col justify-between h-screen">
        <div>
            <div class="flex items-center space-x-2 mb-6">
            <img src="/favicon.png" alt="Logo" class="w-10 h-10" />
            <h1 class="text-4xl font-bold">WiseOwl</h1>
            </div>
            <nav class="flex flex-col space-y-3">
            <a href="/" class="font-bold hover:bg-gray-700 rounded px-2 py-1 text-lg md:text-2xl flex items-center space-x-2 text-white">
                <Icon name="home" />
                <span>Home</span>
            </a>
            <a href="/about" class="font-bold hover:bg-gray-700 rounded px-2 py-1 text-lg md:text-2xl flex items-center space-x-2 text-white">
                <Icon name="about" />
                <span>Products?</span>
            </a>
            <a href="/about" class="font-bold hover:bg-gray-700 rounded px-2 py-1 text-lg md:text-2xl flex items-center space-x-2 text-white">
                <Icon name="about" />
                <span>Pricing?</span>
            </a>
            <a href="/about" class="font-bold hover:bg-gray-700 rounded px-2 py-1 text-lg md:text-2xl flex items-center space-x-2 text-white">
                <Icon name="about" />
                <span>About Us</span>
            </a>
            </nav>
        </div>

        <nav>
            <a href="/settings" 
            class="font-bold bg-[#293da6] hover:bg-gray-700 rounded px-2 py-1 text-lg md:text-2xl flex items-center justify-center space-x-2 text-white border-4 border-[#212d6e]">
                <Icon name="settings" />
                <span class="relative -top-[1px]">Settings</span>
            </a>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 py-6 px-14 bg-[#f5f7ff]">
        <slot />
    </main>
</div>