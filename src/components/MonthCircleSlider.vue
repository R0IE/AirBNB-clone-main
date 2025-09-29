<template>
  <div class="circle-slider">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="#f7f7f7"
      />
      <path
        :d="arcPath"
        fill="none"
        stroke="#ff385c"
        stroke-width="16"
        stroke-linecap="round"
      />
      <circle
        :cx="handle.x"
        :cy="handle.y"
        r="16"
        fill="#fff"
        stroke="#ff385c"
        stroke-width="4"
        @mousedown="startDrag"
        @touchstart.prevent="startDrag"
        style="cursor:pointer;"
      />
    </svg>
    <div class="circle-center">
      <div class="months-count">{{ value }}</div>
      <div class="months-label">months</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
const props = defineProps({
  value: { type: Number, default: 8 },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 12 },
  size: { type: Number, default: 240 }
});
const emit = defineEmits(['update:value']);
const center = props.size / 2;
const radius = props.size / 2 - 24;
const dragging = ref(false);
const value = ref(props.value);
const angle = computed(() => (value.value - props.min) / (props.max - props.min) * 270 + 135);
const arcPath = computed(() => describeArc(center, center, radius, 135, angle.value));
const handle = computed(() => polarToCartesian(center, center, radius, angle.value));
function startDrag(e) {
  dragging.value = true;
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchmove', onDrag);
  window.addEventListener('touchend', stopDrag);
}
function stopDrag() {
  dragging.value = false;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('touchmove', onDrag);
  window.removeEventListener('touchend', stopDrag);
}
function onDrag(e) {
  if (!dragging.value) return;
  const rect = e.target.closest('.circle-slider').getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left - center;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top - center;
  let ang = Math.atan2(y, x) * 180 / Math.PI;
  ang = (ang < 0 ? 360 + ang : ang);
  if (ang < 135) ang += 360;
  ang = Math.max(135, Math.min(405, ang));
  const percent = (ang - 135) / 270;
  const newVal = Math.round(percent * (props.max - props.min) + props.min);
  value.value = Math.max(props.min, Math.min(props.max, newVal));
  emit('update:value', value.value);
}
function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle-90) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.cos(rad)),
    y: cy + (r * Math.sin(rad))
  };
}
function describeArc(cx, cy, r, startAngle, endAngle){
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}
onMounted(() => {
  value.value = props.value;
});
</script>

<style scoped>
.circle-slider {
  position: relative;
  width: 240px;
  height: 240px;
  margin: 2rem auto 1rem auto;
}
.circle-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.months-count {
  font-size: 2.5rem;
  font-weight: bold;
  color: #222;
}
.months-label {
  font-size: 1.1rem;
  color: #717171;
}
</style>
