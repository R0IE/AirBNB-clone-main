<template>
  <div class="profile-container">
    <div class="profile-tabbar">
  <span class="profile-tab" :class="{ active: mainTab === 'today' }" @click="handleTabClick('today')">Today</span>
  <span class="profile-tab" :class="{ active: mainTab === 'bookings' }" @click="handleTabClick('bookings')">My Bookings</span>
  <span class="profile-tab" :class="{ active: mainTab === 'calendar' }" @click="handleTabClick('calendar')">Calendar</span>
  <span class="profile-tab" :class="{ active: mainTab === 'listings' }" @click="handleTabClick('listings')">Listings</span>
  <span class="profile-tab" :class="{ active: mainTab === 'messages' }" @click="handleTabClick('messages')">Messages</span>
    </div>
    <main class="profile-main">
      <div v-if="mainTab === 'today'">
        <div class="profile-tabs">
          <button class="profile-tab-btn" :class="{ active: activeTab === 'today' }" @click="activeTab = 'today'">Today</button>
          <button class="profile-tab-btn" :class="{ active: activeTab === 'upcoming' }" @click="activeTab = 'upcoming'">Upcoming</button>
        </div>
        <transition name="slide-right" mode="out-in">
          <div v-if="activeTab === 'today' || activeTab === 'upcoming'" :key="activeTab" class="profile-reservation">
            <img src="/src/Images/Upcoming.avif" alt="No reservations" class="profile-reservation-img" />
            <div class="profile-reservation-text">
              <h2>You don’t have<br>any reservations</h2>
            </div>
          </div>
        </transition>
      </div>
      <div v-else-if="mainTab === 'calendar'" class="profile-calendar">
        <h2 class="calendar-title">Property Calendar</h2>
        <div v-if="houses.length === 0" style="margin-left:2rem; color:#888; font-size:1.2rem;">No listings to show calendar.</div>
        <div v-else>
          <div class="calendar-select-row">
            <label for="calendarListingSelect">Select listing:</label>
            <select id="calendarListingSelect" v-model="selectedListingId">
              <option v-for="house in houses" :key="house.id" :value="house.id">{{ house.title || house.name }}</option>
            </select>
          </div>
          <div v-if="selectedListing">
            <div class="calendar-navigation">
              <button @click="previousMonth" class="nav-btn">
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path d="M12 4l-6 6 6 6" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <h3 class="calendar-month-title">{{ currentMonthName }} {{ currentYear }}</h3>
              <button @click="nextMonth" class="nav-btn">
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path d="M8 4l6 6-6 6" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div class="calendar-listing-block">
              <div class="calendar-listing-name">{{ selectedListing.title || selectedListing.name }}</div>
              <div class="calendar-header">
                <div class="calendar-weekdays">
                  <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
                </div>
              </div>
              <div class="calendar-grid">
                <div v-for="date in calendarDays" :key="`${date.month}-${date.day}`" 
                     :class="[
                       'calendar-day', 
                       {
                         'other-month': !date.isCurrentMonth,
                         'booked': date.isBooked,
                         'today': date.isToday,
                         'unavailable': date.isUnavailable,
                         'past-date': date.isPast
                       }
                     ]"
                     @click="selectDate(date)">
                  <span class="day-number">{{ date.day }}</span>
                  <div v-if="date.isBooked" class="booking-indicator">
                    <div class="booking-dot"></div>
                  </div>
                </div>
              </div>
              <div class="calendar-legend">
                <div class="legend-item">
                  <div class="legend-dot available"></div>
                  <span>Available (click to block)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot booked"></div>
                  <span>Booked (cannot modify)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot unavailable"></div>
                  <span>Blocked (click to unblock)</span>
                </div>
              </div>
              <div class="calendar-instructions">
                <p><strong>Click on available dates to block them, or click on blocked dates to make them available again.</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="mainTab === 'bookings'" class="profile-bookings">
        <h2 class="bookings-title">Your Bookings</h2>
        <div v-if="userBookings.length === 0" class="no-bookings">
          <div class="no-bookings-content">
            <h3>No bookings yet</h3>
            <p>When you book a trip, it will appear here.</p>
            <button @click="mainTab = 'today'" class="browse-btn">Browse Properties</button>
          </div>
        </div>
        <div v-else class="bookings-list">
          <div v-for="booking in userBookings" :key="booking.id" class="booking-card">
            <div class="booking-image">
              <img :src="'/src/Images/Upcoming.avif'" alt="Property" />
            </div>
            <div class="booking-details">
              <h3>{{ booking.house_title }}</h3>
              <p class="booking-location">{{ booking.house_location }}</p>
              <div class="booking-dates">
                <strong>{{ formatDate(booking.check_in) }} - {{ formatDate(booking.check_out) }}</strong>
              </div>
              <div class="booking-info">
                <span>{{ booking.guests }} guests</span>
                <span class="booking-status" :class="booking.status">{{ booking.status }}</span>
              </div>
              <div class="booking-price">
                <strong>€{{ booking.total_price }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="mainTab === 'listings'" class="profile-listings">
        <div class="profile-listings-header">
          <span class="profile-listings-title">Your listings</span>
          <button class="plus-btn-modern" @click="router.push('/become-a-host')" title="Add new listing">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#ff385c"/>
              <path d="M16 10v12M10 16h12" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div v-if="houses.length === 0" style="margin-left:2rem; color:#888; font-size:1.2rem;">No houses listed yet.</div>
        <div class="listing-grid">
          <div v-for="house in houses" :key="house.id" class="listing-card-modern" @click="goToDetails(house.id)">
            <div class="listing-image-modern">
              <img v-if="house.images && house.images.length" :src="house.images[0]" alt="House image" />
              <div v-else class="listing-image-placeholder">No image</div>
            </div>
            <div class="listing-name-modern">{{ house.name }}</div>
          </div>
        </div>
      </div>
      <div v-else-if="mainTab === 'messages'" class="profile-messages">
        <h1>Messages</h1>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../api.js';

const activeTab = ref('today');
const mainTab = ref('today');
const router = useRouter();
const houses = ref([]);
const selectedListingId = ref(null);
const selectedListing = computed(() => houses.value.find(h => h.id === selectedListingId.value));
const bookings = ref({});
const userBookings = ref([]);
const unavailableDates = ref({});

const currentDate = ref(new Date());
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());
const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long' });
});

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const calendarDays = computed(() => {
  if (!selectedListing.value) return [];
  
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dateStr = date.toISOString().split('T')[0];
    const isCurrentMonth = date.getMonth() === month;
    const isToday = dateStr === todayStr;
    const isPast = dateStr < todayStr;
    const isBooked = isDateBooked(selectedListing.value.id, dateStr);
    const isUnavailable = isDateUnavailable(selectedListing.value.id, dateStr);
    
    days.push({
      date: date,
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      dateStr: dateStr,
      isCurrentMonth,
      isToday,
      isPast,
      isBooked,
      isUnavailable
    });
  }
  
  return days;
});

