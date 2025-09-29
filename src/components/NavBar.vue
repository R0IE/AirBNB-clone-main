<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/properties">Properties</router-link> |
    <router-link to="/login">Login</router-link>
  </nav>
</template>

<script setup>
</script>

<style scoped>
nav {
  margin-bottom: 2rem;
}
router-link {
  margin: 0 0.5rem;
}
</style>
