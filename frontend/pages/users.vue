<script setup>
import axios from "axios";
import { ref, computed, onMounted } from "vue";
const { user, fetchUser } = useUser();

definePageMeta({ layout: "dashboard" });

const config = useRuntimeConfig();
const users = ref([]);

const loadUsers = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${config.public.apiBase}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  users.value = res.data.data;
};

onMounted(() => {
  fetchUser();
  loadUsers();
});

const search = ref("");
const filterRole = ref("all");
const perPage = ref(5);
const currentPage = ref(1);

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.value.toLowerCase()) ||
      u.email.toLowerCase().includes(search.value.toLowerCase());

    const matchRole =
      filterRole.value === "all" ? true : u.role === filterRole.value;

    return matchSearch && matchRole;
  });
});

const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / perPage.value)
);

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredUsers.value.slice(start, start + perPage.value);
});

const changePage = (p) => {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p;
};

const showAdd = ref(false);
const showEdit = ref(false);
const editUser = ref(null);

const addForm = ref({
  username: "",
  email: "",
  password: "",
  role: "user2",
});

const editForm = ref({
  username: "",
  email: "",
  password: "",
  role: "",
});

const errors = ref({});
const serverError = ref("");
const toastMessage = ref("");

const showToast = (msg) => {
  toastMessage.value = msg;
  setTimeout(() => (toastMessage.value = ""), 1600);
};

const validateAdd = () => {
  errors.value = {};

  if (!addForm.value.username) errors.value.username = "กรุณากรอกชื่อผู้ใช้";
  else if (addForm.value.username.length < 3)
    errors.value.username = "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร";

  if (!addForm.value.email) errors.value.email = "กรุณากรอกอีเมล";
  else if (!/\S+@\S+\.\S+/.test(addForm.value.email))
    errors.value.email = "รูปแบบอีเมลไม่ถูกต้อง";

  if (!addForm.value.password) errors.value.password = "กรุณากรอกรหัสผ่าน";
  else if (addForm.value.password.length < 4)
    errors.value.password = "รหัสผ่านต้องมีอย่างน้อย 4 ตัว";

  return Object.keys(errors.value).length === 0;
};

const validateEdit = () => {
  errors.value = {};

  if (!editForm.value.username) errors.value.username = "กรุณากรอกชื่อผู้ใช้";

  if (!editForm.value.email) errors.value.email = "กรุณากรอกอีเมล";
  else if (!/\S+@\S+\.\S+/.test(editForm.value.email))
    errors.value.email = "รูปแบบอีเมลไม่ถูกต้อง";

  return Object.keys(errors.value).length === 0;
};

const openAddModal = () => {
  addForm.value = { username: "", email: "", password: "", role: "user2" };
  errors.value = {};
  serverError.value = "";
  showAdd.value = true;
};

const openEditModal = (u) => {
  editUser.value = u;
  editForm.value = {
    username: u.username,
    email: u.email,
    password: "",
    role: u.role,
  };
  errors.value = {};
  serverError.value = "";
  showEdit.value = true;
};

const createUser = async () => {
  if (!validateAdd()) return;

  const token = localStorage.getItem("token");
  try {
    await axios.post(`${config.public.apiBase}/users`, addForm.value, {
      headers: { Authorization: `Bearer ${token}` },
    });
    showAdd.value = false;
    showToast("เพิ่มผู้ใช้สำเร็จ");
    loadUsers();
  } catch (err) {
    console.log(err);
    serverError.value = err.response?.data?.message || "เกิดข้อผิดพลาด";
  }
};

