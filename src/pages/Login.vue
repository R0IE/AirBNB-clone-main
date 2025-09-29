<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2 class="auth-title">Log in or sign up</h2>
      <div class="divider"></div>
      <h3 class="welcome">Welcome to Airbnb</h3>
      <form class="auth-form" @submit.prevent="handleSubmit">
        <input type="email" v-model="email" placeholder="Email" required class="auth-input" />
        <input type="password" v-model="password" placeholder="Password" required class="auth-input" />
        <button type="submit" class="auth-btn" :disabled="loading">{{ loading ? 'Loading...' : 'Continue' }}</button>
        <div v-if="errorMsg" class="auth-error">{{ errorMsg }}</div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { supabase } from '../api.js';
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const loading = ref(false);

async function handleSubmit() {
  errorMsg.value = '';
  loading.value = true;
  const { error, data } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  });
  if (!error && data?.user) {
    loading.value = false;
    window.location.href = '/';
    return;
  }

  const { error: signUpError } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  });
  if (signUpError) {
    errorMsg.value = signUpError.message;
  } else {
    errorMsg.value = 'Account created successfully! You can now sign in.';
  }
  loading.value = false;
}
</script>
.auth-error {
  color: #d72660;
  margin-top: 0.5rem;
  font-size: 1rem;
  text-align: center;
}
<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #fafafa;
}
.auth-box {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  border: 1.5px solid #e0e0e0;
  padding: 2.5rem 2rem 2rem 2rem;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.auth-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
}
.divider {
  width: 100%;
  height: 1px;
  background: #e0e0e0;
  margin-bottom: 1.5rem;
}
.welcome {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  text-align: center;
}
.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.auth-input {
  width: calc(100% - 2px);
  box-sizing: border-box;
  padding: 0.75rem 1rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: #fafafa;
  outline: none;
  margin: 0;
}
.auth-input:focus {
  border-color: #ff385c;
}
.auth-btn {
  width: 100%;
  background: #ff385c;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.85rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  transition: background 0.2s;
}
.auth-btn:hover {
  background: #e03150;
}
</style>
