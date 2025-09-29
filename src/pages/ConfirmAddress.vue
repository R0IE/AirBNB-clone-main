<template>
  <HostFlowLayout :step="3" :total="3">
    <div class="confirm-address-container">
      <h1 class="confirm-address-title">Confirm your address</h1>
      <p class="confirm-address-desc">Your address is only shared with guests after they’ve made a reservation.</p>
  <form class="confirm-address-form" @submit="onSubmit">
        <div class="confirm-address-row">
          <label>Country / region</label>
          <input type="text" value="Estonia - EE" readonly />
        </div>
        <div class="confirm-address-row">
          <label>Street address</label>
          <input type="text" v-model="street" placeholder="Street address" />
        </div>
        <div class="confirm-address-row">
          <label>Farm name (if applicable)</label>
          <input type="text" v-model="farm" placeholder="Farm name (optional)" />
        </div>
        <div class="confirm-address-row">
          <label>Apt, door, etc. (if applicable)</label>
          <input type="text" v-model="apt" placeholder="Apt, door, etc. (optional)" />
        </div>
        <div class="confirm-address-row">
          <label>Municipality / district (if applicable)</label>
          <input type="text" v-model="municipality" placeholder="Municipality / district (optional)" />
        </div>
        <div class="confirm-address-row">
          <label>ZIP code</label>
          <input type="text" v-model="zip" placeholder="ZIP code" />
        </div>
        <div class="confirm-address-row">
          <label>City</label>
          <input type="text" v-model="city" value="City" />
        </div>
        <div class="confirm-address-row">
          <label>County</label>
          <input type="text" v-model="county" value="County" />
        </div>
        <button class="confirm-address-next" type="submit">Next</button>
      </form>
    </div>
  </HostFlowLayout>
</template>

<script setup>
import { ref } from 'vue';
import HostFlowLayout from '../components/HostFlowLayout.vue';
import { useRouter } from 'vue-router';
const street = ref('');
const farm = ref('');
const apt = ref('');
const municipality = ref('');
const zip = ref('');
const city = ref('City');
const county = ref('County');
const router = useRouter();

function onSubmit(e) {
  e.preventDefault();
  const addressData = {
    street: street.value,
    farm: farm.value,
    apt: apt.value,
    municipality: municipality.value,
    zip: zip.value,
    city: city.value,
    county: county.value
  };
  localStorage.setItem('houseAddress', JSON.stringify(addressData));
  router.push('/place-basics');
}
</script>

<style scoped>
.confirm-address-container {
  max-width: 700px;
  margin: 0 auto;
  padding-top: 5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.confirm-address-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
  width: 100%;
}
.confirm-address-desc {
  color: #717171;
  font-size: 1.1rem;
  margin-bottom: 2.2rem;
  width: 100%;
}
.confirm-address-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: .7rem;
}
.confirm-address-row {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.confirm-address-row label {
  font-size: 1rem;
  font-weight: 600;
  color: #222;
  width: 100%;
  text-align: left;
}
.confirm-address-row input {
  font-size: 1.1rem;
  padding: 1rem 1.2rem;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  background: #fff;
}
.confirm-address-next {
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
.confirm-address-next:disabled {
  background: #e5e5e5;
  color: #aaa;
  cursor: not-allowed;
}
</style>
