<template>
  <Navbar />
  <main class="flex-shrink-0">
      <router-view/>
  </main>
  <footer class="footer mt-auto py-3 bg-light">
    <div class="container text-center">
      <p class="text-muted">Powered by Kitisak, Achita, WoraPhon</p>
      <p class="text-muted">Sponser by DR.Nattapong S</p>
      <span class="text-muted fw-bold">CatShop © 2025</span>
    </div>
  </footer>
</template>

<script>
import Navbar from './components/Navbar.vue';

export default {
  components: {
    Navbar
  }
};
</script>

<style>
/* ทำให้ footer อยู่ด้านล่างสุดเสมอ */
body, #app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1;
}
</style>