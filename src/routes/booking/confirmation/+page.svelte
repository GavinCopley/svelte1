<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  // Define interface for booking data
  interface BookingData {
    date?: string;
    time?: string;
    plan?: string;
    price?: string;
    // Add other potential properties here
  }

  // Parse booking data from URL parameters
  let bookingData: BookingData = {};
  $: if ($page.url.searchParams.has('data')) {
    bookingData = JSON.parse($page.url.searchParams.get('data') || '{}');
  }
  
  function viewAllBookings() {
    // Navigate to bookings page
    console.log('Navigating to all bookings');
    goto('/bookings');
  }

  function bookNewSession() {
    // Navigate back to booking page to start a new booking
    goto('/booking');
  }
</script>

<!-- Hero Section -->
<div class="text-center mb-12 pt-16">
  <div class="text-6xl mb-8 text-center">✅</div>
  <h1 class="text-5xl font-bold text-[#151f54] mb-6">Thank You For Your Booking!</h1>
  <p class="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
    Your tutoring session has been confirmed. We've sent a confirmation email with all the details.
  </p>
</div>

<!-- Booking Details Card -->
<div class="max-w-2xl mx-auto mb-16">
  <div class="bg-white shadow-lg rounded-2xl p-8 border-2 border-gray-200">
    <h2 class="text-2xl font-bold text-[#151f54] mb-6 text-center">Booking Details</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div>
        <p class="text-gray-500 text-sm">Tutoring Plan</p>
        <p class="text-gray-700 font-medium">{bookingData?.plan || 'Standard'} Plan</p>
      </div>
      <div>
        <p class="text-gray-500 text-sm">Rate</p>
        <p class="text-gray-700 font-medium">{bookingData?.price || 'Standard pricing'}</p>
      </div>
      <div>
        <p class="text-gray-500 text-sm">Date of Tutoring</p>
        <p class="text-gray-700 font-medium">{bookingData?.date || '(No date selected)'}</p>
      </div>
      <div>
        <p class="text-gray-500 text-sm">Time</p>
        <p class="text-gray-700 font-medium">{bookingData?.time || '(No time selected)'}</p>
      </div>
      <div>
        <p class="text-gray-500 text-sm">Payment Method</p>
        <p class="text-gray-700 font-medium">Cash</p>
      </div>
    </div>
    
    <div class="flex flex-col md:flex-row gap-4 justify-center">
      <button 
        on:click={viewAllBookings}
        class="bg-[#151f54] text-white px-8 py-4 rounded-lg hover:bg-[#0f1a3f] transition-colors text-lg font-medium"
      >
        View All My Bookings
      </button>
      <button 
        on:click={bookNewSession}
        class="border-2 border-[#151f54] text-[#151f54] px-8 py-4 rounded-lg hover:bg-[#151f54] hover:text-white transition-colors text-lg font-medium"
      >
        Book Another Session
      </button>
    </div>
  </div>
</div>

<!-- Help Section -->
<div class="flex justify-center mb-16">
  <div class="bg-gradient-to-r from-[#151f54] to-[#0f1a3f] rounded-2xl p-8 max-w-2xl w-full text-white">
    <h3 class="text-2xl font-semibold mb-4 text-center">Need Help?</h3>
    <p class="text-center text-lg mb-6">If you need to reschedule or have any questions about your booking:</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="text-center">
        <p class="text-lg">📧 help@wiseowl.com</p>
      </div>
      <div class="text-center">
        <p class="text-lg">📞 (555) 123-WISE</p>
      </div>
    </div>
  </div>
</div>