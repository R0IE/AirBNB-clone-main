<template>
  <HostFlowLayout :step="2" :total="2">
    <div class="host-location-container">
      <h1 class="host-location-title">Where's your place located?</h1>
      <p class="host-location-desc">Your address is only shared with guests after they’ve made a reservation.</p>
      <div class="host-location-input-row">
        <input class="host-location-input" type="text" placeholder="Enter your address" v-model="address" />
      </div>
      <div class="host-location-map">
        <iframe
          width="100%"
          height="350"
          frameborder="0"
          style="border-radius:24px; border:0;"
          src="https://www.google.com/maps/embed/v1/place?key=AIzaSyA-jDeLkma55Fb-9yR-IUu3jVSyA7n0254&q=Keila,Estonia"
          allowfullscreen>
        ></iframe>
      </div>
      <div class="host-location-footer">
        <button class="host-location-next" @click="goNext">Next</button>
      </div>
    </div>
  </HostFlowLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import HostFlowLayout from '../components/HostFlowLayout.vue';
const address = ref('');
const router = useRouter();

function goNext() {
  router.push('/confirm-address');
}
</script>

<style scoped>
.host-location-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}
.host-location-next {
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
.host-location-next:disabled {
  background: #e5e5e5;
  color: #aaa;
  cursor: not-allowed;
}
.host-location-container {
  max-width: 700px;
  margin: 0 auto;
  padding-top: 5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.host-location-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
  text-align: left;
}
.host-location-desc {
  color: #717171;
  font-size: 1.1rem;
  margin-bottom: 2.2rem;
  text-align: left;
}
.host-location-input-row {
  width: 100%;
  margin-bottom: 2rem;
  display: flex;
  justify-content: flex-start;
}
.host-location-input {
  width: 100%;
  font-size: 1.2rem;
  padding: 1.2rem 1.5rem;
  border-radius: 32px;
  border: none;
  box-shadow: 0 2px 16px rgba(0,0,0,0.10);
  outline: none;
}
.host-location-map {
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 2rem;
}
</style>
