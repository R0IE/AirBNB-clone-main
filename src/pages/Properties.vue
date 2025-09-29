<template>
  <div class="properties-container">
    <h1>Properties</h1>
    <div class="properties-grid">
      <PropertyCard 
        v-for="property in properties" 
        :key="property.id" 
        :property="property"
        @click="goToProperty(property.id)"
      />
    </div>
    <div v-if="properties.length === 0" class="no-properties">
      <p>No properties found matching your search.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../api.js';
import PropertyCard from '../components/PropertyCard.vue';

const route = useRoute();
const router = useRouter();
const properties = ref([]);

onMounted(async () => {
  await loadProperties();
});

async function loadProperties() {
  try {
    const { startDate, endDate, location, guests } = route.query;
    
    if (startDate && endDate) {
      const { data, error } = await supabase.getAvailableProperties(startDate, endDate, location, guests);
      if (error) {
        console.error('Error loading available properties:', error);
      } else {
        properties.value = data || [];
      }
    } else {
      const { data, error } = await supabase.from('houses').select('*');
      if (error) {
        console.error('Error loading properties:', error);
      } else {
        properties.value = data || [];
      }
    }
  } catch (error) {
    console.error('Error loading properties:', error);
  }
}

function goToProperty(id) {
  router.push(`/property/${id}`);
}
</script>

<style scoped>
.properties-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.no-properties {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.no-properties p {
  font-size: 1.1rem;
}
</style>