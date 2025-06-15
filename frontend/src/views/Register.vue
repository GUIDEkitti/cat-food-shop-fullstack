<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">สมัครสมาชิก</div>
          <div class="card-body">
            <div
              v-if="message"
              class="alert"
              :class="
                messageType === 'success' ? 'alert-success' : 'alert-danger'
              "
            >
              {{ message }}
            </div>

            <form>
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': usernameError }"
                  id="username"
                  v-model="form.username"
                  @blur="checkAvailability('username')"
                  required
                />
                <div v-if="usernameError" class="invalid-feedback">
                  {{ usernameError }}
                </div>
              </div>

              <div class="mb-3">
                <label for="phone" class="form-label">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  class="form-control"
                  :class="{ 'is-invalid': phoneError }"
                  id="phone"
                  v-model="form.phone"
                  @input="formatPhone"
                  @blur="checkAvailability('phone')"
                  required
                />
                <div v-if="phoneError" class="invalid-feedback">
                  {{ phoneError }}
                </div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="form.password"
                  required
                />
              </div>

              <button
                type="button"
                class="btn btn-primary w-100"
                @click="handleRegister"
              >
                ลงทะเบียน
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ApiService from "@/services/ApiService";

export default {
  data() {
    return {
      form: { username: "", phone: "", password: "" },
      message: "",
      messageType: "",
      usernameError: "",
      phoneError: "",
    };
  },
  methods: {
    formatPhone() {
      this.form.phone = this.form.phone.replace(/\D/g, "");
    },

    async checkAvailability(field) {
      const value = this.form[field].trim();
      const errorProperty = `${field}Error`;
      this[errorProperty] = "";
      if (!value) return;
      try {
        const response = await ApiService.checkAvailability(field, value);
        if (!response.data.available) {
          this[errorProperty] = `${
            field === "username" ? "Username" : "เบอร์โทรศัพท์"
          }นี้มีผู้ใช้งานแล้ว`;
        }
      } catch (error) {
        console.error(`Error checking ${field}`, error);
        this[errorProperty] = "ไม่สามารถตรวจสอบข้อมูลได้ในขณะนี้";
      }
    },

    async handleRegister() {
      this.message = "";
      this.messageType = "";

      // ถึงแม้ปุ่มจะกดได้เสมอ แต่เรายังมีการตรวจสอบภายในฟังก์ชันนี้อยู่ ซึ่งปลอดภัยครับ
      if (this.usernameError || this.phoneError) {
        this.message = "กรุณาแก้ไขข้อมูลที่ยังไม่ถูกต้อง";
        this.messageType = "error";
        return;
      }
      if (!this.form.username || !this.form.phone || !this.form.password) {
        this.message = "กรุณากรอกข้อมูลให้ครบทุกช่อง";
        this.messageType = "error";
        return;
      }

      try {
        const response = await ApiService.register(this.form);
        this.message = response.data.message;
        this.messageType = "success";
        this.form.username = "";
        this.form.phone = "";
        this.form.password = "";
        setTimeout(() => {
          this.$router.push("/login");
        }, 3000);
      } catch (error) {
        this.message =
          error.response?.data?.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก";
        this.messageType = "error";
      }
    },
  },
};
</script>