<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <router-link class="navbar-brand" to="/">CatShop</router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto"></ul>
        <ul class="navbar-nav align-items-center">
          <template v-if="!isLoggedIn">
            <li class="nav-item">
              <router-link class="nav-link" to="/login"
                >เข้าสู่ระบบ</router-link
              >
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/register"
                >สมัครสมาชิก 👤</router-link
              >
            </li>
          </template>

          <template v-else>
            <li class="nav-item" v-if="userRole === 'user'">
              <router-link class="nav-link" to="/cart"
                >ตะกร้า {{ cart.length }} รายการ</router-link
              >
            </li>
            <li class="nav-item" v-if="userRole === 'user'">
              <router-link class="nav-link" to="/history"
                >ประวัติการซื้อ</router-link
              >
            </li>
            <li class="nav-item" v-if="userRole === 'seller'">
              <router-link class="nav-link" to="/seller/dashboard"
                >Seller Dashboard</router-link
              >
            </li>
            <li class="nav-item" v-if="userRole === 'admin'">
              <router-link class="nav-link" to="/admin/dashboard"
                >Admin Dashboard</router-link
              >
            </li>
            <li class="nav-item">
              <span class="navbar-text me-3">
                ยินดีต้อนรับ {{ user.username }}
              </span>
            </li>
            <li class="nav-item">
              <button
                class="btn btn-outline-light btn-sm"
                @click="handleLogout"
              >
                ออกจากระบบ
              </button>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  computed: {
    ...mapGetters(["isLoggedIn", "userRole", "user", "cart"]),
  },
  methods: {
    ...mapActions(["logout", "fetchCart"]),
    handleLogout() {
      this.logout();
      this.$router.push("/login");
    },
  },
  watch: {
    isLoggedIn(newVal) {
      if (newVal) {
        this.fetchCart();
      }
    },
  },
  created() {
    if (this.isLoggedIn) {
      this.fetchCart();
    }
  },
};
</script>