function isDateBooked(houseId, dateStr) {
  return bookings.value[houseId]?.some(booking => {
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    const date = new Date(dateStr);
    return date >= checkIn && date < checkOut;
  }) || false;
}

function isDateUnavailable(houseId, dateStr) {
  const houseDates = unavailableDates.value[houseId];
  if (!houseDates) return false;
  
  if (Array.isArray(houseDates)) {
    if (typeof houseDates[0] === 'string') {
      return houseDates.includes(dateStr);
    } else if (typeof houseDates[0] === 'object') {
      return houseDates.some(item => item.date === dateStr);
    }
  }
  
  return false;
}

function previousMonth() {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
}

function nextMonth() {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentDate.value = newDate;
}

async function selectDate(date) {
  if (!date.isCurrentMonth || date.isPast) return;
  
  if (date.isPast) {
    console.log('Cannot select past date:', date.dateStr);
    return;
  }
  
  if (date.isBooked) {
    console.log('Date is booked:', date.dateStr);
    alert('This date is already booked and cannot be modified.');
    return;
  }
  
  const houseId = selectedListing.value.id;
  const dateStr = date.dateStr;
  const isCurrentlyUnavailable = date.isUnavailable;
  
  try {
    console.log(`Toggling availability for ${dateStr}: ${isCurrentlyUnavailable ? 'making available' : 'making unavailable'}`);
    
    if (isCurrentlyUnavailable) {
      const { data, error } = await supabase.removeUnavailableDate(houseId, dateStr);
      if (!error) {
        const houseUnavailable = unavailableDates.value[houseId] || [];
        unavailableDates.value[houseId] = houseUnavailable.filter(d => d !== dateStr);
        console.log('Date made available:', dateStr);
      } else {
        console.error('Error making date available:', error);
        alert('Failed to update date availability.');
      }
    } else {
      const { data, error } = await supabase.addUnavailableDate(houseId, dateStr);
      if (!error) {
        if (!unavailableDates.value[houseId]) {
          unavailableDates.value[houseId] = [];
        }
        unavailableDates.value[houseId].push(dateStr);
        console.log('Date made unavailable:', dateStr);
      } else {
        console.error('Error making date unavailable:', error);
        alert('Failed to update date availability.');
      }
    }
  } catch (error) {
    console.error('Error toggling date availability:', error);
    alert('Failed to update date availability.');
  }
}

