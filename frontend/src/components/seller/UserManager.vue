<template>
  <div>
    <h3>จัดการสมาชิก (ลูกค้า)</h3>
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>เบอร์โทร</th>
          <th>วันที่สมัคร</th>
          <th class="text-center">สถานะ</th>
          <th class="text-center">การกระทำ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.user_id">
          <td>{{ user.user_id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.phone }}</td>
          <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
          <td class="text-center">
            <span v-if="user.approved" class="badge bg-success"
              >อนุมัติแล้ว</span
            >
            <span v-else class="badge bg-warning text-dark">รออนุมัติ</span>
          </td>
          <td class="text-center">
            <button
              v-if="!user.approved"
              class="btn btn-sm btn-info me-2"
              @click="approve(user.user_id)"
            >
              อนุมัติ
            </button>
            <button
              v-else
              class="btn btn-sm btn-secondary me-2"
              @click="openEditModal(user)"
            >
              แก้ไข
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click="deleteUser(user.user_id)"
            >
              ลบ
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="modal fade" id="userModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">แก้ไขข้อมูลลูกค้า</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="mb-3">
                <label class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="editableUser.username"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">เบอร์โทร</label>
                <input
                  type="tel"
                  class="form-control"
                  v-model="editableUser.phone"
                  required
                />
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  ปิด
                </button>
                <button type="submit" class="btn btn-primary">บันทึก</button>
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
      users: [],
      userModal: null,
      editableUser: {
        user_id: null,
        username: "",
        phone: "",
      },
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await ApiService.getManageableUsers();
        this.users = response.data;
      } catch (error) {
        alert("ไม่สามารถโหลดข้อมูลสมาชิกได้");
      }
    },
    async approve(userId) {
      try {
        await ApiService.approveUser(userId);
        alert("อนุมัติผู้ใช้สำเร็จ");
        this.fetchUsers();
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการอนุมัติ");
      }
    },
    openEditModal(user) {
      this.editableUser = Object.assign({}, user);
      this.userModal.show();
    },
    async saveUser() {
      try {
        await ApiService.updateUserBySeller(
          this.editableUser.user_id,
          this.editableUser
        );
        this.userModal.hide();
        this.fetchUsers();
        alert("แก้ไขข้อมูลสำเร็จ");
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
      }
    },
    async deleteUser(userId) {
      if (
        confirm(
          "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้? การกระทำนี้อาจไม่สำเร็จหากผู้ใช้มีประวัติการสั่งซื้ออยู่"
        )
      ) {
        try {
          await ApiService.deleteUserBySeller(userId);
          this.fetchUsers();
          alert("ลบผู้ใช้สำเร็จ");
        } catch (error) {
          alert(
            "เกิดข้อผิดพลาดในการลบ: " +
              (error.response?.data?.message || error.message)
          );
        }
      }
    },
  },
  mounted() {
    this.userModal = new Modal(document.getElementById("userModal"));
    this.fetchUsers();
  },
  beforeUnmount() {
    if (this.userModal) this.userModal.dispose();
  },
};
</script>