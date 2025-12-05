<template>
  <div
    class="min-h-screen bg-gradient-to-b from-gray-200 to-gray-100 flex items-center justify-center px-4 relative"
  >
    <!-- SUCCESS TOAST -->
    <transition name="toast">
      <div
        v-if="loginSuccess"
        class="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50"
      >
        <i class="mdi mdi-check-circle text-2xl"></i>
        <span class="font-medium">เข้าสู่ระบบสำเร็จ</span>
      </div>
    </transition>

    <!-- Main Card -->
    <div
      class="w-full max-w-5xl bg-white shadow-xl rounded-3xl grid grid-cols-1 md:grid-cols-2 overflow-hidden transition transform hover:shadow-2xl duration-300"
    >
      <!-- Left: Login Form -->
      <div class="p-10 flex flex-col justify-center">
        <!-- Title -->
        <h2
          class="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2"
        >
          <i
            class="mdi mdi-lock-check-outline text-green-600 text-4xl animate-pulse"
          ></i>
          เข้าสู่ระบบ
        </h2>

        <p class="text-gray-500 mb-8">
          ระบบบริหารจัดการฟาร์มอัจฉริยะ สำหรับ IoT Device
        </p>

        <form @submit.prevent="submitLogin" class="space-y-6">
          <!-- Username / Email -->
          <div class="relative">
            <label class="text-gray-700 text-sm font-medium"
              >Username / Email</label
            >

            <div
              class="input-box"
              :class="errors.identifier ? 'border-red-400' : 'border-gray-300'"
            >
              <i class="mdi mdi-account text-green-600 text-xl"></i>
              <input
                v-model="form.identifier"
                type="text"
                class="input-field"
                placeholder="กรุณากรอกชื่อผู้ใช้หรืออีเมลของคุณ"
              />
            </div>

            <transition name="fade">
              <p v-if="errors.identifier" class="error-text">
                <i class="mdi mdi-alert-circle text-lg"></i>
                {{ errors.identifier }}
              </p>
            </transition>
          </div>

          <!-- Password -->
          <div class="relative">
            <label class="text-gray-700 text-sm font-medium">Password</label>

            <div
              class="input-box"
              :class="errors.password ? 'border-red-400' : 'border-gray-300'"
            >
              <i class="mdi mdi-lock text-green-600 text-xl"></i>
              <input
                v-model="form.password"
                type="password"
                class="input-field"
                placeholder="กรุณากรอกรหัสผ่านของคุณ"
              />
            </div>

            <transition name="fade">
              <p v-if="errors.password" class="error-text">
                <i class="mdi mdi-alert-circle text-lg"></i>
                {{ errors.password }}
              </p>
            </transition>
          </div>

          <!-- Backend Error Message -->
          <transition name="fade">
            <div
              v-if="serverError"
              class="flex items-center gap-3 bg-red-100 text-red-700 border border-red-300 px-4 py-3 rounded-xl"
            >
              <i class="mdi mdi-close-circle-outline text-2xl"></i>
              <span>{{ serverError }}</span>
            </div>
          </transition>

          <!-- Login Button -->
          <button
            type="submit"
            class="btn-green hover:shadow-xl hover:scale-[1.02]"
          >
            <i class="mdi mdi-login-variant text-xl"></i>
            เข้าสู่ระบบ
          </button>

          <!-- Go to Register -->
          <div class="text-center mt-4">
            <p class="text-gray-600 text-sm">
              ยังไม่มีบัญชีใช่ไหม?
              <span
                class="text-green-600 font-semibold cursor-pointer hover:underline flex items-center justify-center gap-1"
                @click="navigateTo('/register')"
              >
                ลงทะเบียน
                <i class="mdi mdi-arrow-right"></i>
              </span>
            </p>
          </div>
        </form>
      </div>

      <!-- Right Panel -->
      <div
        class="hidden md:flex items-center justify-center bg-gradient-to-br from-green-500 to-green-700 p-10 relative overflow-hidden"
      >
        <!-- Floating Circle -->
        <div
          class="absolute w-80 h-80 bg-green-300 opacity-30 blur-3xl rounded-full -top-16 -right-16 animate-float"
        ></div>

        <div class="relative text-center max-w-sm">
          <!-- Big Icon -->
          <div class="flex justify-center">
            <div
              class="p-6 bg-white shadow-xl rounded-2xl border border-gray-200 transform hover:scale-105 transition"
            >
              <i
                class="mdi mdi-access-point-network text-6xl text-green-600 animate-pulse"
              ></i>
            </div>
          </div>

          <h3 class="text-2xl font-bold text-white mt-6 mb-3">
            Smart Farm Monitering Platform
          </h3>

          <p class="text-white text-md leading-relaxed">
            ระบบแสดงผลข้อมูลเซนเซอร์ BME280 / BMP280
            แสดงผลแบบเรียลไทม์พร้อมระบบสิทธิ์ผู้ใช้ครบถ้วน
          </p>

          <div class="mt-8 card-mini">
            <i class="mdi mdi-monitor-dashboard text-5xl text-green-600"></i>
            <p class="text-gray-700 font-bold mt-3">Real-Time Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref } from "vue";

const config = useRuntimeConfig();

const form = ref({
  identifier: "",
  password: "",
});

const errors = ref({});
const serverError = ref("");
const loginSuccess = ref(false);

const validateForm = () => {
  errors.value = {};

  if (!form.value.identifier)
    errors.value.identifier = "กรุณากรอกชื่อผู้ใช้หรืออีเมล";
  if (!form.value.password) errors.value.password = "กรุณากรอกรหัสผ่าน";

  return Object.keys(errors.value).length === 0;
};

const submitLogin = async () => {
  serverError.value = "";

  if (!validateForm()) return;

  try {
    const payload = form.value.identifier.includes("@")
      ? { email: form.value.identifier, password: form.value.password }
      : { username: form.value.identifier, password: form.value.password };

    const { data } = await axios.post(
      `${config.public.apiBase}/auth/login`,
      payload
    );

    loginSuccess.value = true;

    localStorage.setItem("token", data.token);

    setTimeout(() => {
      navigateTo("/dashboard");
    }, 1000);
  } catch (err) {
    console.log(err);
    serverError.value = err.response?.data?.message;
  }
};
</script>

<style scoped>
.input-box {
  @apply flex items-center bg-white border rounded-xl px-4 mt-1 transition 
         focus-within:border-green-500;
}

.input-field {
  @apply bg-transparent text-gray-800 w-full py-3 px-3 outline-none placeholder-gray-400;
}

.btn-green {
  @apply w-full py-3 bg-green-600 text-white font-semibold rounded-xl shadow-lg 
         flex items-center justify-center gap-2 transition;
}

.error-text {
  @apply text-red-500 text-sm mt-1 flex items-center gap-1;
}

.card-mini {
  @apply bg-white backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg p-6 
         transform hover:scale-[1.03] transition;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0px);
  }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
