<template>
  <div class="property-details-page">
    <div v-if="loading" class="loading">Loading property details...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <h1>{{ property.title }}</h1>
      <div class="property-images-layout">
        <img :src="property.image" class="main-image" alt="Property main image" />
        <div class="side-images">
          <img v-for="(img, index) in property.images.slice(1, 5)" :key="index" :src="img" class="side-image" :alt="`Property image ${index + 2}`" />
        </div>
      </div>
      <div class="property-content">
        <div class="property-summary">
          <h2>{{ property.summary }}</h2>
          <p>{{ property.description }}</p>
          <div class="property-meta">
            <span>{{ property.guests }} guests</span> ·
            <span>{{ property.type }}</span> ·
            <span>{{ property.beds }} bedrooms</span> ·
            <span>{{ property.bath }} bathrooms</span>
          </div>
          <div v-if="property.rare" class="rare-find">Rare find! This place is usually booked</div>
        </div>
        
        <div class="booking-card">
          <div class="booking-price">
            <strong>€{{ property.price }} / night</strong>
          </div>
          
          <form @submit.prevent="handleBooking" class="booking-form">
            <div class="booking-dates">
              <div class="date-input">
                <label>Check-in</label>
                <input 
                  type="date" 
                  v-model="bookingData.checkIn"
                  :min="today"
                  required
                  @change="validateDateSelection"
                />
                <div v-if="isDateUnavailable(bookingData.checkIn)" class="date-warning">
                  ⚠️ This date is not available
                </div>
                <div v-if="isDateInPast(bookingData.checkIn)" class="date-warning">
                  ⚠️ Cannot select a date in the past
                </div>
              </div>
              <div class="date-input">
                <label>Check-out</label>
                <input 
                  type="date" 
                  v-model="bookingData.checkOut"
                  :min="getMinCheckOutDate()"
                  required
                  @change="validateDateSelection"
                />
                <div v-if="isDateUnavailable(bookingData.checkOut)" class="date-warning">
                  ⚠️ This date is not available
                </div>
                <div v-if="isDateInPast(bookingData.checkOut)" class="date-warning">
                  ⚠️ Cannot select a date in the past
                </div>
              </div>
            </div>
            
            <div v-if="unavailableDates.length > 0" class="unavailable-dates-info">
              <h4>🗓️ Unavailable Dates</h4>
              <div class="unavailable-dates-list">
                <span v-for="date in unavailableDates.slice(0, 10)" :key="date" class="unavailable-date">
                  {{ new Date(date).toLocaleDateString() }}
                </span>
                <span v-if="unavailableDates.length > 10" class="more-dates">
                  +{{ unavailableDates.length - 10 }} more
                </span>
              </div>
            </div>
            
            <div class="guest-input">
              <label>Guests</label>
              <select v-model="bookingData.guests" required>
                <option v-for="n in property.guests" :key="n" :value="n">
                  {{ n }} guest{{ n > 1 ? 's' : '' }}
                </option>
              </select>
            </div>
            
            <div v-if="availability.checked" class="availability-status">
              <div v-if="availability.available" class="available">
                ✓ Available for your dates
              </div>
              <div v-else class="unavailable">
                ✗ Not available for selected dates
              </div>
            </div>
            
            <div v-if="totalPrice > 0" class="price-breakdown">
              <div class="price-row">
                <span>€{{ property.price }} × {{ numberOfNights }} nights</span>
                <span>€{{ property.price * numberOfNights }}</span>
              </div>
              <div class="price-row total">
                <span><strong>Total</strong></span>
                <span><strong>€{{ totalPrice }}</strong></span>
              </div>
            </div>
            
            <button 
              type="submit" 
              class="book-btn"
              :disabled="!availability.available || bookingLoading || !bookingData.checkIn || !bookingData.checkOut"
            >
              {{ bookingLoading ? 'Booking...' : availability.checked ? (availability.available ? 'Reserve' : 'Not Available') : 'Select Dates' }}
            </button>
          </form>
          
          <div v-if="bookingError" class="booking-error">
            {{ bookingError }}
          </div>
          
          <div v-if="bookingSuccess" class="booking-success">
            Booking confirmed! Check your profile for details.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../api.js';

const route = useRoute();
const propertyId = route.params.id;
const property = ref({});
const loading = ref(true);
const error = ref(null);

const bookingData = ref({
  checkIn: '',
  checkOut: '',
  guests: 1
});
const availability = ref({
  checked: false,
  available: false
});
const bookingLoading = ref(false);
const bookingError = ref('');
const bookingSuccess = ref(false);

const unavailableDates = ref([]);
const unavailableDatesLoading = ref(false);

