<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import Calendar from "$lib/components/ui/calendar/calendar.svelte";
	import { CalendarDate, type DateValue, getLocalTimeZone, today } from "@internationalized/date";
	import { goto } from "$app/navigation";

    // Accept plan data from parent component
    export let planData = { type: 'Standard', price: 'Standard pricing' };

    let value: DateValue | undefined = undefined;
    let selectedTime: string | null = null;

    // Get the current date to compare for disabling previous months
	const currentDate = today(getLocalTimeZone());

	// Function to determine if a date is in the past
	function isDateInPast(date: DateValue) {
		return date.compare(currentDate) < 0;
	}

	// Array of dates that are already booked
	const bookedDates: CalendarDate[] = [];
	
	// Available time slots
	const timeSlots = Array.from({ length: 9 }, (_, i) => {
		const totalMinutes = i * 30;
		const hour24 = Math.floor(totalMinutes / 60) + 16;
		const minute = totalMinutes % 60;
		const period = hour24 >= 12 ? "pm" : "am";
		const hour12 = hour24 % 12 || 12;
		return `${hour12}:${minute.toString().padStart(2, "0")}${period}`;
	});

	// Function that will be executed when the continue button is clicked
	function handleBookingSubmit() {
		if (value && selectedTime) {
			const formattedDate = value.toDate(getLocalTimeZone()).toLocaleDateString("en-US", {
				weekday: "long",
				day: "numeric",
				month: "short",
			});
			
			// Create booking data object including the plan details
			const bookingData = { 
				date: formattedDate, 
				time: selectedTime,
				isoDate: value.toString(),
				plan: planData.type,
				price: planData.price
			};
			const params = new URLSearchParams({ data: JSON.stringify(bookingData) });
			goto(`/booking/confirmation?${params}`);
		}
	}
</script>

<Card.Root class="gap-0 p-0">
    <Card.Content class="relative p-0 md:pr-48">
        <div class="p-6">
            <Calendar
                type="single"
                bind:value
                isDateUnavailable={(date) => bookedDates.some((d) => d.compare(date) === 0) || isDateInPast(date)}
                minValue={currentDate}
                class="data-unavailable:line-through data-unavailable:opacity-100 bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
                weekdayFormat="short"
            />
        </div>
        <div
            class="no-scrollbar inset-y-0 right-0 flex w-full scroll-pb-6 flex-col gap-4 border-t p-6 md:absolute md:w-48 md:border-l md:border-t-0"
        >
            <div class="grid gap-2">
                {#each timeSlots as time (time)}
                    <Button
                        variant={selectedTime === time ? "default" : "outline"}
                        onclick={() => (selectedTime = time)}
                        class="w-full shadow-none"
                    >
                        {time}
                    </Button>
                {/each}
            </div>
        </div>
    </Card.Content>
    <Card.Footer class="flex flex-col gap-4 border-t !py-5 px-6 md:flex-row">
        <div class="text-sm">
            {#if value && selectedTime}
                Your {planData.type} tutoring session is booked for
                <span class="font-medium">
                    {value.toDate(getLocalTimeZone()).toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                    })}
                </span>
                at <span class="font-medium">{selectedTime}</span>.
            {:else}
                Select a date and time for your {planData.type} tutoring session.
            {/if}
        </div>
        <Button
            disabled={!value || !selectedTime}
            class="w-full md:ml-auto md:w-auto"
            variant="outline"
            onclick={handleBookingSubmit}
        >
            Continue
        </Button>
    </Card.Footer>
</Card.Root>
