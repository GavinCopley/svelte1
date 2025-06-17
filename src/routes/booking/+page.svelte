<script lang="ts">
    import { fade } from 'svelte/transition';
    import Calendar from '$lib/components/calendar-20.svelte';

    // Define types for our plan data
    interface Plan {
        type: string;
        price: string;
        description?: string;
        features?: string[];
        emoji?: string;
    }

    // State to track the current step in the booking process
    let currentStep = 0;
    let selectedPlan: Plan | null = null;

    function selectPlan(plan: string, price: string): void {
        selectedPlan = { type: plan, price };
        // Move to the next step
        currentStep = 1;
    }

    // Plans based on the pricing page
    const plans = [
        {
            type: 'Basic',
            price: '$25/hour',
            description: 'Perfect for those in Elementary, Middle, or High School taking non-AP classes in nearly all subjects from Spanish to Math.',
            features: [
                'One-on-one tutoring sessions',
                'Broad subject support',
                'Flexible scheduling'
            ],
            emoji: '📘'
        },
        {
            type: 'Advanced',
            price: '$35/hour',
            description: 'Perfect for those in AP classes looking to gain a better understanding of the material and raise both their scores in class and on the AP exam.',
            features: [
                'AP subject mastery',
                'Exam prep strategies',
                'Score improvement tracking'
            ],
            emoji: '🎓'
        }
    ];
</script>

<div class="container mx-auto px-4 py-8">
    <!-- Step 1: Select Plan -->
    {#if currentStep === 0}
        <div in:fade={{ duration: 300 }}>
            <div class="text-center mb-12">
                <h1 class="text-5xl font-bold text-[#151f54] mb-6">Select Your Tutoring Plan</h1>
                <p class="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
                    Choose the plan that best fits your educational needs. You can always change your plan later.
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 items-stretch">
                {#each plans as plan}
                    <div class="bg-white shadow-lg rounded-2xl p-8 text-center border-2 
                        {plan.type === 'Advanced' ? 'border-[#151f54]' : 'border-gray-200 hover:border-[#151f54]'} 
                        transition-colors flex flex-col">
                        <div class="text-2xl mb-4">{plan.emoji}</div>
                        <h3 class="text-2xl font-semibold mb-3 text-[#151f54]">{plan.type}</h3>
                        <div class="mb-6">
                            <span class="text-4xl font-bold text-[#151f54]">{plan.price.split('/')[0]}</span>
                            <span class="text-gray-600">/hour</span>
                        </div>
                        <p class="text-gray-700 mb-6">
                            {plan.description}
                        </p>
                        <ul class="text-left mb-8 space-y-3 flex-1">
                            {#each plan.features as feature}
                                <li class="flex items-center">
                                    <span class="text-green-500 mr-2">✓</span>
                                    {feature}
                                </li>
                            {/each}
                        </ul>
                        <button 
                            on:click={() => selectPlan(plan.type, plan.price)}
                            class="w-full {plan.type === 'Advanced' ? 'bg-[#151f54] text-white hover:bg-[#0f1a3f]' : 'border-2 border-[#151f54] text-[#151f54] hover:bg-[#151f54] hover:text-white'} px-6 py-3 rounded-lg transition-colors font-semibold mt-auto"
                        >
                            Select {plan.type} Plan
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    {:else if currentStep === 1}
        <!-- Step 2: Select Date and Time -->
        <div in:fade={{ duration: 300 }}>
            <div class="text-center mb-12">
                <h1 class="text-5xl font-bold text-[#151f54] mb-6">Schedule Your Session</h1>
                <p class="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
                    You've selected the <strong>{selectedPlan?.type}</strong> plan at <strong>{selectedPlan?.price}</strong>. 
                    Now, please choose a date and time for your tutoring session.
                </p>
            </div>
            <div class="flex justify-center mb-12">
                <div style="transform: scale(1.2) !important;">
                    {#if selectedPlan}
                        <Calendar planData={selectedPlan} />
                    {/if}
                </div>
            </div>
            <div class="text-center mt-6">
                <button 
                    on:click={() => currentStep = 0}
                    class="border-2 border-[#151f54] text-[#151f54] px-6 py-3 rounded-lg hover:bg-[#151f54] hover:text-white transition-colors font-semibold"
                >
                    Back to Plan Selection
                </button>
            </div>
        </div>
    {/if}
</div>