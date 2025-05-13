<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HomeView from "@/views/HomeView.vue";
import NavComponent from './components/NavComponent.vue';

</script>

<template>
  <NavComponent />
  <RouterView />
</template>

<style scoped>
* {
  /* 'Goodly-Medium' */
  font-family: 'goodly';
}
</style>