const today = new Date().toISOString().split('T')[0];
const numberOfNights = computed(() => {
  if (bookingData.value.checkIn && bookingData.value.checkOut) {
    const checkIn = new Date(bookingData.value.checkIn);
    const checkOut = new Date(bookingData.value.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});
const totalPrice = computed(() => {
  return numberOfNights.value * (property.value.price || 0);
});

const unavailableDatesSet = computed(() => {
  return new Set(unavailableDates.value);
});

const isDateUnavailable = (date) => {
  return unavailableDatesSet.value.has(date);
};

const isDateInPast = (date) => {
  if (!date) return false;
  return date < today;
};

const getMinCheckOutDate = () => {
  if (bookingData.value.checkIn) {
    const checkInDate = new Date(bookingData.value.checkIn);
    checkInDate.setDate(checkInDate.getDate() + 1);
    const minCheckOut = checkInDate.toISOString().split('T')[0];
    
    return minCheckOut > today ? minCheckOut : today;
  }
  return today;
};

const validateDateSelection = () => {
  if (bookingData.value.checkIn && isDateInPast(bookingData.value.checkIn)) {
    bookingError.value = 'Check-in date cannot be in the past. Please select a future date.';
    availability.value.checked = false;
    return false;
  }
  
  if (bookingData.value.checkOut && isDateInPast(bookingData.value.checkOut)) {
    bookingError.value = 'Check-out date cannot be in the past. Please select a future date.';
    availability.value.checked = false;
    return false;
  }
  
  if (bookingData.value.checkIn && bookingData.value.checkOut) {
    if (bookingData.value.checkOut <= bookingData.value.checkIn) {
      bookingError.value = 'Check-out date must be after check-in date.';
      availability.value.checked = false;
      return false;
    }
  }
  
  if (bookingData.value.checkIn && isDateUnavailable(bookingData.value.checkIn)) {
    bookingError.value = 'Check-in date is not available. Please select a different date.';
    availability.value.checked = false;
    return false;
  }
  
  if (bookingData.value.checkOut && isDateUnavailable(bookingData.value.checkOut)) {
    bookingError.value = 'Check-out date is not available. Please select a different date.';
    availability.value.checked = false;
    return false;
  }
  
  if (bookingData.value.checkIn && bookingData.value.checkOut) {
    const start = new Date(bookingData.value.checkIn);
    const end = new Date(bookingData.value.checkOut);
    
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (isDateUnavailable(dateStr)) {
        bookingError.value = `Date ${d.toLocaleDateString()} in your selected range is not available.`;
        availability.value.checked = false;
        return false;
      }
    }
  }
  
  bookingError.value = '';
  return true;
};

async function fetchPropertyData() {
  try {
    console.log('Fetching property with ID:', propertyId);
    const response = await fetch(`/api/houses/${propertyId}`);
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch property. Status:', response.status, 'Error:', errorText);
      throw new Error(`Property not found (Status: ${response.status})`);
    }
    
    const data = await response.json();
    
    property.value = {
      ...data,
      images: Array.isArray(data.images) ? data.images : ['/src/Images/Upcoming.avif'],
      image: Array.isArray(data.images) && data.images.length ? data.images[0] : '/src/Images/Upcoming.avif',
      title: data.title || data.name || 'Property',
      summary: data.location || 'Location not specified',
      description: data.description || `${data.max_guests || 1} guests · ${data.bedrooms || 1} bedrooms · ${data.bathrooms || 1} bathrooms`,
      guests: data.max_guests || 1,
      type: 'Entire place',
      beds: data.bedrooms || 1,
      bath: data.bathrooms || 1,
      rare: false
    };
  } catch (err) {
    error.value = err.message || 'Failed to fetch property data';
    console.error('Error fetching property:', err);
    console.error('Property ID that failed:', propertyId);
  }
}

async function fetchUnavailableDates() {
  unavailableDatesLoading.value = true;
  try {
    console.log('Fetching unavailable dates for property ID:', propertyId);
    const response = await fetch(`/api/houses/${propertyId}/unavailable-dates`);
    
    if (response.ok) {
      const data = await response.json();
      unavailableDates.value = data.map(item => item.date);
      console.log('Fetched unavailable dates:', unavailableDates.value);
    } else {
      console.log('No unavailable dates found or error fetching unavailable dates. Status:', response.status);
      unavailableDates.value = [];
    }
  } catch (error) {
    console.error('Error fetching unavailable dates:', error);
    unavailableDates.value = [];
  } finally {
    unavailableDatesLoading.value = false;
  }
}