const updateUser = async () => {
  if (!validateEdit()) return;

  const token = localStorage.getItem("token");
  try {
    await axios.put(
      `${config.public.apiBase}/users/${editUser.value.user_id}`,
      editForm.value,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    showEdit.value = false;
    showToast("แก้ไขข้อมูลสำเร็จ");
    loadUsers();
  } catch (err) {
    console.log(err);
    serverError.value = err.response?.data?.message || "เกิดข้อผิดพลาด";
  }
};

const confirmDelete = async (u) => {
  if (!confirm(`ต้องการลบ "${u.username}" หรือไม่?`)) return;

  const token = localStorage.getItem("token");

  await axios.delete(`${config.public.apiBase}/users/${u.user_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  showToast("ลบผู้ใช้สำเร็จ");
  loadUsers();
};

const getAvatar = (u) =>
  u.profile_image
    ? `${config.public.apiBase}/uploads/${u.profile_image}`
    : "/default-avatar.png";
</script>

<template>
  <div class="space-y-6">
    <!-- TOAST -->
    <transition name="toast">
      <div
        v-if="toastMessage"
        class="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 z-[999999]"
      >
        <i class="mdi mdi-check-circle text-2xl"></i>
        {{ toastMessage }}
      </div>
    </transition>

    <!-- TITLE -->
    <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
      <i class="mdi mdi-account-cog text-green-600 text-3xl"></i>
      จัดการผู้ใช้
    </h1>

    <!-- SEARCH / FILTER -->
    <div
      class="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row gap-3 md:items-center"
    >
      <input
        v-model="search"
        placeholder="ค้นหาผู้ใช้..."
        class="input-field border"
      />

      <select v-model="filterRole" class="input-field border w-full md:w-40">
        <option value="all">ทั้งหมด</option>
        <option value="admin">admin</option>
        <option value="user1">user1</option>
        <option value="user2">user2</option>
      </select>

      <button @click="openAddModal" class="btn-green ml-auto">
        <i class="mdi mdi-account-plus text-xl"></i>
        เพิ่มผู้ใช้
      </button>
    </div>

    <!-- USERS TABLE -->
    <div class="bg-white shadow-md rounded-xl overflow-hidden">
      <table class="w-full hidden md:table">
        <thead class="bg-gradient-to-br from-green-500 to-green-700">
          <tr>
            <th class="th">ผู้ใช้</th>
            <th class="th">อีเมล</th>
            <th class="th">สิทธิ์</th>
            <th class="th text-center">การจัดการ</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="u in paginatedUsers"
            :key="u.user_id"
            class="border-b hover:bg-gray-50"
          >
            <td class="td flex items-center justify-center gap-3">
              <img :src="getAvatar(u)" class="avatar" />
              {{ u.username }}
            </td>

            <td class="td text-center">{{ u.email }}</td>

            <td class="td text-center">
              <span class="role-badge">{{ u.role }}</span>
            </td>

            <td class="td text-center">
              <template v-if="u.user_id !== user?.user_id">
                <button @click="openEditModal(u)" class="text-green-600 mr-3">
                  แก้ไข
                </button>
                <button @click="confirmDelete(u)" class="text-red-600">
                  ลบ
                </button>
              </template>

              <span v-else class="text-gray-400">(บัญชีของคุณ)</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- MOBILE CARD -->
      <div class="md:hidden p-4 space-y-3">
        <div
          v-for="u in paginatedUsers"
          :key="u.user_id"
          class="border rounded-xl p-4 bg-gray-50 shadow-sm"
        >
          <div class="flex items-center gap-3">
            <img :src="getAvatar(u)" class="avatar-lg" />
            <div>
              <p class="font-semibold">{{ u.username }}</p>
              <p class="text-sm text-gray-500">{{ u.email }}</p>
            </div>
          </div>

          <p class="mt-2">
            <span class="role-badge">{{ u.role }}</span>
          </p>

          <div class="flex justify-end mt-3">
            <template v-if="u.user_id !== user?.user_id">
              <button @click="openEditModal(u)" class="text-green-600 mr-4">
                แก้ไข
              </button>
              <button @click="confirmDelete(u)" class="text-red-600">ลบ</button>
            </template>

            <span v-else class="text-gray-400 text-sm">(บัญชีของคุณ)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="flex justify-center gap-2 mt-6">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="page-btn"
      >
        ก่อนหน้า
      </button>

      <button
        v-for="n in totalPages"
        :key="n"
        @click="changePage(n)"
        :class="['page-btn', n === currentPage ? 'page-active' : '']"
      >
        {{ n }}
      </button>

      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        ถัดไป
      </button>
    </div>

    <!-- ADD MODAL -->
    <teleport to="body">
      <div v-if="showAdd" class="modal-bg">
        <div class="modal-box">
          <h2 class="modal-title">เพิ่มผู้ใช้</h2>

          <!-- Username -->
          <div class="input-wrapper" :class="errors.username && 'error'">
            <i class="mdi mdi-account input-icon"></i>
            <input
              v-model="addForm.username"
              class="input-field"
              placeholder="ชื่อผู้ใช้"
            />
          </div>
          <p v-if="errors.username" class="error-text">{{ errors.username }}</p>

          <!-- Email -->
          <div class="input-wrapper" :class="errors.email && 'error'">
            <i class="mdi mdi-email input-icon"></i>
            <input
              v-model="addForm.email"
              class="input-field"
              placeholder="อีเมล"
            />
          </div>
          <p v-if="errors.email" class="error-text">{{ errors.email }}</p>

          <!-- Password -->
          <div class="input-wrapper" :class="errors.password && 'error'">
            <i class="mdi mdi-lock input-icon"></i>
            <input
              v-model="addForm.password"
              type="password"
              class="input-field"
              placeholder="รหัสผ่าน"
            />
          </div>
          <p v-if="errors.password" class="error-text">{{ errors.password }}</p>

          <!-- Role -->
          <div class="input-wrapper">
            <i class="mdi mdi-shield-account input-icon"></i>
            <select v-model="addForm.role" class="input-field">
              <option value="admin">admin</option>
              <option value="user1">user1</option>
              <option value="user2">user2</option>
            </select>
          </div>

          <!-- Server Error -->
          <p v-if="serverError" class="server-error">{{ serverError }}</p>

          <div class="modal-actions">
            <button @click="showAdd = false" class="btn-gray">ยกเลิก</button>
            <button @click="createUser" class="btn-green">บันทึก</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- EDIT MODAL -->
    <teleport to="body">
      <div v-if="showEdit" class="modal-bg">
        <div class="modal-box">
          <h2 class="modal-title">แก้ไขผู้ใช้</h2>

          <!-- Username -->
          <div class="input-wrapper" :class="errors.username && 'error'">
            <i class="mdi mdi-account input-icon"></i>
            <input v-model="editForm.username" class="input-field" />
          </div>
          <p v-if="errors.username" class="error-text">{{ errors.username }}</p>

          <!-- Email -->
          <div class="input-wrapper" :class="errors.email && 'error'">
            <i class="mdi mdi-email input-icon"></i>
            <input v-model="editForm.email" class="input-field" />
          </div>
          <p v-if="errors.email" class="error-text">{{ errors.email }}</p>

          <!-- Password -->
          <div class="input-wrapper">
            <i class="mdi mdi-lock input-icon"></i>
            <input
              v-model="editForm.password"
              type="password"
              class="input-field"
              placeholder="รหัสผ่านใหม่ (ไม่บังคับ)"
            />
          </div>

          <!-- Role -->
          <div class="input-wrapper">
            <i class="mdi mdi-shield-account input-icon"></i>
            <select v-model="editForm.role" class="input-field">
              <option value="admin">admin</option>
              <option value="user1">user1</option>
              <option value="user2">user2</option>
            </select>
          </div>

          <p v-if="serverError" class="server-error">{{ serverError }}</p>

          <div class="modal-actions">
            <button @click="showEdit = false" class="btn-gray">ยกเลิก</button>
            <button @click="updateUser" class="btn-green">
              บันทึกการแก้ไข
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.th {
  @apply p-4 text-white;
}
.td {
  @apply p-4;
}
.avatar {
  @apply w-10 h-10 rounded-full border object-cover;
}
.avatar-lg {
  @apply w-12 h-12 rounded-full border object-cover;
}

.role-badge {
  @apply px-3 py-1 bg-gray-100 rounded-xl text-gray-800 text-sm;
}

.page-btn {
  @apply px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition disabled:opacity-40;
}
.page-active {
  @apply bg-green-600 text-white;
}

.input-field {
  @apply w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-green-600 transition bg-white;
}

.input-wrapper {
  @apply flex items-center rounded-xl px-4 py-2 mb-1 bg-white 
         focus-within:border-green-600 transition;
}
.error {
  @apply border-red-400 !important;
}
.input-icon {
  @apply text-green-600 text-xl mr-3;
}

.error-text {
  @apply text-red-600 text-sm mb-2 flex items-center gap-1;
}

.server-error {
  @apply text-red-600 text-sm mb-3;
}

.btn-green {
  @apply px-4 py-2 w-full bg-green-600 text-white rounded-xl font-medium shadow hover:scale-[1.008] transition flex items-center justify-center gap-2;
}

.btn-gray {
  @apply px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300;
}

.modal-bg {
  @apply fixed inset-0 bg-black/50 flex justify-center items-center z-[999999];
}
.modal-box {
  @apply bg-white w-full max-w-md mx-5 p-6 rounded-2xl shadow-2xl;
}
.modal-title {
  @apply text-xl font-bold mb-4 text-gray-800;
}
.modal-actions {
  @apply flex justify-end gap-3 mt-6;
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
</style>