async function fetchCalendarData() {
  if (!selectedListing.value) {
    console.log('No selected listing, skipping calendar data fetch');
    return;
  }
  
  try {
    console.log('Fetching calendar data for listing:', selectedListing.value.id);
    
    const token = localStorage.getItem('auth_token');
    console.log('Auth token exists:', !!token);
    
    if (!token) {
      console.log('No auth token, skipping calendar data fetch');
      return;
    }
    
    try {
      const bookingResponse = await fetch(`/api/houses/${selectedListing.value.id}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (bookingResponse.ok) {
        const bookingData = await bookingResponse.json();
        bookings.value[selectedListing.value.id] = bookingData || [];
        console.log('Fetched bookings:', bookingData);
      } else {
        console.log('No bookings found or error fetching bookings');
        bookings.value[selectedListing.value.id] = [];
      }
    } catch (bookingError) {
      console.error('Error fetching bookings:', bookingError);
      bookings.value[selectedListing.value.id] = [];
    }
    
    try {
      const unavailableResponse = await fetch(`/api/houses/${selectedListing.value.id}/unavailable-dates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (unavailableResponse.ok) {
        const unavailableData = await unavailableResponse.json();
        unavailableDates.value[selectedListing.value.id] = unavailableData || [];
        console.log('Fetched unavailable dates:', unavailableData);
      } else {
        console.log('No unavailable dates found or error fetching unavailable dates');
        unavailableDates.value[selectedListing.value.id] = [];
      }
    } catch (unavailableError) {
      console.error('Error fetching unavailable dates:', unavailableError);
      unavailableDates.value[selectedListing.value.id] = [];
    }
  } catch (error) {
    console.error('Error fetching calendar data:', error);
  }
}

function initCalendarBookings() {
  if (houses.value.length && !selectedListingId.value) {
    selectedListingId.value = houses.value[0].id;
  }
}

watch(selectedListing, (newListing) => {
  if (newListing) {
    fetchCalendarData();
  }
});

onMounted(async () => {
  console.log('Profile component mounted');
  await fetchListings();
  initCalendarBookings();
  
  if (mainTab.value === 'bookings') {
    fetchBookings();
  }
});

watch(mainTab, (tab) => {
  console.log('Tab changed to:', tab);
  if (tab === 'calendar') {
    initCalendarBookings();
  } else if (tab === 'listings') {
    fetchListings();
  } else if (tab === 'bookings') {
    fetchBookings();
  }
});

async function fetchListings() {
  try {
    console.log('Fetching user listings...');
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.log('No auth token found, cannot fetch user listings');
      houses.value = [];
      return;
    }
    
    const response = await fetch('/api/my-houses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      houses.value = data || [];
      console.log('Fetched user houses:', houses.value.length);
    } else {
      console.error('Error fetching user houses:', response.status);
      houses.value = [];
    }
  } catch (error) {
    console.error('Error fetching user houses:', error);
    houses.value = [];
  }
}

async function fetchBookings() {
  try {
    console.log('Fetching user bookings...');
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.log('No auth token found, cannot fetch user bookings');
      userBookings.value = [];
      return;
    }
    
    const response = await fetch('/api/my-bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      userBookings.value = data || [];
      console.log('Fetched user bookings:', userBookings.value.length);
    } else {
      console.error('Error fetching user bookings:', response.status);
      userBookings.value = [];
    }
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    userBookings.value = [];
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function handleTabClick(tab) {
  console.log('Tab clicked:', tab);
  mainTab.value = tab;
}

function goToDetails(id) {
  router.push(`/property/${id}`);
}
</script>
/* Listing card styles */
.profile-listings-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: left;
  margin-left: 0;
   position: relative;
}
 .plus-btn {
   background: #ff385c;
   color: #fff;
   border: none;
   border-radius: 50%;
   width: 44px;
   height: 44px;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 2rem;
   font-weight: 700;
   cursor: pointer;
   box-shadow: 0 2px 8px rgba(0,0,0,0.10);
   transition: background 0.2s;
   margin-left: 1rem;
 }
 .plus-btn:hover {
   background: #e03150;
 }
