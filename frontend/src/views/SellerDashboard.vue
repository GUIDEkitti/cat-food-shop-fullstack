<template>
  <div class="container mt-4">
    <h1>Seller Dashboard</h1>
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'ProductManager' }"
          @click="currentTab = 'ProductManager'"
          href="#"
          >จัดการสินค้า</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'UserManager' }"
          @click="currentTab = 'UserManager'"
          href="#"
          >จัดการสมาชิก</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'OnsiteCheckout' }"
          @click="currentTab = 'OnsiteCheckout'"
          href="#"
          >ขายหน้าร้าน</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'OrderHistoryManager' }"
          @click="currentTab = 'OrderHistoryManager'"
          href="#"
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
import ProductManager from "@/components/seller/ProductManager.vue";
import OnsiteCheckout from "@/components/seller/OnsiteCheckout.vue";
import OrderHistoryManager from "@/components/seller/OrderHistoryManager.vue";
import UserManager from "@/components/seller/UserManager.vue";

export default {
  components: {
    ProductManager,
    OnsiteCheckout,
    OrderHistoryManager,
    UserManager,
  },
  data() {
    return {
      currentTab: "OnsiteCheckout",
    };
  },
};
</script>