<template>
  <div>
    <h3>ประวัติการขายทั้งหมด</h3>
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">กรองข้อมูล</h5>
        <div class="row g-3">
          <div class="col-md-5">
            <label for="userSelect" class="form-label">เลือกลูกค้า</label>
            <select
              id="userSelect"
              class="form-select"
              v-model="filters.userId"
            >
              <option value="">-- ลูกค้าทั้งหมด --</option>
              <option
                v-for="customer in customers"
                :key="customer.user_id"
                :value="customer.user_id"
              >
                {{ customer.username }} (ID: {{ customer.user_id }})
              </option>
            </select>
          </div>

          <div class="col-md-5">
            <label for="productSelect" class="form-label">เลือกสินค้า</label>
            <select
              id="productSelect"
              class="form-select"
              v-model="filters.productId"
            >
              <option value="">-- สินค้าทั้งหมด --</option>
              <option
                v-for="product in allProducts"
                :key="product.product_id"
                :value="product.product_id"
              >
                {{ product.product_name }} (ID: {{ product.product_id }})
              </option>
            </select>
          </div>

          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-secondary w-100" @click="clearFilters">
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="groupedOrders && Object.keys(groupedOrders).length > 0">
      <div
        v-for="order in groupedOrders"
        :key="order.orderId"
        class="card mb-3"
      >
        <div class="card-header d-flex justify-content-between">
          <span
            ><strong>Order ID: {{ order.orderId }}</strong> | ลูกค้า:
            {{ order.username }} (ID: {{ order.userId }})</span
          >
          <span>วันที่: {{ new Date(order.date).toLocaleString() }}</span>
        </div>
        <div class="card-body">
          <ul class="list-group list-group-flush">
            <li
              v-for="item in order.items"
              :key="item.product_id"
              class="list-group-item d-flex justify-content-between"
            >
              <span>{{ item.product_name }}</span>
              <span class="badge bg-info rounded-pill"
                >จำนวน: {{ item.quantity }} x ราคา: {{ item.price }}</span
              >
            </li>
          </ul>
        </div>
        <div class="card-footer text-muted">
          <strong>ที่อยู่สำหรับจัดส่ง:</strong> {{ order.address }}
        </div>
      </div>
    </div>
    <div v-else>
      <p class="text-center">ไม่พบข้อมูลการสั่งซื้อ (ตามตัวกรองที่เลือก)</p>
    </div>
  </div>
</template>

<script>
import ApiService from "@/services/ApiService";
import { groupBy } from "lodash";

export default {
  data() {
    return {
      allOrders: [],
      customers: [],
      allProducts: [],
      filters: {
        userId: "",
        productId: "",
      },
      // ลบ userSearchText และ productSearchText ออกไป
    };
  },
  computed: {
    // แก้ไข filteredOrders ให้ทำงานกับ filters โดยตรง
    filteredOrders() {
      let orders = this.allOrders;

      if (this.filters.userId) {
        orders = orders.filter(
          (order) => order.user_id === this.filters.userId
        );
      }

      if (this.filters.productId) {
        const relevantOrderIds = orders
          .filter((order) => order.product_id === this.filters.productId)
          .map((order) => order.order_id);
        orders = orders.filter((order) =>
          relevantOrderIds.includes(order.order_id)
        );
      }

      return orders;
    },

    groupedOrders() {
      if (!this.filteredOrders || this.filteredOrders.length === 0) return {};
      const grouped = groupBy(this.filteredOrders, "order_id");
      return Object.keys(grouped).reduce((acc, orderId) => {
        const items = grouped[orderId];
        acc[orderId] = {
          orderId: orderId,
          date: items[0].order_date,
          address: items[0].shipping_address,
          userId: items[0].user_id,
          username: items[0].username,
          items: items,
        };
        return acc;
      }, {});
    },
    // ลบ computed ของ filteredCustomers และ filteredProducts ออกไป
  },
  methods: {
    async fetchInitialData() {
      try {
        // ดึงข้อมูลครั้งเดียวตอนเปิดหน้า
        const [ordersRes, customersRes, productsRes] = await Promise.all([
          ApiService.getSellerOrders(),
          ApiService.getSellerCustomers(),
          ApiService.getProducts(),
        ]);
        this.allOrders = ordersRes.data;
        this.customers = customersRes.data;
        this.allProducts = productsRes.data;
      } catch (error) {
        alert("ไม่สามารถโหลดข้อมูลเริ่มต้นสำหรับหน้าประวัติการขายได้");
        console.error(error);
      }
    },
    clearFilters() {
      this.filters.userId = "";
      this.filters.productId = "";
      // ไม่ต้องเรียก API ใหม่ เพราะการกรองเกิดขึ้นที่ Frontend
    },
    // ไม่ต้องมี applyFilters อีกต่อไป เพราะ computed property ทำงานอัตโนมัติ
  },
  created() {
    this.fetchInitialData();
  },
};
</script>