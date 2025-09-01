<script>
    import { onMount } from 'svelte';
    
    // Sample tutor data - in a real app, this would come from an API or database
    const tutors = [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            subjects: ["Mathematics", "Physics"],
            education: "Ph.D. in Applied Mathematics",
            experience: "10+ years teaching at university level",
            bio: "Dr. Johnson specializes in making complex math concepts accessible to students of all levels.",
            image: "https://placehold.co/200x200?text=SJ"
        },
        {
            id: 2,
            name: "Prof. Michael Chen",
            subjects: ["Chemistry", "Biology"],
            education: "Ph.D. in Molecular Biology",
            experience: "15 years teaching and research experience",
            bio: "Prof. Chen brings laboratory experience to his teaching, making science come alive for students.",
            image: "https://placehold.co/200x200?text=MC"
        },
        {
            id: 3,
            name: "Lisa Rodriguez",
            subjects: ["Literature", "History"],
            education: "Master's in English Literature",
            experience: "8 years teaching at high school and college level",
            bio: "Lisa's passion for storytelling helps students connect deeply with literary and historical texts.",
            image: "https://placehold.co/200x200?text=LR"
        },
        {
            id: 4,
            name: "David Park",
            subjects: ["Computer Science", "Programming"],
            education: "M.S. in Computer Science",
            experience: "12 years industry experience, 6 years teaching",
            bio: "David combines real-world programming experience with clear, methodical teaching approaches.",
            image: "https://placehold.co/200x200?text=DP"
        }
    ];
</script>

<svelte:head>
    <title>Tutors | WiseOwl</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4">
    <!-- Hero Section -->
    <div class="bg-[#151f54] text-white rounded-lg p-10 mb-12 shadow-lg">
        <h1 class="text-4xl font-bold mb-4">Meet Our Expert Tutors</h1>
        <p class="text-xl max-w-3xl">
            Learn from passionate educators who are experts in their fields. Our tutors are carefully selected
            for their deep subject knowledge and ability to connect with students.
        </p>
    </div>

    <!-- Tutor Selection Process -->
    <div class="mb-12">
        <h2 class="text-3xl font-bold mb-6 text-[#151f54]">How We Select Our Tutors</h2>
        
        <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="text-4xl mb-3">🎓</div>
                <h3 class="text-xl font-bold mb-2">Academic Excellence</h3>
                <p>All tutors have advanced degrees in their subjects and proven academic track records.</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="text-4xl mb-3">👨‍🏫</div>
                <h3 class="text-xl font-bold mb-2">Teaching Experience</h3>
                <p>We require significant teaching experience and conduct sample lessons before hiring.</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="text-4xl mb-3">💭</div>
                <h3 class="text-xl font-bold mb-2">Communication Skills</h3>
                <p>Our tutors excel at explaining complex concepts in clear, understandable ways.</p>
            </div>
        </div>
    </div>

    <!-- Featured Tutors -->
    <h2 class="text-3xl font-bold mb-6 text-[#151f54]">Featured Tutors</h2>
    
    <div class="grid md:grid-cols-2 gap-8 mb-12">
        {#each tutors as tutor}
            <div class="bg-white rounded-lg overflow-hidden shadow-md flex">
                <div class="w-1/3">
                    <img src={tutor.image} alt={tutor.name} class="w-full h-full object-cover" />
                </div>
                <div class="w-2/3 p-6">
                    <h3 class="text-2xl font-bold mb-2">{tutor.name}</h3>
                    <p class="text-gray-600 mb-2">{tutor.education}</p>
                    <p class="mb-2"><strong>Subjects:</strong> {tutor.subjects.join(", ")}</p>
                    <p class="mb-2"><strong>Experience:</strong> {tutor.experience}</p>
                    <p>{tutor.bio}</p>
                </div>
            </div>
        {/each}
    </div>

    <!-- Call to Action -->
    <div class="bg-blue-50 border-l-4 border-blue-500 p-8 rounded-lg shadow-md mb-12">
        <h2 class="text-2xl font-bold mb-3">Ready to Learn with Our Expert Tutors?</h2>
        <p class="mb-4">Schedule a session with one of our tutors and experience the difference personalized education can make.</p>
        <a href="/booking" class="bg-[#151f54] text-white px-6 py-3 rounded-md font-bold hover:bg-[#212d6e] transition-colors inline-block">Book a Session</a>
    </div>

    <!-- Testimonials -->
    <div class="mb-12">
        <h2 class="text-3xl font-bold mb-6 text-[#151f54]">What Our Students Say</h2>
        
        <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="flex items-center mb-4">
                    <div class="text-yellow-400 text-2xl">★★★★★</div>
                </div>
                <p class="italic mb-4">"Dr. Johnson helped me go from struggling with calculus to acing my AP exam. Her patience and clear explanations made all the difference."</p>
                <p class="font-bold">- Alex T., High School Senior</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="flex items-center mb-4">
                    <div class="text-yellow-400 text-2xl">★★★★★</div>
                </div>
                <p class="italic mb-4">"Prof. Chen's biology tutoring helped me understand complex concepts that my textbooks couldn't explain. He made learning fun and interesting!"</p>
                <p class="font-bold">- Maya R., College Freshman</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="flex items-center mb-4">
                    <div class="text-yellow-400 text-2xl">★★★★★</div>
                </div>
                <p class="italic mb-4">"David's programming lessons were exactly what I needed to switch careers into tech. He explains coding in a way that finally made sense to me."</p>
                <p class="font-bold">- Jamie K., Career Changer</p>
            </div>
        </div>
    </div>
</div>
