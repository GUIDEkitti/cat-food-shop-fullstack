<!-- //components/seller/ProductManager.vue -->
<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>จัดการรายการสินค้า</h3>
      <button class="btn btn-primary" @click="openModal()">
        + เพิ่มสินค้าใหม่
      </button>
    </div>

    <table class="table table-striped table-hover align-middle">
      <thead>
        <tr>
          <th style="width: 10%">รูปภาพ</th>
          <th>ID</th>
          <th>ชื่อสินค้า</th>
          <th>ประเภท</th>
          <th>ราคา</th>
          <th>สต็อก</th>
          <th class="text-center">การกระทำ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.product_id">
          <td>
            <img
              v-if="product.imageDataUrl"
              :src="product.imageDataUrl"
              class="img-thumbnail"
              style="width: 70px; height: 70px; object-fit: cover"
            />
            <div v-else class="text-muted small">ไม่มีรูป</div>
          </td>
          <td>{{ product.product_id }}</td>
          <td>{{ product.product_name }}</td>
          <td>{{ product.product_type }}</td>
          <td>{{ product.product_price }}</td>
          <td>{{ product.stock }}</td>
          <td class="text-center">
            <button
              class="btn btn-sm btn-warning me-2"
              @click="openModal(product)"
            >
              แก้ไข
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click="deleteProduct(product.product_id)"
            >
              ลบ
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      class="modal fade"
      id="productModal"
      tabindex="-1"
      aria-labelledby="productModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="productModalLabel">{{ formTitle }}</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form>
              <div class="mb-3">
                <label for="productImage" class="form-label"
                  >รูปภาพสินค้า</label
                >
                <input
                  class="form-control"
                  type="file"
                  id="productImage"
                  @change="handleFileChange"
                  accept="image/png, image/jpeg"
                />
                <div v-if="imagePreviewUrl" class="mt-2 text-center">
                  <p class="mb-1"><small>ตัวอย่างรูปภาพ:</small></p>
                  <img
                    :src="imagePreviewUrl"
                    class="img-thumbnail"
                    style="max-width: 200px; max-height: 200px"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label for="productName" class="form-label">ชื่อสินค้า</label>
                <input
                  type="text"
                  class="form-control"
                  id="productName"
                  v-model="editableProduct.product_name"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="productType" class="form-label">ประเภท</label>
                <input
                  type="text"
                  class="form-control"
                  id="productType"
                  v-model="editableProduct.product_type"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="productPrice" class="form-label">ราคา</label>
                <input
                  type="number"
                  step="0.01"
                  class="form-control"
                  id="productPrice"
                  v-model.number="editableProduct.product_price"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="productStock" class="form-label">สต็อก</label>
                <input
                  type="number"
                  class="form-control"
                  id="productStock"
                  v-model.number="editableProduct.stock"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="productDescription" class="form-label"
                  >คำอธิบาย</label
                >
                <textarea
                  class="form-control"
                  id="productDescription"
                  rows="3"
                  v-model="editableProduct.description"
                ></textarea>
              </div>
              <div class="modal-footer border-top-0">
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="saveProduct"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ApiService from "@/services/ApiService";
import { Modal } from "bootstrap";

export default {
  data() {
    return {
      products: [],
      productModal: null,
      isEditMode: false,
      editableProduct: {}, // จะมี property 'productImageBase64' เพิ่มเข้ามา
      imagePreviewUrl: "",
      // ไม่ต้องมี selectedFile แล้ว
    };
  },
  computed: {
    formTitle() {
      return this.isEditMode ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่";
    },
  },
  methods: {
    async fetchProducts() {
      const response = await ApiService.getProducts();
      this.products = response.data;
    },

    // --- แก้ไขฟังก์ชันนี้ใหม่ทั้งหมด ---
    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) {
        // ลบรูปภาพ ถ้าผู้ใช้ยกเลิกการเลือก
        this.editableProduct.productImageBase64 = null;
        this.imagePreviewUrl = this.isEditMode
          ? this.editableProduct.imageDataUrl || ""
          : "";
        return;
      }
      // ใช้ FileReader เพื่อแปลงไฟล์เป็น Base64 Data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewUrl = e.target.result; // สำหรับแสดงตัวอย่าง
        this.editableProduct.productImageBase64 = e.target.result; // สำหรับส่งไป Backend
      };
      reader.readAsDataURL(file);
    },

    openModal(product = null) {
      const fileInput = document.getElementById("productImage");
      if (fileInput) fileInput.value = null;

      if (product) {
        // Edit Mode
        this.isEditMode = true;
        this.editableProduct = { ...product };
        this.imagePreviewUrl = product.imageDataUrl || "";
      } else {
        // Add Mode
        this.isEditMode = false;
        this.editableProduct = {
          product_name: "",
          product_type: "",
          product_price: 0,
          stock: 0,
          description: "",
          productImageBase64: null,
        };
        this.imagePreviewUrl = "";
      }
      this.productModal.show();
    },

    // --- แก้ไขฟังก์ชันนี้ใหม่ทั้งหมด ---
    async saveProduct() {
      // ไม่ต้องใช้ FormData แล้ว ส่งเป็น JSON object ธรรมดา
      const payload = { ...this.editableProduct };

      try {
        if (this.isEditMode) {
          await ApiService.updateProduct(payload.product_id, payload);
        } else {
          await ApiService.addProduct(payload);
        }
        this.productModal.hide();
        this.fetchProducts();
        alert("บันทึกข้อมูลสำเร็จ!");
      } catch (error) {
        alert(
          "เกิดข้อผิดพลาด: " + (error.response?.data?.message || error.message)
        );
      }
    },

    async deleteProduct(id) {
      if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) {
        try {
          await ApiService.deleteProduct(id);
          this.fetchProducts();
          alert("ลบสินค้าสำเร็จ");
        } catch (error) {
          alert("เกิดข้อผิดพลาดในการลบสินค้า");
        }
      }
    },
  },
  mounted() {
    this.productModal = new Modal(document.getElementById("productModal"));
    this.fetchProducts();
  },
  beforeUnmount() {
    if (this.productModal) this.productModal.dispose();
  },
};
</script>