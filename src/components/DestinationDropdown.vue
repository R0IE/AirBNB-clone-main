<template>
  <div v-if="open" class="dropdown">
    <div class="dropdown-title">Suggested destinations</div>
    <div class="dropdown-list">
      <div
        v-for="(dest, i) in destinations"
        :key="dest.name"
        class="dropdown-item"
        :class="{ selected: selectedIndex === i }"
        @click="select(i)"
      >
        <div class="icon-wrapper">
          <span v-if="selectedIndex === i" class="circle-anim"></span>
          <img :src="dest.icon" class="icon" />
        </div>
        <div>
          <div class="dest-name">{{ dest.name }}</div>
          <div class="dest-desc">{{ dest.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({ open: Boolean });
const emit = defineEmits(['select']);
const selectedIndex = ref(-1);
const destinations = [
  { name: 'Nearby', desc: 'Find what’s around you', icon: 'https://img.icons8.com/ios-filled/50/000000/navigation.png' },
  { name: 'Tartu, Estonia', desc: 'For a trip abroad', icon: 'https://img.icons8.com/color/48/000000/forest.png' },
  { name: 'Pärnu, Estonia', desc: 'Near you', icon: 'https://img.icons8.com/color/48/000000/beach.png' },
  { name: 'Tallinn, Estonia', desc: 'For its stunning architecture', icon: 'https://img.icons8.com/color/48/000000/city.png' },
  { name: 'Riga, Latvia', desc: 'For sights like Freedom Monument', icon: 'https://img.icons8.com/color/48/000000/monument.png' },
  { name: 'Helsinki, Finland', desc: 'For a trip abroad', icon: 'https://img.icons8.com/color/48/000000/lake.png' },
  { name: 'Haapsalu, Estonia', desc: 'Known for its lakes', icon: 'https://img.icons8.com/color/48/000000/lake.png' }
];
function select(i) {
  selectedIndex.value = i;
  emit('select', destinations[i]);
}
</script>

<style scoped>
.dropdown {
  position: absolute;
  top: 60px;
  left: 0;
  width: 400px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.12);
  z-index: 10;
  padding: 1.5rem 0.5rem 1.5rem 1.5rem;
}
.dropdown-title {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
.dropdown-list {
  max-height: 350px;
  overflow-y: auto;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 0.5rem;
  border-radius: 16px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
}
.dropdown-item.selected {
  background: #f7f7f7;
}
.icon-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon {
  width: 36px;
  height: 36px;
  z-index: 2;
}
.circle-anim {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 48px;
  height: 48px;
  background: rgba(255,56,92,0.15);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0.5);
  z-index: 1;
  animation: circleMove 0.4s cubic-bezier(.4,2,.6,1) forwards;
}
@keyframes circleMove {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.5; }
  60% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.7; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}
.dest-name {
  font-weight: 600;
  font-size: 1rem;
}
.dest-desc {
  color: #717171;
  font-size: 0.95rem;
}
</style>
