<template>
  <div>
    <h3>ขายสินค้าหน้าร้าน</h3>
    <div class="row">
      <div class="col-md-7">
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">ค้นหาสินค้า</h5>
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                placeholder="ค้นหาด้วยชื่อหรือ ID สินค้า..."
                v-model="productSearchQuery"
                @keyup.enter="searchProducts"
              />
              <button
                class="btn btn-outline-primary"
                type="button"
                @click="searchProducts"
                :disabled="!productSearchQuery"
              >
                <span
                  v-if="isLoadingSearch"
                  class="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                ค้นหา
              </button>
            </div>
          </div>
        </div>

        <div v-if="searchResults.length > 0" class="card mb-3">
          <div class="card-header">ผลการค้นหา</div>
          <ul class="list-group list-group-flush">
            <li
              v-for="product in searchResults"
              :key="product.product_id"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{{ product.product_name }}</strong>
                <small class="d-block text-muted"
                  >ราคา: {{ product.product_price }} | คงเหลือ:
                  {{ product.stock }}</small
                >
              </div>
              <div class="d-flex align-items-center">
                <input
                  type="number"
                  class="form-control form-control-sm me-2"
                  style="width: 70px"
                  v-model.number="product.quantityToAdd"
                  min="1"
                  :max="product.stock"
                />
                <button
                  class="btn btn-sm btn-success"
                  @click="selectProductToAdd(product)"
                >
                  +
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div class="card">
          <div class="card-body">
            <h5 class="card-title">
              ตะกร้าสินค้าปัจจุบัน ({{ localCart.length }} รายการ)
            </h5>
            <ul v-if="localCart.length > 0" class="list-group">
              <li
                v-for="(item, index) in localCart"
                :key="item.product_id"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                {{ item.product_name }} (x{{ item.quantity }})
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="removeFromCart(index)"
                >
                  &times;
                </button>
              </li>
            </ul>
            <p v-else class="text-muted">ยังไม่มีสินค้าในตะกร้า</p>
          </div>
        </div>
      </div>

      <div class="col-md-5">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">ข้อมูลลูกค้า</h5>
            <div class="input-group mb-3">
              <input
                type="text"
                class="form-control"
                placeholder="ค้นหาลูกค้าด้วยเบอร์โทร/Username..."
                v-model="customerSearchQuery"
                @keyup.enter="searchForCustomer"
              />
              <button
                class="btn btn-outline-secondary"
                type="button"
                @click="searchForCustomer"
              >
                ค้นหา
              </button>
            </div>
            <div v-if="foundCustomer" class="alert alert-success">
              <p class="mb-0">
                <strong>ลูกค้า:</strong> {{ foundCustomer.username }}
              </p>
              <p class="mb-0">
                <strong>เบอร์โทร:</strong> {{ foundCustomer.phone }}
              </p>
            </div>
            <div v-else class="alert alert-info">
              <p class="mb-0">ทำรายการในฐานะ **ลูกค้าทั่วไป (Guest)**</p>
            </div>
            <hr />
            <button
              class="btn btn-success w-100"
              @click="completeCheckout"
              :disabled="localCart.length === 0"
            >
              ยืนยันการขายและ Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ApiService from "@/services/ApiService";

const GUEST_USER_ID = 10;

export default {
  data() {
    return {
      productSearchQuery: "",
      // --- แก้ไข/เพิ่มเติม data properties ---
      searchResults: [],
      isLoadingSearch: false,
      // ------------------------------------
      localCart: [],
      customerSearchQuery: "",
      foundCustomer: null,
    };
  },
  methods: {
    // --- ฟังก์ชันใหม่ สำหรับการค้นหา ---
    async searchProducts() {
      if (!this.productSearchQuery.trim()) return;
      this.isLoadingSearch = true;
      this.searchResults = [];
      try {
        const response = await ApiService.getProducts({
          search: this.productSearchQuery,
        });
        this.searchResults = response.data;
        if (response.data.length === 0) {
          alert("ไม่พบสินค้าที่ตรงกับการค้นหา");
        }
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการค้นหาสินค้า");
      } finally {
        this.isLoadingSearch = false;
      }
    },

    selectProductToAdd(productToAdd) {
      // อ่านค่าจำนวนจาก object product ที่ส่งมา ซึ่งผูกกับช่อง input
      const quantity = productToAdd.quantityToAdd;

      // เพิ่มการตรวจสอบเล็กน้อย
      if (!quantity || quantity < 1) {
        alert("กรุณาระบุจำนวนที่ถูกต้อง (อย่างน้อย 1 ชิ้น)");
        return;
      }
      if (quantity > productToAdd.stock) {
        alert("จำนวนสินค้าที่เลือกมีมากกว่าสต็อกคงเหลือ");
        return;
      }

      const existingItem = this.localCart.find(
        (item) => item.product_id === productToAdd.product_id
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.localCart.push({
          product_id: productToAdd.product_id,
          product_name: productToAdd.product_name,
          product_price: productToAdd.product_price,
          quantity: quantity, // ใช้ค่า quantity ที่อ่านมาได้
        });
      }
    },

    removeFromCart(index) {
      this.localCart.splice(index, 1);
    },
    async searchForCustomer() {
      if (!this.customerSearchQuery) {
        this.foundCustomer = null;
        return;
      }
      try {
        const response = await ApiService.findCustomer(
          this.customerSearchQuery
        );
        this.foundCustomer = response.data;
      } catch (error) {
        this.foundCustomer = null;
        alert("ไม่พบข้อมูลลูกค้า");
      }
    },
    async completeCheckout() {
      const targetUserId = this.foundCustomer
        ? this.foundCustomer.user_id
        : GUEST_USER_ID;
      const payload = {
        targetUserId: targetUserId,
        cartItems: this.localCart,
      };

      try {
        const response = await ApiService.sellerCheckout(payload);
        alert(`ขายสำเร็จ! Order ID: ${response.data.orderId}`);
        this.localCart = [];
        this.foundCustomer = null;
        this.customerSearchQuery = "";
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการ Checkout");
      }
    },
  },
};
</script>