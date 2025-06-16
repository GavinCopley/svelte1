<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import Calendar from "$lib/components/ui/calendar/calendar.svelte";
	import { CalendarDate, type DateValue, getLocalTimeZone, today } from "@internationalized/date";

	// let value = $state<CalendarDate | undefined>(new CalendarDate(2025, 6, 12));
	let value = $state<CalendarDate | undefined>(undefined);
	// let selectedTime = $state<string | null>("10:00");
	let selectedTime = $state<string | null>(null);

	// Get the current date to compare for disabling previous months
	const currentDate = today(getLocalTimeZone());

	// Function to determine if a date is in the past
	function isDateInPast(date: DateValue) {
		return date.compare(currentDate) < 0;
	}

	// const bookedDates = Array.from({ length: 3 }, (_, i) => new CalendarDate(2025, 6, 17 + i));
	const bookedDates: CalendarDate[] = [];
	const timeSlots = Array.from({ length: 9 }, (_, i) => {
		const totalMinutes = i * 30;
		const hour = Math.floor(totalMinutes / 60) + 16;
		const minute = totalMinutes % 60;
		return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
	});
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
				Your meeting is booked for
				<span class="font-medium">
					{value.toDate(getLocalTimeZone()).toLocaleDateString("en-US", {
						weekday: "long",
						day: "numeric",
						month: "short",
					})}
				</span>
				at <span class="font-medium">{selectedTime}</span>.
			{:else}
				Select a date and time for your meeting.
			{/if}
		</div>
		<Button
			disabled={!value || !selectedTime}
			class="w-full md:ml-auto md:w-auto"
			variant="outline"
		>
			Continue
		</Button>
	</Card.Footer>
</Card.Root>
