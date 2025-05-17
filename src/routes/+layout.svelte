<script>
    import "../app.css";
</script>
  
<!-- Layout structure -->
<div class="flex min-h-screen gap-4">
    <!-- Sidebar -->
    <aside class="w-48 bg-[#151f54] text-white p-4 space-y-4 shadow-[0_4px_40px_5px_rgba(0,0,0,0.4)] z-10 relative">
        <div class="flex items-center space-x-2">
            <img src="/favicon.png" alt="Logo" class="w-8 h-8" />
            <h1 class="text-2xl font-bold">K n C</h1>
        </div>
        <nav class="flex flex-col space-y-2">
        <a href="/" class="hover:bg-gray-700 rounded px-2 py-1">Home</a>
        <a href="/about" class="hover:bg-gray-700 rounded px-2 py-1">About</a>
        <a href="/contact" class="hover:bg-gray-700 rounded px-2 py-1">Contact</a>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-6 bg-[#f5f7ff]">
        <slot />
    </main>
</div>
