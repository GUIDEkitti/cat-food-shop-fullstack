<template>
  <div class="container mt-5">
    <h2>ประวัติการสั่งซื้อ</h2>
    <div v-if="Object.keys(groupedHistory).length > 0">
      <!-- วนลูปแสดงผลแต่ละ Order เป็น Card -->
      <div
        v-for="order in groupedHistory"
        :key="order.orderId"
        class="card mb-4"
      >
        <!-- ส่วนหัวของ Card แสดง ID และ วันที่ -->
        <div class="card-header d-flex justify-content-between">
          <strong>Order ID: {{ order.orderId }}</strong>
          <span>วันที่: {{ new Date(order.date).toLocaleString() }}</span>
        </div>

        <!-- ส่วนเนื้อหาของ Card แสดงรายการสินค้า -->
        <div class="card-body">
          <ul class="list-group list-group-flush">
            <li
              v-for="item in order.items"
              :key="item.product_id"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>{{ item.product_name }}</span>
              <span class="badge bg-secondary rounded-pill"
                >จำนวน: {{ item.quantity }} x ราคา: {{ item.price }}</span
              >
            </li>
          </ul>
        </div>

        <!-- ส่วนท้ายของ Card แสดงที่อยู่สำหรับจัดส่ง -->
        <div class="card-footer text-muted">
          <strong>ที่อยู่สำหรับจัดส่ง:</strong> {{ order.address }}
        </div>
      </div>
    </div>
    <div v-else>
      <p class="text-center">ยังไม่มีประวัติการสั่งซื้อ</p>
    </div>
  </div>
</template>

<script>
import ApiService from "@/services/ApiService";
import { groupBy } from "lodash";

export default {
  data() {
    return {
      history: [],
    };
  },
  computed: {
    groupedHistory() {
      if (!this.history.length) return {};

      const grouped = groupBy(this.history, "order_id");

      return Object.keys(grouped).reduce((acc, orderId) => {
        const items = grouped[orderId];
        acc[orderId] = {
          orderId: orderId,
          date: items[0].order_date,
          // --- ส่วนที่แก้ไข: เพิ่ม address เข้าไปใน object ที่จัดกลุ่มแล้ว ---
          address: items[0].shipping_address,
          // --------------------------------------------------------
          items: items,
        };
        return acc;
      }, {});
    },
  },
  async created() {
    try {
      const response = await ApiService.getPurchaseHistory();
      this.history = response.data;
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      alert("ไม่สามารถโหลดประวัติการซื้อได้");
    }
  },
};
</script>