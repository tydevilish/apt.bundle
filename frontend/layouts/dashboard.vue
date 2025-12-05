<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- NAVBAR -->
    <nav
      class="w-full bg-gradient-to-br from-green-500 to-green-700 shadow-sm px-6 py-4 flex justify-between items-center"
    >
      <!-- LEFT TITLE -->
      <div class="hidden md:block">
        <h1 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="mdi mdi-access-point-network text-white text-2xl"></i>
          Smart Farm System
        </h1>
        <p class="text-gray-300 text-sm">ระบบบริหารจัดการฟาร์มอัจฉริยะ</p>
      </div>

      <!-- MOBILE MENU -->
      <button class="md:hidden text-white text-3xl" @click="toggleSidebar">
        <i class="mdi mdi-menu"></i>
      </button>

      <!-- USER PROFILE -->
      <div class="flex items-center gap-3 bg-white px-3 py-2 rounded-xl shadow">
        <img
          :src="avatarUrl"
          class="w-10 h-10 rounded-full object-cover border"
        />
        <div class="text-left hidden md:block">
          <p class="text-gray-700 font-semibold leading-4">
            {{ user?.username }}
          </p>
          <p class="text-gray-500 text-sm leading-4">{{ user?.email }}</p>
        </div>
      </div>
    </nav>

    <div class="flex flex-1">
      <!-- SIDEBAR -->
      <aside
        class="fixed md:static top-0 left-0 min-h-screen md:min-h-screen bg-white w-64 border-r shadow-xl md:shadow-sm flex flex-col z-20 transform transition-transform duration-300"
        :class="
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        "
      >
        <div class="py-6 px-4 mt-16 md:mt-0">
          <p class="text-gray-600 font-semibold text-sm mb-3">เมนูหลัก</p>

          <div class="space-y-2">
            <NuxtLink to="/dashboard" class="menu-item">
              <i class="mdi mdi-chart-line text-xl"></i> แดชบอร์ด
            </NuxtLink>

            <NuxtLink to="/devices" class="menu-item">
              <i class="mdi mdi-devices text-xl"></i>
              <p v-if="user?.role === 'user1' || user?.role === 'user2'">
                อุปกรณ์ของฉัน
              </p>
              <p v-else>จัดการอุปกรณ์</p>
            </NuxtLink>

            <NuxtLink
              v-if="user?.role === 'admin'"
              to="/users"
              class="menu-item"
            >
              <i class="mdi mdi-account-multiple text-xl"></i> จัดการผู้ใช้
            </NuxtLink>
          </div>

          <p class="text-gray-600 font-semibold text-sm mb-3 mt-3">
            เมนูของฉัน
          </p>

          <div class="space-y-2">
            <NuxtLink to="/profile" class="menu-item">
              <i class="mdi mdi-account-circle text-xl"></i> โปรไฟล์ของฉัน
            </NuxtLink>

            <!-- LOGOUT -->
            <NuxtLink
              class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 font-medium transition cursor-pointer"
            >
              <button @click="logout" class="text-red-600">
                <i class="mdi mdi-logout text-xl"></i> ออกจากระบบ
              </button>
            </NuxtLink>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>

    <Footer />
    <!-- OVERLAY (MOBILE) -->
    <div
      v-if="sidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black bg-opacity-40 md:hidden z-10"
    ></div>
  </div>
</template>

<script setup>
import { useUser } from "~/composables/useUser";
import { onMounted, ref, watch } from "vue";
import { useEventBus } from "~/composables/useEventBus";

const { user, fetchUser } = useUser();
await fetchUser();

const config = useRuntimeConfig();
const { on } = useEventBus();

const avatarUrl = ref("/default-avatar.png");

const updateAvatar = () => {
  const img = user.value?.profile_image;
  avatarUrl.value = img
    ? `${config.public.apiBase}/uploads/${img}?v=${Date.now()}`
    : "/default-avatar.png";
};

onMounted(updateAvatar);

watch(
  () => user.value?.profile_image,
  () => updateAvatar()
);

on("profile-updated", () => {
  fetchUser().then(() => updateAvatar());
});

const sidebarOpen = ref(false);
const toggleSidebar = () => (sidebarOpen.value = !sidebarOpen.value);

const logout = () => {
  localStorage.removeItem("token");
  navigateTo("/login");
};
</script>

<style scoped>
.menu-item {
  @apply flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 
         hover:bg-gray-100 font-medium transition cursor-pointer;
}
</style>
