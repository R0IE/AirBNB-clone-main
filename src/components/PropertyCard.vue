<template>
  <router-link :to="propertyLink" class="property-card-link">
    <div class="property-card">
      <img :src="image" alt="Property" class="property-image" />
      <div class="property-info">
        <div class="property-title">{{ title }}</div>
        <div class="property-details">
          <div class="date-and-availability">
            <span class="property-date" v-if="searchParams && searchParams.checkIn && searchParams.checkOut">
              {{ formatDateRange(searchParams.checkIn, searchParams.checkOut) }}
            </span>
            <span v-else class="property-date">Available dates</span>
            <span v-if="searchParams && searchParams.checkIn && searchParams.checkOut" class="availability-badge">
              Available
            </span>
          </div>
          <div class="price-and-rating">
            <span class="property-price">€{{ price }} / night</span>
            <span class="property-rating"> · ★ 4.84</span>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: Number,
  image: String,
  title: String,
  location: String,
  price: Number,
  searchParams: Object
});

const propertyLink = computed(() => {
  let link = `/property/${props.id}`;
  
  if (props.searchParams && props.searchParams.checkIn && props.searchParams.checkOut) {
    const params = new URLSearchParams({
      checkIn: props.searchParams.checkIn,
      checkOut: props.searchParams.checkOut,
      guests: props.searchParams.guests?.toString() || '1'
    });
    
    if (props.searchParams.location) {
      params.append('location', props.searchParams.location);
    }
    
    link += `?${params.toString()}`;
  }
  
  return link;
});

function formatDateRange(checkIn, checkOut) {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  
  const options = { month: 'short', day: 'numeric' };
  const start = startDate.toLocaleDateString('en-US', options);
  const end = endDate.toLocaleDateString('en-US', options);
  
  return `${start} – ${end}`;
}
</script>

<style scoped>
.property-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  overflow: hidden;
  transition: box-shadow 0.2s;
  width: 100%;
  min-width: 220px;
  max-width: 340px;
  margin: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
}
.property-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.property-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.property-info {
  padding: 1rem 1rem 0.5rem 1rem;
}
.property-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  color: #222;
}
.property-details {
  font-size: 0.98rem;
  color: #222;
  margin-bottom: 0.1rem;
}
.property-date {
  color: #717171;
}
.property-price {
  color: #222;
  font-weight: 400;
}
.property-rating {
  color: #222;
  font-weight: 400;
}
.date-and-availability {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
}
.availability-badge {
  font-size: 0.8rem;
  color: #00a818;
  font-weight: 600;
}
.price-and-rating {
  display: flex;
  align-items: center;
}
.property-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.property-location {
  color: #717171;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}
.property-price {
  color: #ff385c;
  font-weight: bold;
  font-size: 1.1rem;
}
</style>
