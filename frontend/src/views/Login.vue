<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">เข้าสู่ระบบ</div>
          <div class="card-body">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="username"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary w-100">Login</button>
              <p v-if="error" class="text-danger mt-3">{{ error }}</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { username: "", password: "", error: null };
  },
  methods: {
    async handleLogin() {
      try {
        this.error = null;

        // 1. ทำการ Login (action นี้จะอัปเดตข้อมูล user และ role ใน store)
        await this.$store.dispatch("login", {
          username: this.username,
          password: this.password,
        });

        // 2. ดึง Role ของผู้ใช้จาก Vuex store ที่เพิ่งอัปเดตไป
        const userRole = this.$store.getters.userRole;

        // 3. ตรวจสอบ Role แล้วส่งไปหน้า Dashboard ที่เหมาะสม
        if (userRole === "admin") {
          this.$router.push("/admin/dashboard");
        } else if (userRole === "seller") {
          // ถ้าเป็น seller ให้ไปที่หน้า dashboard ของ seller
          this.$router.push("/seller/dashboard");
        } else {
          // ถ้าเป็น 'user' หรือ role อื่นๆ ให้ไปหน้าแรก
          this.$router.push("/");
        }
      } catch (err) {
        this.error =
          err.response?.data?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      }
    },
  },
};
</script>