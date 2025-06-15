<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>จัดการผู้ใช้ทั้งหมด</h3>
      <button class="btn btn-success" @click="openModal()">
        + เพิ่มผู้ใช้ใหม่
      </button>
    </div>
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>เบอร์โทร</th>
          <th class="text-center">Role</th>
          <th class="text-center">สถานะ</th>
          <th class="text-center">การกระทำ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.user_id">
          <td>{{ user.user_id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.phone }}</td>
          <td class="text-center">
            <span class="badge" :class="getRoleBadge(user.role_name)">{{
              user.role_name
            }}</span>
          </td>
          <td class="text-center">
            <span v-if="user.approved" class="badge bg-success"
              >อนุมัติแล้ว</span
            >
            <span v-else class="badge bg-warning text-dark">รออนุมัติ</span>
          </td>
          <td class="text-center">
            <template v-if="currentUser.id !== user.user_id">
              <button
                class="btn btn-sm btn-secondary me-2"
                @click="openModal(user)"
              >
                แก้ไข
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click="deleteUser(user.user_id)"
              >
                ลบ
              </button>
            </template>
            <span v-else class="text-muted fst-italic">-- บัญชีของคุณ --</span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="modal fade" id="adminUserModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ formTitle }}</h5>
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
              <div class="mb-3" v-if="!isEditMode">
                <label class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  v-model="editableUser.password"
                  :required="!isEditMode"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Role</label>
                <select
                  class="form-select"
                  v-model="editableUser.role_id"
                  required
                >
                  <option value="1">user</option>
                  <option value="2">seller</option>
                  <option value="3">admin</option>
                </select>
              </div>
              <div class="form-check mb-3">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="editableUser.approved"
                  id="approvedCheck"
                />
                <label class="form-check-label" for="approvedCheck">
                  อนุมัติแล้ว
                </label>
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
import { mapGetters } from "vuex";
import { Modal } from "bootstrap";

export default {
  data() {
    return {
      users: [],
      userModal: null,
      isEditMode: false,
      editableUser: {},
    };
  },
  computed: {
    ...mapGetters({ currentUser: "user" }), // ดึงข้อมูล user ที่ login อยู่มาใช้
    formTitle() {
      return this.isEditMode ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่";
    },
  },
  methods: {
    async fetchAllUsers() {
      const response = await ApiService.getAllUsers();
      this.users = response.data;
    },
    openModal(user = null) {
      if (user) {
        // Edit Mode
        this.isEditMode = true;
        this.editableUser = { ...user, password: "" }; // Copy user data
      } else {
        // Add Mode
        this.isEditMode = false;
        this.editableUser = {
          username: "",
          phone: "",
          password: "",
          role_id: 1,
          approved: true,
        };
      }
      this.userModal.show();
    },
    async saveUser() {
      try {
        if (this.isEditMode) {
          await ApiService.updateUserByAdmin(
            this.editableUser.user_id,
            this.editableUser
          );
        } else {
          await ApiService.addUserByAdmin(this.editableUser);
        }
        this.userModal.hide();
        this.fetchAllUsers();
        alert("บันทึกข้อมูลสำเร็จ!");
      } catch (error) {
        alert(
          "เกิดข้อผิดพลาด: " + (error.response?.data?.message || error.message)
        );
      }
    },
    async deleteUser(userId) {
      if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ User ID: ${userId}?`)) {
        try {
          await ApiService.deleteUserByAdmin(userId);
          this.fetchAllUsers();
          alert("ลบผู้ใช้สำเร็จ");
        } catch (error) {
          alert(
            "เกิดข้อผิดพลาดในการลบ: " +
              (error.response?.data?.message || error.message)
          );
        }
      }
    },
    getRoleBadge(roleName) {
      if (roleName === "admin") return "bg-danger";
      if (roleName === "seller") return "bg-primary";
      return "bg-secondary";
    },
  },
  mounted() {
    this.userModal = new Modal(document.getElementById("adminUserModal"));
    this.fetchAllUsers();
  },
  beforeUnmount() {
    if (this.userModal) this.userModal.dispose();
  },
};
</script>