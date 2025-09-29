<template>
  <div id="app">
    <Header />
    <router-view />
  <Footer v-if="$route.path !== '/become-a-host' && $route.path !== '/host-location' && $route.path !== '/confirm-address'" />
  </div>
</template>

<script setup>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