.listing-card {
  background: #e1e1e1;
  border-radius: 20px;
  width: 420px;
  height: 400px;
  position: relative;
  margin-bottom: 1.5rem;
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.listing-status {
  position: absolute;
  top: 18px;
  left: 18px;
  background: #fff;
  border-radius: 20px;
  padding: 0.2rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.listing-dot {
  width: 10px;
  height: 10px;
  background: orange;
  border-radius: 50%;
  display: inline-block;
}
.listing-image {
  width: 100%;
  height: 320px;
  background: #d6d6d6;
  border-radius: 16px;
  margin-top: 40px;
}
.listing-info {
  padding: 1rem 1.2rem 0.5rem 1.2rem;
  text-align: left;
}
.listing-desc {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.listing-type {
  color: #717171;
  font-size: 1rem;
}

<style scoped>
/* Calendar select styles */
.calendar-select-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
select#calendarListingSelect {
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1.05rem;
}
/* Calendar styles */
.profile-calendar {
  margin-top: 2rem;
}
.calendar-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}
.calendar-listing-block {
  margin-bottom: 2.5rem;
}
.calendar-listing-name {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 0.7rem;
}
.calendar-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
  padding: 0 1rem;
}

.calendar-month-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #222;
  margin: 0;
}

.nav-btn {
  background: #f7f7f7;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-btn:hover {
  background: #e7e7e7;
}

.calendar-header {
  margin-bottom: 0.5rem;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 0.5rem;
}

.weekday {
  padding: 0.5rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: #666;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin: 1rem 0;
}

.calendar-day {
  min-height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  position: relative;
  background: #fff;
  transition: all 0.2s;
}

.calendar-day:hover:not(.other-month):not(.past-date) {
  background: #f7f7f7;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.calendar-day.other-month {
  color: #ccc;
  background: #fafafa;
  cursor: not-allowed;
}

.calendar-day.past-date {
  color: #ccc;
  background: #fafafa;
  cursor: not-allowed;
}

.calendar-day.today {
  border: 2px solid #ff385c;
  font-weight: bold;
}

.calendar-day.booked {
  background: #ff385c;
  color: white;
  cursor: not-allowed;
}

.calendar-day.unavailable {
  background: #f0f0f0;
  color: #666;
}

.calendar-day.unavailable:hover:not(.other-month):not(.past-date) {
  background: #e8e8e8;
}

.calendar-day.booked:hover {
  background: #e02850;
}

.calendar-day.unavailable {
  background: #f0f0f0;
  color: #999;
  cursor: not-allowed;
}

.calendar-day.past-date {
  background: #fafafa;
  color: #ccc;
  cursor: not-allowed;
  text-decoration: line-through;
}

.day-number {
  font-size: 0.9rem;
  font-weight: 500;
}

.booking-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
}

.booking-dot {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
}

