<template>
  <div class="container mt-5">
    <h2>ตะกร้าสินค้าของคุณ</h2>
    <div v-if="cart.length > 0">
      <table class="table align-middle">
        <thead>
          <tr>
            <th style="width: 50%">สินค้า</th>
            <th class="text-center">ราคา</th>
            <th class="text-center" style="width: 15%">จำนวน</th>
            <th class="text-end">ราคารวม</th>
            <th class="text-center">ลบ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cart" :key="item.cart_id">
            <td>{{ item.product_name }}</td>
            <td class="text-center">{{ item.product_price }}</td>
            <td class="text-center">
              <input
                type="number"
                class="form-control form-control-sm text-center"
                :value="item.quantity"
                @change="updateQuantity(item.product_id, $event.target.value)"
                min="1"
              />
            </td>
            <td class="text-end">
              {{ (item.product_price * item.quantity).toFixed(2) }}
            </td>
            <td class="text-center">
              <button
                class="btn btn-danger btn-sm"
                @click="removeItem(item.product_id)"
              >
                &times;
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <hr />
      <h4 class="text-end">ยอดรวมทั้งหมด: {{ totalPrice.toFixed(2) }} บาท</h4>
      <div class="checkout-form mt-4">
        <h4>ข้อมูลการจัดส่ง</h4>
        <form @submit.prevent="handleCheckout">
          <div class="mb-3">
            <label for="address" class="form-label">ที่อยู่สำหรับจัดส่ง</label>
            <textarea
              class="form-control"
              id="address"
              rows="3"
              v-model="shipping_address"
              required
            ></textarea>
          </div>
          <button type="submit" class="btn btn-primary float-end">
            ยืนยันการสั่งซื้อ
          </button>
        </form>
      </div>
    </div>
    <div v-else>
      <p class="text-center">ตะกร้าของคุณว่างเปล่า</p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ApiService from "@/services/ApiService";

export default {
  data() {
    return { shipping_address: "" };
  },
  computed: {
    ...mapGetters(["cart"]),
    totalPrice() {
      return this.cart.reduce(
        (total, item) => total + item.product_price * item.quantity,
        0
      );
    },
  },
  methods: {
    ...mapActions(["fetchCart", "clearCart"]),

    async updateQuantity(productId, quantity) {
      try {
        const newQuantity = parseInt(quantity);
        if (isNaN(newQuantity) || newQuantity < 1) return;

        await ApiService.updateCartItem(productId, newQuantity);
        // เมื่อสำเร็จ ให้ดึงข้อมูลตะกร้าใหม่เพื่ออัปเดต UI
        this.fetchCart();
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการอัปเดตจำนวนสินค้า");
        console.error(error);
      }
    },

    async removeItem(productId) {
      if (confirm("คุณต้องการลบสินค้านี้ออกจากตะกร้าใช่หรือไม่?")) {
        try {
          await ApiService.removeCartItem(productId);
          // เมื่อสำเร็จ ให้ดึงข้อมูลตะกร้าใหม่เพื่ออัปเดต UI
          this.fetchCart();
        } catch (error) {
          alert("เกิดข้อผิดพลาดในการลบสินค้า");
          console.error(error);
        }
      }
    },

    async handleCheckout() {
      try {
        await ApiService.checkout({
          shipping_address: this.shipping_address,
          cartItems: this.cart,
        });
        alert("สั่งซื้อสินค้าสำเร็จ!");
        this.clearCart();
        this.$router.push("/history");
      } catch (error) {
        alert(
          "เกิดข้อผิดพลาด: " + (error.response?.data?.message || error.message)
        );
      }
    },
  },
  created() {
    this.fetchCart();
  },
};
</script>