<template>
  <div class="host-flow-container">
    <slot />
    <div class="host-flow-progress-bar">
      <div class="host-flow-progress" :style="{ width: progressWidth }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  step: Number,
  total: Number
});
const progressWidth = computed(() => `${Math.round((props.step / props.total) * 100)}%`);
</script>

<style scoped>
.host-flow-container {
  width: 100vw;
  min-height: 100vh;
  position: relative;
}
.host-flow-progress-bar {
  width: 100vw;
  height: 14px;
  background: #e5e5e5;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 10;
}
.host-flow-progress {
  height: 100%;
  background: #222;
  transition: width 0.3s;
}
</style>