.calendar-legend {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-dot.available {
  background: #fff;
  border: 1px solid #e0e0e0;
}

.legend-dot.booked {
  background: #ff385c;
}

.legend-dot.unavailable {
  background: #f0f0f0;
}

.calendar-instructions {
  margin-top: 1rem;
  padding: 1rem;
  background: #e8f5e8;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.calendar-instructions p {
  margin: 0;
  color: #2d5a2d;
  font-size: 0.9rem;
}

.profile-container {
  min-height: 80vh;
  background: #fff;
}
.profile-tabbar {
  display: flex;
  gap: 2.5rem;
  justify-content: center;
  align-items: center;
  padding: 2.5rem 0 0.5rem 0;
  font-size: 1.15rem;
  font-weight: 500;
  color: #444;
}
.profile-tab {
  position: relative;
  cursor: pointer;
  padding-bottom: 0.3rem;
}
.profile-tab.active {
  color: #222;
  font-weight: 600;
}

.profile-tab-btn {
  background: #f7f7f7;
  color: #222;
  border: none;
  border-radius: 24px;
  padding: 0.7rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  transition: background 0.2s;
}
.profile-tab-btn.active {
  background: #222;
  color: #fff;
}
.profile-main {
  flex: 1;
  padding: 2.5rem 3rem 1.5rem 3rem;
}
 .profile-listings-header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin-bottom: 2rem;
 }
 .profile-listings-title {
   font-size: 2rem;
   font-weight: 700;
 }
 .plus-btn-modern {
   background: none;
   border: none;
   padding: 0;
   cursor: pointer;
   display: flex;
   align-items: center;
   transition: transform 0.15s;
 }
 .plus-btn-modern:hover {
   transform: scale(1.08);
 }
 .listing-grid {
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
   gap: 2rem;
   margin-top: 1rem;
 }
 .listing-card-modern {
   background: #fff;
   border-radius: 18px;
   box-shadow: 0 4px 16px rgba(0,0,0,0.08);
   overflow: hidden;
   display: flex;
   flex-direction: column;
   align-items: center;
   cursor: pointer;
   transition: box-shadow 0.2s;
   min-height: 280px;
 }
 .listing-card-modern:hover {
   box-shadow: 0 8px 32px rgba(0,0,0,0.14);
 }
 .listing-image-modern {
   width: 100%;
   height: 180px;
   background: #f3f3f3;
   display: flex;
   align-items: center;
   justify-content: center;
 }
 .listing-image-modern img {
   width: 100%;
   height: 100%;
   object-fit: cover;
   border-radius: 0 0 18px 18px;
 }
 .listing-image-placeholder {
   color: #aaa;
   font-size: 1.1rem;
   text-align: center;
 }
 .listing-name-modern {
   font-size: 1.25rem;
   font-weight: 600;
   margin: 1.2rem 0 0.7rem 0;
   text-align: center;
   color: #222;
 }
/* Removed invalid/duplicate CSS */
.profile-tabs {
  display: flex;
  gap: 1rem;
  margin: 2rem 0 2.5rem 0;
}
.profile-tab {
  background: #f7f7f7;
  color: #222;
  border: none;
  border-radius: 24px;
  padding: 0.7rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  transition: background 0.2s;
}
.profile-tab.active {
  background: #222;
  color: #fff;
}
.profile-reservation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 5rem;
}
.profile-reservation-img {
  width: 140px;
  margin-bottom: 2rem;
}
.profile-reservation-text h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #222;
  text-align: center;
}
.profile-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}
.profile-role {
  color: #717171;
  font-size: 1.1rem;
}
.profile-complete {
  flex: 1;
  margin-left: 2.5rem;
  margin-top: 0.5rem;
}
.profile-complete h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.profile-complete p {
  color: #222;
  font-size: 1rem;
  margin-bottom: 1.2rem;
}
.profile-btn {
  background: #ff385c;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  transition: background 0.2s;
}
.profile-btn:hover {
  background: #e03150;
}
.profile-edit {
  position: absolute;
  top: 0;
  right: 0;
  background: #f7f7f7;
  color: #222;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  transition: background 0.2s;
}
.profile-edit:hover {
  background: #ececec;
}
.profile-reviews {
  margin-top: 2.5rem;
  font-size: 1.15rem;
  color: #222;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.profile-review-icon {
  font-size: 1.3rem;
}
/* Slide right animation */
.slide-right-enter-active, .slide-right-leave-active {
  transition: all 0.5s cubic-bezier(0.77,0,0.175,1);
}
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-60px);
}
.slide-right-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.slide-right-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(60px);
}

/* Bookings styles */
.profile-bookings {
  padding: 2rem 0;
}

.bookings-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #222;
}

.no-bookings {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.no-bookings-content {
  text-align: center;
}

.no-bookings-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #222;
}

.no-bookings-content p {
  color: #717171;
  margin-bottom: 2rem;
}

.browse-btn {
  background: #ff385c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.browse-btn:hover {
  background: #e00b41;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.booking-card {
  display: flex;
  background: white;
  border: 1px solid #dddddd;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s;
}

.booking-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.booking-image {
  width: 200px;
  height: 150px;
}

.booking-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.booking-details {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.booking-details h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #222;
}

.booking-location {
  color: #717171;
  margin-bottom: 1rem;
}

.booking-dates {
  margin-bottom: 1rem;
}

.booking-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.booking-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
}

.booking-status.confirmed {
  background: #d4edda;
  color: #155724;
}

.booking-status.pending {
  background: #fff3cd;
  color: #856404;
}

.booking-status.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.booking-price {
  font-size: 1.2rem;
  color: #222;
}

@media (max-width: 768px) {
  .booking-card {
    flex-direction: column;
  }
  
  .booking-image {
    width: 100%;
    height: 200px;
  }
}
</style>
