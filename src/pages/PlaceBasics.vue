<template>
  <HostFlowLayout :step="4" :total="5">
    <div class="place-basics-container">
      <h1 class="place-basics-title">Share some basics about your place</h1>
      <p class="place-basics-desc">You'll add more details later, like bed types.</p>
      <form class="place-basics-form" @submit.prevent="goNext">
        <div v-for="item in items" :key="item.key" class="place-basics-row">
          <label>{{ item.label }}</label>
          <div class="place-basics-controls">
            <button type="button" class="place-basics-btn" @click="decrement(item.key)" :disabled="form[item.key] <= item.min">−</button>
            <span class="place-basics-value">{{ form[item.key] }}</span>
            <button type="button" class="place-basics-btn" @click="increment(item.key)" :disabled="form[item.key] >= item.max">+</button>
          </div>
        </div>
        <button class="place-basics-next" type="submit">Next</button>
      </form>
    </div>
  </HostFlowLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../api.js';
import HostFlowLayout from '../components/HostFlowLayout.vue';
const router = useRouter();
const items = [
  { key: 'guests', label: 'Guests', min: 1, max: 1600 },
  { key: 'bedrooms', label: 'Bedrooms', min: 1, max: 10 },
  { key: 'beds', label: 'Beds', min: 1, max: 20 },
  { key: 'bathrooms', label: 'Bathrooms', min: 1, max: 10 }
];
const form = ref({
  guests: 1,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1
});
function increment(key) {
  if (form.value[key] < items.find(i => i.key === key).max) {
    form.value[key]++;
  }
}
function decrement(key) {
  if (form.value[key] > items.find(i => i.key === key).min) {
    form.value[key]--;
  }
}
async function goNext() {
  localStorage.setItem('houseBasics', JSON.stringify({
    guests: form.value.guests,
    bedrooms: form.value.bedrooms,
    beds: form.value.beds,
    bathrooms: form.value.bathrooms
  }));
  router.push('/house-name-images');
}
</script>

<style scoped>
.place-basics-container {
  max-width: 700px;
  margin: 0 auto;
  padding-top: 5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.place-basics-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
  text-align: left;
  width: 100%;
}
.place-basics-desc {
  color: #717171;
  font-size: 1.1rem;
  margin-bottom: 2.2rem;
  text-align: left;
  width: 100%;
}
.place-basics-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: flex-start;
}
.place-basics-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding-bottom: 1.2rem;
}
.place-basics-row label {
  font-size: 1.2rem;
  color: #222;
  font-weight: 500;
  text-align: left;
}
.place-basics-controls {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.place-basics-btn {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  color: #222;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border 0.2s;
}
.place-basics-btn:disabled {
  color: #ccc;
  border-color: #eee;
  cursor: not-allowed;
}
.place-basics-value {
  font-size: 1.3rem;
  font-weight: 600;
  min-width: 32px;
  text-align: center;
}
.place-basics-next {
  margin-top: 2rem;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  transition: background 0.2s;
}
.place-basics-next:disabled {
  background: #e5e5e5;
  color: #aaa;
  cursor: not-allowed;
}
</style>
