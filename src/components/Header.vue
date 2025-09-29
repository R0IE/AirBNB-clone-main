<template>
  <header class="airbnb-header">
    <div class="logo">Airbnb</div>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link v-if="!user" to="/login">Login</router-link>
      <span v-if="user" class="user-profile" @click="goToProfile">
        <span class="user-icon">{{ user.email?.charAt(0).toUpperCase() }}</span>
        <span class="user-info">{{ user.user_metadata?.firstName || '' }}</span>
      </span>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../api.js';
const user = ref(null);
const userInitial = computed(() => user.value ? user.value.firstName?.charAt(0).toUpperCase() : 'O');
const router = useRouter();
function goToProfile() {
  router.push('/profile');
}
onMounted(async () => {
  const { data } = await supabase.auth.getUser();
  user.value = data?.user || null;
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null;
  });
});
</script>
.logo {
  font-size: 2rem;
  font-weight: bold;
  color: #ff385c;
  font-family: 'Cereal', 'Avenir', Helvetica, Arial, sans-serif;
}
.user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f7f7f7;
  border-radius: 24px;
  padding: 0.25rem 0.75rem;
  margin-left: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  transition: box-shadow 0.2s;
}
.user-profile:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.user-icon {
  width: 32px;
  height: 32px;
  background: #000000;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
}
.user-info {
  font-size: 1rem;
  color: #222;
  font-weight: 500;
}

<style scoped>
.airbnb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.logo {
  font-size: 2rem;
  font-weight: bold;
  color: #ff385c;
  font-family: 'Cereal', 'Avenir', Helvetica, Arial, sans-serif;
}
nav {
  display: flex;
  gap: 1.5rem;
}
nav a {
  color: #222;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
}
nav a.router-link-active {
  color: #ff385c;
}
</style>