async function checkAvailability() {
  if (!bookingData.value.checkIn || !bookingData.value.checkOut) {
    return;
  }
  
  try {
    console.log('Checking availability for house:', propertyId);
    console.log('Dates:', bookingData.value.checkIn, 'to', bookingData.value.checkOut);
    
    const response = await fetch(`/api/houses/${propertyId}/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkIn: bookingData.value.checkIn,
        checkOut: bookingData.value.checkOut
      })
    });
    
    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response data:', result);
    
    if (response.ok) {
      availability.value = {
        checked: true,
        available: result.available
      };
      console.log('Availability result:', result.available);
    } else {
      console.error('Availability check failed:', result.error);
      bookingError.value = result.error || 'Failed to check availability';
    }
  } catch (error) {
    console.error('Availability check error:', error);
    bookingError.value = 'Failed to check availability. Please try again.';
  }
}

async function handleBooking() {
  bookingLoading.value = true;
  bookingError.value = '';
  bookingSuccess.value = false;
  
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      bookingError.value = 'Please log in to make a booking';
      return;
    }
    
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        house_id: parseInt(propertyId),
        check_in: bookingData.value.checkIn,
        check_out: bookingData.value.checkOut,
        guests: bookingData.value.guests,
        total_price: totalPrice.value,
        status: 'confirmed'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      bookingSuccess.value = true;
      bookingData.value = {
        checkIn: '',
        checkOut: '',
        guests: 1
      };
      availability.value = {
        checked: false,
        available: false
      };
    } else {
      bookingError.value = result.error || 'Failed to create booking';
    }
  } catch (error) {
    console.error('Booking error:', error);
    bookingError.value = 'Failed to create booking';
  } finally {
    bookingLoading.value = false;
  }
}

onMounted(async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCheckIn = urlParams.get('checkIn');
    const urlCheckOut = urlParams.get('checkOut');
    const urlGuests = urlParams.get('guests');
    
    if (urlCheckIn) bookingData.value.checkIn = urlCheckIn;
    if (urlCheckOut) bookingData.value.checkOut = urlCheckOut;
    if (urlGuests) bookingData.value.guests = parseInt(urlGuests);
    
    await Promise.all([
      fetchPropertyData(),
      fetchUnavailableDates()
    ]);
    
    if (!error.value && property.value && bookingData.value.checkIn && bookingData.value.checkOut) {
      setTimeout(() => {
        checkAvailability();
      }, 500);
    }
  } catch (err) {
    error.value = 'Failed to load property details';
    console.error('Error loading property:', err);
  } finally {
    loading.value = false;
  }
});

watch([() => bookingData.value.checkIn, () => bookingData.value.checkOut], ([newCheckIn, newCheckOut], [oldCheckIn, oldCheckOut]) => {
  if (newCheckIn && newCheckOut && (newCheckIn !== oldCheckIn || newCheckOut !== oldCheckOut)) {
    availability.value.checked = false;
    availability.value.available = false;
    bookingError.value = '';
    
    if (validateDateSelection()) {
      setTimeout(() => {
        checkAvailability();
      }, 300);
    }
  }
}, { deep: true });

watch([() => bookingData.value.checkIn, () => bookingData.value.checkOut], () => {
  validateDateSelection();
}, { deep: true });
</script>

<style scoped>
.property-details-page {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}
.property-images-layout {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}
.main-image {
  width: 60%;
  border-radius: 18px;
  object-fit: cover;
}
.side-images {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 40%;
}
.side-image {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
}
.property-summary {
  margin-top: 1rem;
}
.property-meta {
  color: #717171;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}
.rare-find {
  background: #fff0f6;
  color: #d72660;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  margin-top: 1.5rem;
  font-weight: 600;
  display: inline-block;
}
.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #717171;
}
.error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #d72660;
  background: #fff0f6;
  border-radius: 12px;
}
.property-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 4rem;
  margin-top: 2rem;
}

.booking-card {
  background: white;
  border: 1px solid #dddddd;
  border-radius: 12px;
  padding: 2rem;
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.booking-price {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.booking-dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.date-input, .guest-input {
  display: flex;
  flex-direction: column;
}

.date-input label, .guest-input label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.date-input input, .guest-input select {
  padding: 0.75rem;
  border: 1px solid #dddddd;
  border-radius: 8px;
  font-size: 1rem;
}

.availability-status {
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
}

.available {
  background: #d4edda;
  color: #155724;
}

.unavailable {
  background: #f8d7da;
  color: #721c24;
}

.price-breakdown {
  border-top: 1px solid #eeeeee;
  padding-top: 1rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.price-row.total {
  border-top: 1px solid #eeeeee;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.check-availability-btn, .book-btn {
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.check-availability-btn {
  background: #f7f7f7;
  color: #222222;
}

.check-availability-btn:hover:not(:disabled) {
  background: #eeeeee;
}

.book-btn {
  background: #ff385c;
  color: white;
}

.book-btn:hover:not(:disabled) {
  background: #e00b41;
}

.check-availability-btn:disabled, .book-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.booking-error {
  background: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.booking-success {
  background: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.date-warning {
  color: #ff385c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.unavailable-dates-info {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.unavailable-dates-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #495057;
}

.unavailable-dates-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.unavailable-date {
  background: #ff385c;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.more-dates {
  color: #6c757d;
  font-size: 0.8rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .property-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .booking-card {
    position: static;
  }
}
</style>
