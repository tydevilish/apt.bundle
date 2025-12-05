<template>
  <div class="space-y-6">
    <!-- Title -->
    <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
      <i
        class="mdi mdi-account-circle text-green-600 text-3xl animate-pulse"
      ></i>
      โปรไฟล์ของฉัน
    </h1>

    <!-- Profile Box -->
    <div
      class="bg-white shadow-lg rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 transition hover:shadow-xl duration-300"
    >
      <!-- PROFILE IMAGE -->
      <div class="flex flex-col items-center text-center">
        <div class="relative">
          <img
            :src="
              clientReady ? previewImage || imageUrl : '/default-avatar.png'
            "
            class="w-40 h-40 rounded-full object-cover border-4 border-gray-200 shadow-xl"
          />
          <div
            class="absolute inset-0 rounded-full bg-green-500/20 blur-xl -z-10"
          ></div>
        </div>

        <label
          class="mt-5 cursor-pointer bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <i class="mdi mdi-upload"></i> เปลี่ยนรูป
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="onImageChange"
          />
        </label>
      </div>

      <!-- FORM -->
      <div class="md:col-span-2 space-y-6">
        <!-- Backend Error -->
        <transition name="fade">
          <div
            v-if="serverError"
            class="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <i class="mdi mdi-close-circle-outline text-2xl"></i>
            <span>{{ serverError }}</span>
          </div>
        </transition>

        <!-- Username -->
        <div>
          <label class="input-label">ชื่อผู้ใช้</label>
          <div :class="['input-box', errors.username && 'border-red-400']">
            <i class="mdi mdi-account text-green-600 text-xl"></i>
            <input v-model="form.username" class="input-field" />
          </div>
          <transition name="fade">
            <p v-if="errors.username" class="error-text">
              <i class="mdi mdi-alert-circle"></i>
              {{ errors.username }}
            </p>
          </transition>
        </div>

        <!-- Email -->
        <div>
          <label class="input-label">อีเมล</label>
          <div :class="['input-box', errors.email && 'border-red-400']">
            <i class="mdi mdi-email text-green-600 text-xl"></i>
            <input v-model="form.email" class="input-field" />
          </div>
          <transition name="fade">
            <p v-if="errors.email" class="error-text">
              <i class="mdi mdi-alert-circle"></i>
              {{ errors.email }}
            </p>
          </transition>
        </div>

        <!-- Password -->
        <div>
          <label class="input-label">รหัสผ่านใหม่</label>
          <div :class="['input-box', errors.password && 'border-red-400']">
            <i class="mdi mdi-lock text-green-600 text-xl"></i>
            <input
              v-model="form.password"
              type="password"
              class="input-field"
              placeholder="ปล่อยว่างหากไม่ต้องการเปลี่ยน"
            />
          </div>
          <transition name="fade">
            <p v-if="errors.password" class="error-text">
              <i class="mdi mdi-alert-circle"></i>
              {{ errors.password }}
            </p>
          </transition>
        </div>

        <!-- Role -->
        <div>
          <label class="input-label">สิทธิ์ผู้ใช้</label>
          <div class="input-box bg-gray-100">
            <i class="mdi mdi-shield-account text-green-600 text-xl"></i>
            <input
              :value="user?.role"
              disabled
              class="input-field bg-gray-100"
            />
          </div>
        </div>

        <!-- SAVE BUTTON -->
        <button
          class="btn-green w-full hover:scale-[1.008] hover:shadow-xl"
          @click="updateProfile"
        >
          <i class="mdi mdi-content-save text-xl"></i>
          บันทึกข้อมูล
        </button>
      </div>
    </div>

    <!-- SUCCESS TOAST -->
    <transition name="toast">
      <div
        v-if="successToast"
        class="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50"
      >
        <i class="mdi mdi-check-circle text-2xl"></i>
        <span>อัปเดตโปรไฟล์สำเร็จ</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, computed, onMounted } from "vue";
import { useUser } from "~/composables/useUser";
import { useEventBus } from "~/composables/useEventBus";

const config = useRuntimeConfig();
const { user, fetchUser } = useUser();
const { emit } = useEventBus();

await fetchUser();

const clientReady = ref(false);
onMounted(() => (clientReady.value = true));

const errors = ref({});
const serverError = ref("");

const form = ref({
  username: user.value?.username,
  email: user.value?.email,
  password: "",
});

const validateForm = () => {
  errors.value = {};

  if (!form.value.username?.trim())
    errors.value.username = "กรุณากรอกชื่อผู้ใช้";

  if (!form.value.email) errors.value.email = "กรุณากรอกอีเมล";
  else if (!/^\S+@\S+\.\S+$/.test(form.value.email))
    errors.value.email = "รูปแบบอีเมลไม่ถูกต้อง";

  if (form.value.password && form.value.password.trim() === "")
    errors.value.password = "รหัสผ่านไม่ถูกต้อง";

  return Object.keys(errors.value).length === 0;
};

const imageUrl = computed(() =>
  user.value?.profile_image
    ? `${config.public.apiBase}/uploads/${
        user.value.profile_image
      }?v=${Date.now()}`
    : "/default-avatar.png"
);

const previewImage = ref(null);
const selectedImage = ref(null);

const successToast = ref(false);

const onImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  selectedImage.value = file;
  previewImage.value = URL.createObjectURL(file);
};

const updateProfile = async () => {
  serverError.value = "";

  // FE validate
  if (!validateForm()) return;

  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("username", form.value.username);
    formData.append("email", form.value.email);
    if (form.value.password) formData.append("password", form.value.password);
    if (selectedImage.value)
      formData.append("profile_image", selectedImage.value);

    await axios.put(`${config.public.apiBase}/profile`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    successToast.value = true;
    emit("profile-updated", Date.now());

    setTimeout(() => {
      successToast.value = false;
      fetchUser();
    }, 1200);
  } catch (err) {
    console.log(err);
    serverError.value = err.response?.data?.message || "เกิดข้อผิดพลาด";
  }
};

definePageMeta({ layout: "dashboard" });
</script>

<style scoped>
.input-label {
  @apply text-gray-700 font-medium text-sm;
}

.input-box {
  @apply flex items-center bg-white border rounded-xl px-4 mt-1 shadow-sm
         hover:shadow-md transition focus-within:border-green-500;
}

.input-field {
  @apply bg-transparent text-gray-800 w-full py-3 px-3 outline-none;
}

.btn-green {
  @apply py-3 bg-green-600 text-white font-semibold rounded-xl shadow-lg 
         flex items-center justify-center gap-2 transition;
}

.error-text {
  @apply text-red-500 text-sm mt-1 flex items-center gap-1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
