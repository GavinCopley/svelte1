<script lang="ts">
    import { goto } from '$app/navigation';
    import { SessionInfoModal } from '$lib';

    // Define types for our plan data
    interface Plan {
        type: string;
        price: string;
        description?: string;
        features?: string[];
        emoji?: string;
    }

    // NEW: session info modal state and selected plan
    let sessionInfoOpen = false;
    let pendingPlan: Plan | null = null;

    function selectPlan(plan: string, price: string): void {
        pendingPlan = { type: plan, price };
        // Open SessionInfoModal instead of moving to a custom calendar
        sessionInfoOpen = true;
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
    <!-- Step: Select Plan (then open SessionInfoModal) -->
    <div>
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
</div>

<!-- NEW: Session Info Modal to collect answers before routing to tutor selection -->
{#if sessionInfoOpen}
  <SessionInfoModal
    bind:open={sessionInfoOpen}
    subject={undefined}
    on:submit={(e) => {
      const a = e.detail.answers;
      const params = new URLSearchParams();
      // push all fields as query params for tutorfilter to consume
      params.set('name', a.name);
      params.set('email', a.email);
      params.set('a1', a.a1);
      params.set('a2', a.a2);
      params.set('a3', a.a3);
      if (a.a4) params.set('a4', a.a4);
      params.set('a5', a.a5);
      params.set('a6', a.a6);
      if (a.a7) params.set('a7', a.a7);
      if (a.a8) params.set('a8', a.a8);
      if (a.a9) params.set('a9', a.a9);
      if (a.a10) params.set('a10', a.a10);
      // include selected plan context for downstream usage
      if (pendingPlan?.type) params.set('plan', pendingPlan.type);
      if (pendingPlan?.price) params.set('price', pendingPlan.price);
      // navigate to tutorfilter with all info to continue flow consistently
      goto(`/tutorfilter?${params.toString()}`);
    }}
    on:cancel={() => { sessionInfoOpen = false; }}
  />
{/if}

<style>
</style>