<template>
  <div class="guest-dropdown">
    <div v-for="(group, i) in groups" :key="group.label" class="guest-row">
      <div>
        <div class="guest-label">{{ group.label }}</div>
        <div class="guest-desc" v-if="group.desc">{{ group.desc }}</div>
        <a v-if="group.link" :href="group.link" class="guest-link" target="_blank">Bringing a service animal?</a>
      </div>
      <div class="guest-controls">
        <button type="button" class="guest-btn" @click="decrement(i)">−</button>
        <span class="guest-count">{{ counts[i] }}</span>
        <button type="button" class="guest-btn" @click="increment(i)">+</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({ open: Boolean, counts: Array });
const emit = defineEmits(['update']);
const groups = [
  { label: 'Adults', desc: 'Ages 13 or above' },
  { label: 'Children', desc: 'Ages 2 – 12' },
  { label: 'Infants', desc: 'Under 2' },
  { label: 'Pets', link: 'https://www.airbnb.com/help/article/1869' }
];
const counts = ref(props.counts ? [...props.counts] : [0, 0, 0, 0]);
function increment(i) {
  counts.value[i]++;
  emit('update', [...counts.value]);
}
function decrement(i) {
  if (counts.value[i] > 0) {
    counts.value[i]--;
    emit('update', [...counts.value]);
  }
}
</script>

<style scoped>
.guest-dropdown {
  position: absolute;
  left: 50%;
  top: 60px;
  transform: translateX(-50%);
  width: 420px;
  background: #fff;
  border-radius: 32px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.12);
  z-index: 20;
  padding: 2rem 2rem 1.5rem 2rem;
}
.guest-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 0;
  border-bottom: 1px solid #eee;
}
.guest-row:last-child {
  border-bottom: none;
}
.guest-label {
  font-size: 1.1rem;
  font-weight: 600;
}
.guest-desc {
  color: #717171;
  font-size: 0.95rem;
}
.guest-link {
  color: #717171;
  font-size: 0.95rem;
  text-decoration: underline;
}
.guest-controls {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.guest-btn {
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.5rem;
  color: #222;
  cursor: pointer;
  transition: border 0.2s;
}
.guest-btn:hover {
  border-color: #ff385c;
}
.guest-count {
  font-size: 1.2rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}
</style>
