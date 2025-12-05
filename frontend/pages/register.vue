<template>
  <div
    class="min-h-screen bg-gradient-to-b from-gray-200 to-gray-100 flex items-center justify-center px-4 relative"
  >
    <!-- SUCCESS TOAST -->
    <transition name="toast">
      <div
        v-if="registerSuccess"
        class="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50"
      >
        <i class="mdi mdi-check-circle text-2xl"></i>
        <span class="font-medium">สมัครสมาชิกสำเร็จ</span>
      </div>
    </transition>

    <!-- Main Card -->
    <div
      class="w-full max-w-5xl bg-white shadow-xl rounded-3xl grid grid-cols-1 md:grid-cols-2 overflow-hidden transition transform hover:shadow-2xl duration-300"
    >
      <!-- Left: Register Form -->
      <div class="p-10 flex flex-col justify-center">
        <!-- Title -->
        <h2
          class="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2"
        >
          <i
            class="mdi mdi-account-plus-outline text-green-600 text-4xl animate-pulse"
          ></i>
          สมัครสมาชิก
        </h2>

        <p class="text-gray-500 mb-8">
          ลงทะเบียนเพื่อใช้งานระบบ Smart Farm Monitering Platform
        </p>

        <form @submit.prevent="submitRegister" class="space-y-6">
          <!-- Username -->
          <div class="relative">
            <label class="text-gray-700 text-sm font-medium">ชื่อผู้ใช้</label>

            <div
              class="input-box"
              :class="errors.username ? 'border-red-400' : 'border-gray-300'"
            >
              <i class="mdi mdi-account text-green-600 text-xl"></i>
              <input
                v-model="form.username"
                type="text"
                class="input-field"
                placeholder="ตั้งชื่อผู้ใช้ของคุณ"
              />
            </div>

            <transition name="fade">
              <p v-if="errors.username" class="error-text">
                <i class="mdi mdi-alert-circle text-lg"></i>
                {{ errors.username }}
              </p>
            </transition>
          </div>

          <!-- Email -->
          <div class="relative">
            <label class="text-gray-700 text-sm font-medium">อีเมล</label>

            <div
              class="input-box"
              :class="errors.email ? 'border-red-400' : 'border-gray-300'"
            >
              <i class="mdi mdi-email text-green-600 text-xl"></i>
              <input
                v-model="form.email"
                type="email"
                class="input-field"
                placeholder="กรอกอีเมลของคุณ"
              />
            </div>

            <transition name="fade">
              <p v-if="errors.email" class="error-text">
                <i class="mdi mdi-alert-circle text-lg"></i>
                {{ errors.email }}
              </p>
            </transition>
          </div>

          <!-- Password -->
          <div class="relative">
            <label class="text-gray-700 text-sm font-medium">รหัสผ่าน</label>

            <div
              class="input-box"
              :class="errors.password ? 'border-red-400' : 'border-gray-300'"
            >
              <i class="mdi mdi-lock text-green-600 text-xl"></i>
              <input
                v-model="form.password"
                type="password"
                class="input-field"
                placeholder="ตั้งรหัสผ่านของคุณ"
              />
            </div>

            <transition name="fade">
              <p v-if="errors.password" class="error-text">
                <i class="mdi mdi-alert-circle text-lg"></i>
                {{ errors.password }}
              </p>
            </transition>
          </div>

          <!-- Backend Error -->
          <transition name="fade">
            <div
              v-if="serverError"
              class="flex items-center gap-3 bg-red-100 text-red-700 border border-red-300 px-4 py-3 rounded-xl"
            >
              <i class="mdi mdi-close-circle-outline text-2xl"></i>
              <span>{{ serverError }}</span>
            </div>
          </transition>

          <!-- Register Button -->
          <button
            type="submit"
            class="btn-green hover:shadow-xl hover:scale-[1.02]"
          >
            <i class="mdi mdi-account-plus text-xl"></i>
            สมัครสมาชิก
          </button>

          <!-- Go to Login -->
          <div class="text-center mt-4">
            <p class="text-gray-600 text-sm">
              มีบัญชีอยู่แล้ว?
              <span
                class="text-green-600 font-semibold cursor-pointer hover:underline flex items-center justify-center gap-1"
                @click="navigateTo('/login')"
              >
                เข้าสู่ระบบ
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
        <div
          class="absolute w-80 h-80 bg-green-300 opacity-30 blur-3xl rounded-full -top-16 -right-16 animate-float"
        ></div>

        <div class="relative text-center max-w-sm">
          <div class="flex justify-center">
            <div
              class="p-6 bg-white shadow-xl rounded-2xl border border-gray-200 transform hover:scale-105 transition"
            >
              <i
                class="mdi mdi-shield-account text-6xl text-green-600 animate-pulse"
              ></i>
            </div>
          </div>

          <h3 class="text-2xl font-bold text-white mt-6 mb-3">
            ระบบผู้ใช้งานที่ปลอดภัย
          </h3>

          <p class="text-white text-md leading-relaxed">
            ผู้ใช้ใหม่จะได้รับสิทธิ์ระดับพื้นฐาน (user2)
            เพื่อให้ระบบปลอดภัยและจัดการง่ายขึ้น
          </p>

          <div class="mt-8 card-mini">
            <i class="mdi mdi-account-group text-5xl text-green-600"></i>
            <p class="text-gray-700 font-bold mt-3">Join ours Community</p>
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
  username: "",
  email: "",
  password: "",
});

const errors = ref({});
const serverError = ref("");
const registerSuccess = ref(false);

const validateForm = () => {
  errors.value = {};

  if (!form.value.username) errors.value.username = "กรุณากรอกชื่อผู้ใช้";

  if (!form.value.email) errors.value.email = "กรุณากรอกอีเมลของคุณ";

  if (!form.value.password) errors.value.password = "กรุณากรอกรหัสผ่าน";

  return Object.keys(errors.value).length === 0;
};

const submitRegister = async () => {
  serverError.value = "";

  if (!validateForm()) return;

  try {
    await axios.post(`${config.public.apiBase}/auth/register`, form.value);

    registerSuccess.value = true;

    setTimeout(() => {
      navigateTo("/login");
    }, 1000);
  } catch (err) {
    console.log(err);
    serverError.value = err.response?.data?.message || "เกิดข้อผิดพลาด";
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
