<template>
  <div class="container mt-4">
    <h1>Admin Dashboard</h1>
    <p class="text-muted">
      ในฐานะ Admin คุณสามารถใช้ฟังก์ชันทั้งหมดของ Seller ได้
      และสามารถจัดการผู้ใช้ทั้งหมดได้
    </p>
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'AdminUserManager' }"
          @click="currentTab = 'AdminUserManager'"
          >จัดการผู้ใช้ทั้งหมด</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'ProductManager' }"
          @click="currentTab = 'ProductManager'"
          >จัดการสินค้า</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'OrderHistoryManager' }"
          @click="currentTab = 'OrderHistoryManager'"
          >ประวัติการขาย</a
        >
      </li>
    </ul>
    <div class="mt-3">
      <component :is="currentTab"></component>
    </div>
  </div>
</template>

<script>
// Import component ของ Admin
import AdminUserManager from "@/components/admin/AdminUserManager.vue";
// Import component ของ Seller มาใช้ร่วมด้วย
import ProductManager from "@/components/seller/ProductManager.vue";
import OrderHistoryManager from "@/components/seller/OrderHistoryManager.vue";

export default {
  components: {
    AdminUserManager,
    ProductManager,
    OrderHistoryManager,
  },
  data() {
    return {
      currentTab: "AdminUserManager",
    };
  },
};
</script>