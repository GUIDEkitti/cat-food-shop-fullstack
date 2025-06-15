<template>
  <div class="container mt-4">
    <div class="row mb-3">
      <div class="col-md-6">
        <input type="text" class="form-control" placeholder="ค้นหาด้วยชื่อหรือ ID สินค้า..." v-model="searchQuery" @input="fetchProducts">
      </div>
      <div class="col-md-3">
        <select class="form-select" v-model="selectedType" @change="fetchProducts">
          <option value="">ทุกประเภท</option>
          <option value="อาหาร">อาหาร</option>
          <option value="อุปกรณ์">อุปกรณ์</option>
          <option value="ของใช้">ของใช้</option>
        </select>
      </div>
    </div>

    <div class="row">
      <div class="col-12 col-md-6 col-lg-4 mb-4" v-for="product in products" :key="product.product_id">
        <ProductCard :product="product" />
      </div>
    </div>
  </div>
</template>

<script>
import ApiService from '@/services/ApiService';
import ProductCard from '@/components/ProductCard.vue';

export default {
  name: 'Home',
  components: {
    ProductCard
  },
  data() {
    return {
      products: [],
      searchQuery: '',
      selectedType: ''
    };
  },
  methods: {
    async fetchProducts() {
      try {
        const params = {};
        if (this.searchQuery) {
          params.search = this.searchQuery;
        }
        if (this.selectedType) {
          params.product_type = this.selectedType;
        }
        const response = await ApiService.getProducts(params);
        this.products = response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }
  },
  created() {
    this.fetchProducts();
  }
};
</script>