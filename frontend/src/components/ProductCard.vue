<template>
  <div class="card h-100 shadow-sm">
    <img
      v-if="product.imageDataUrl"
      :src="product.imageDataUrl"
      class="card-img-top"
      :alt="product.product_name"
      style="height: 200px; object-fit: cover"
    />
    <div
      v-else
      class="card-img-top d-flex align-items-center justify-content-center bg-light text-secondary"
      style="height: 200px"
    >
      <span>No Image</span>
    </div>

    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ product.product_name }}</h5>
      <p class="card-text">ราคา: {{ product.product_price }} บาท</p>

      <router-link
        :to="'/product/' + product.product_id"
        class="btn btn-outline-primary mt-auto"
      >
        ดูรายละเอียด
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProductCard",
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
};
</script>