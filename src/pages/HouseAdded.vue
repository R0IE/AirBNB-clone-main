<template>
  <HostFlowLayout :step="5" :total="5">
    <div class="house-added-container">
      <transition name="fade-scale">
        <div v-if="show" class="house-added-box">
          <div class="house-added-check">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="28" fill="#27ae60"/>
              <path d="M16 29L25 38L40 22" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="house-added-title">House added!</h1>
          <p class="house-added-desc">Your house has been successfully added. You can edit details or add photos later.</p>
        </div>
      </transition>
    </div>
  </HostFlowLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import HostFlowLayout from '../components/HostFlowLayout.vue';
const show = ref(false);
onMounted(() => {
  setTimeout(() => {
    show.value = true;
  }, 200);
});
</script>

<style scoped>
.house-added-container {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.house-added-box {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.10);
  padding: 3rem 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: pop-in 0.7s cubic-bezier(0.77,0,0.175,1);
}
.house-added-check {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.house-added-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  text-align: center;
}
.house-added-desc {
  color: #717171;
  font-size: 1.1rem;
  text-align: center;
}
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 0.7s cubic-bezier(0.77,0,0.175,1);
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
.fade-scale-enter-to, .fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}
@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.7); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
