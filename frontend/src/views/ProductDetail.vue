<template>
  <div class="container mt-5" v-if="product">
    <div class="row">
      <div class="col-md-6">
        <img
          v-if="product.imageDataUrl"
          :src="product.imageDataUrl"
          class="img-fluid rounded"
          :alt="product.product_name"
        />
        <div
          v-else
          class="img-placeholder bg-secondary text-white d-flex align-items-center justify-content-center"
        >
          No Image Available
        </div>
      </div>
      <div class="col-md-6">
        <h2>{{ product.product_name }}</h2>
        <p class="text-muted">ประเภท: {{ product.product_type }}</p>
        <p>{{ product.description }}</p>
        <h4>ราคา: {{ product.product_price }} บาท</h4>
        <p>คงเหลือในสต็อก: {{ product.stock }}</p>
        <hr />
        <div class="d-flex align-items-center">
          <input
            type="number"
            class="form-control me-3"
            style="width: 100px"
            v-model.number="quantity"
            min="1"
            :max="product.stock"
          />
          <button
            class="btn btn-success"
            @click="addToCart"
            :disabled="!isLoggedIn || product.stock === 0"
          >
            {{ isLoggedIn ? "หยิบใส่ตะกร้า" : "กรุณาเข้าสู่ระบบก่อน" }}
          </button>
        </div>
        <div v-if="!isLoggedIn" class="mt-3">
          <router-link to="/login" class="btn btn-primary"
            >เข้าสู่ระบบ</router-link
          >
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center mt-5">
    <p>Loading...</p>
  </div>
</template>

<script>
import ApiService from "@/services/ApiService";
import { mapGetters, mapActions } from "vuex";
export default {
  props: ["id"],
  data() {
    return { product: null, quantity: 1 };
  },
  computed: {
    ...mapGetters(["isLoggedIn"]),
  },
  methods: {
    ...mapActions(["fetchCart"]),
    async addToCart() {
      if (!this.isLoggedIn) {
        this.$router.push("/login");
        return;
      }
      try {
        await ApiService.addToCart({
          productId: this.product.product_id,
          quantity: this.quantity,
        });
        alert("เพิ่มสินค้าลงตะกร้าสำเร็จ!");
        this.fetchCart(); // อัปเดตข้อมูลตะกร้าใน navbar
      } catch (error) {
        alert(
          "เกิดข้อผิดพลาด: " + (error.response?.data?.message || error.message)
        );
      }
    },
  },
  async created() {
    try {
      const response = await ApiService.getProduct(this.id);
      this.product = response.data;
    } catch (error) {
      console.error(error);
    }
  },
};
</script>
<style scoped>
.img-placeholder {
  width: 100%;
  height: 400px;
  font-size: 1.5rem;
}
</style>