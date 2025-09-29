<template>
  <div class="home-container">
    <SearchBar @search="handleSearch" />
    <div class="property-listing-section">
      <div class="property-listing-header">
        <h2>Popular homes in Paris</h2>
        <span class="arrow-group">
          <button class="arrow-btn" @click="scrollLeft" aria-label="Scroll left">
            <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#f7f7f7"/><path d="M16.5 9l-5 5 5 5" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="arrow-btn" @click="scrollRight" aria-label="Scroll right">
            <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#f7f7f7"/><path d="M11.5 9l5 5-5 5" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </span>
      </div>
      <div class="property-grid" ref="scrollContainer">
        <PropertyCard
          v-for="property in properties"
          :key="property.id"
          :id="property.id"
          :image="property.image"
          :title="property.title"
          :location="property.location"
          :price="property.price"
          :searchParams="currentSearchParams"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import SearchBar from '../components/SearchBar.vue';
import PropertyCard from '../components/PropertyCard.vue';
import { ref, onMounted } from 'vue';
import { supabase } from '../api.js';

const properties = ref([]);
const scrollContainer = ref(null);
const currentSearchParams = ref(null);

async function fetchProperties(searchParams = null) {
  try {
    let url = '/houses';
    const queryParams = new URLSearchParams();
    
    if (searchParams && !searchParams.showAll) {
      if (searchParams.checkIn) queryParams.append('checkIn', searchParams.checkIn);
      if (searchParams.checkOut) queryParams.append('checkOut', searchParams.checkOut);
      if (searchParams.guests) queryParams.append('guests', searchParams.guests.toString());
      if (searchParams.location) queryParams.append('location', searchParams.location);
    }
    
    if (queryParams.toString()) {
      url += '?' + queryParams.toString();
    }
    
    console.log('Fetching from:', `/api${url}`);
    const response = await fetch(`/api${url}`);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (!response.ok) {
      console.error('Error fetching houses:', data.error);
      properties.value = [];
    } else {
      console.log('Processing', data.length, 'houses');
      properties.value = (data || []).map(house => ({
        id: house.id,
        image: house.images && house.images.length ? house.images[0] : '/src/Images/Upcoming.avif',
        title: house.title || house.name || 'Property',
        location: house.location || '',
        price: house.price || 0
      }));
      console.log('Final properties array:', properties.value);
    }
  } catch (error) {
    console.error('Error fetching properties:', error);
    properties.value = [];
  }
}

function handleSearch(searchParams) {
  currentSearchParams.value = searchParams;
  fetchProperties(searchParams);
}

onMounted(() => {
  fetchProperties();
});

function scrollLeft() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: -400, behavior: 'smooth' });
  }
}
function scrollRight() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: 400, behavior: 'smooth' });
  }
}
</script>
<style scoped>
.home-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}
.headline {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #222;
  text-align: left;
}
.property-listing-section {
  margin: 2rem 0;
  width: 90vw;
  position: relative;
  left: 50%;
  right: 50%;
  transform: translateX(-50%);
}
.property-listing-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.property-listing-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
}
.arrow-group {
  display: flex;
  gap: 0.25rem;
  margin-left: 0.5rem;
}
.arrow-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
}
.property-grid {
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  padding: 1rem 0;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
}

/* Hide scrollbar for Chrome, Safari and Opera */
.property-grid::-webkit-scrollbar {
  height: 8px;
  background: transparent;
}
.property-grid::-webkit-scrollbar-thumb {
  background: transparent;
}
</style>
