<template>
  <HostFlowLayout :step="1" :total="2">
    <div class="become-host-container">
      <h1 class="become-host-title">What type of place will guests have?</h1>
      <div class="become-host-options">
        <div :class="['become-host-option', selected === 'entire' ? 'selected' : '']" @click="selected = 'entire'">
          <div class="become-host-option-content">
            <span class="become-host-option-title">An entire place</span>
            <span class="become-host-option-desc">Guests have the whole place to themselves.</span>
          </div>
          <span class="become-host-option-icon">🏠</span>
        </div>
        <div :class="['become-host-option', selected === 'room' ? 'selected' : '']" @click="selected = 'room'">
          <div class="become-host-option-content">
            <span class="become-host-option-title">A room</span>
            <span class="become-host-option-desc">Guests have their own room in a home, plus access to shared spaces.</span>
          </div>
          <span class="become-host-option-icon">🚪</span>
        </div>
        <div :class="['become-host-option', selected === 'shared' ? 'selected' : '']" @click="selected = 'shared'">
          <div class="become-host-option-content">
            <span class="become-host-option-title">A shared room in a hostel</span>
            <span class="become-host-option-desc">Guests sleep in a shared room in a professionally managed hostel with staff onsite 24/7.</span>
          </div>
          <span class="become-host-option-icon">👥</span>
        </div>
      </div>
      <div class="become-host-footer">
        <button class="become-host-back" @click="$router.back()">Back</button>
        <button class="become-host-next" :disabled="!selected" @click="goNext">Next</button>
      </div>
    </div>
  </HostFlowLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import HostFlowLayout from '../components/HostFlowLayout.vue';
const selected = ref('');
const router = useRouter();

function goNext() {
  if (selected.value) {
    router.push('/host-location');
  }
}
</script>

<style scoped>
.become-host-container {
  max-width: 700px;
  margin: 0 auto;
  padding-top: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.become-host-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  text-align: center;
}
.become-host-options {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 2.5rem;
}
.become-host-option {
  background: #fff;
  border: 2px solid #e5e5e5;
  border-radius: 16px;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: border 0.2s;
}
.become-host-option.selected {
  border: 2px solid #222;
  background: #f7f7f7;
}
.become-host-option-content {
  display: flex;
  flex-direction: column;
}
.become-host-option-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}
.become-host-option-desc {
  color: #717171;
  font-size: 1rem;
}
.become-host-option-icon {
  font-size: 2rem;
  margin-left: 1.5rem;
}
.become-host-footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  bottom: 2rem;
  left: 0;
  padding: 0 2rem;
  z-index: 11;
}
.become-host-progress-bar {
  width: 100vw;
  height: 14px;
  background: #e5e5e5;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 10;
}
.become-host-progress {
  height: 100%;
  background: #222;
  transition: width 0.3s;
}
.become-host-back {
  background: none;
  border: none;
  color: #222;
  font-size: 1rem;
  text-decoration: underline;
  cursor: pointer;
}
.become-host-next {
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
  margin-right: 2.7rem;
}
.become-host-next:disabled {
  background: #e5e5e5;
  color: #aaa;
  cursor: not-allowed;
}
</style>
