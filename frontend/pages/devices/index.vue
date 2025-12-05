<template>
  <div class="space-y-6">
    <transition name="toast">
      <div
        v-if="toastMessage"
        class="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 z-[999999]"
      >
        <i class="mdi mdi-check-circle text-2xl"></i>
        {{ toastMessage }}
      </div>
    </transition>

    <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
      <i class="mdi mdi-radio-tower text-green-600 text-3xl"></i>
      จัดการอุปกรณ์ (Devices)
    </h1>

    <div
      class="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row gap-3 md:items-center"
    >
      <input
        v-model="search"
        placeholder="ค้นหาอุปกรณ์..."
        class="input-field border"
      />

      <select v-model="filterSite" class="input-field border w-full md:w-40">
        <option value="all">ทุกไซต์</option>
        <option v-for="s in siteList" :key="s" :value="s">{{ s }}</option>
      </select>

      <button @click="openAddModal" class="btn-green ml-auto">
        <i class="mdi mdi-plus-circle text-xl"></i>
        เพิ่มอุปกรณ์
      </button>
    </div>

    <div class="bg-white shadow-md rounded-xl overflow-hidden">
      <table class="w-full hidden md:table">
        <thead class="bg-gradient-to-br from-green-500 to-green-700">
          <tr>
            <th class="th">ID</th>
            <th class="th">ชื่ออุปกรณ์</th>
            <th class="th">ไซต์</th>
            <th class="th" v-if="user?.role === 'admin'">เจ้าของ</th>
            <th class="th text-center">การจัดการ</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="d in paginatedDevices"
            :key="d.device_id"
            class="border-b hover:bg-gray-50"
          >
            <td class="td text-center">{{ d.device_id }}</td>
            <td class="td text-center">{{ d.device_name }}</td>
            <td class="td text-center">{{ d.device_site }}</td>
            <td class="td text-center" v-if="user?.role === 'admin'">
              <span>
                {{ d.user_id }}
              </span>
            </td>

            <td class="td text-center space-x-3">
              <button @click="viewDevice(d.device_id)" class="text-blue-600">
                ดูข้อมูล
              </button>
              <button @click="openEditModal(d)" class="text-green-600">
                แก้ไข
              </button>
              <button @click="confirmDelete(d)" class="text-red-600">ลบ</button>
            </td>
          </tr>

          <tr v-if="paginatedDevices.length === 0">
            <td colspan="5" class="py-20 text-center text-gray-500">
              <div class="flex flex-col items-center justify-center">
                <i class="mdi mdi-database-off text-6xl text-gray-300 mb-3"></i>
                <p class="text-lg font-medium">ไม่พบข้อมูลอุปกรณ์</p>
                <p class="text-sm text-gray-400 mt-1">
                  กรุณากดปุ่ม "เพิ่มอุปกรณ์" หรือลองเปลี่ยนคำค้นหา
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="md:hidden p-4 space-y-3">
        <div
          v-for="d in paginatedDevices"
          :key="d.device_id"
          class="border rounded-xl p-4 bg-gray-50 shadow-sm"
        >
          <p class="font-semibold text-lg">{{ d.device_name }}</p>
          <p class="text-gray-600 text-sm">ID: {{ d.device_id }}</p>
          <p class="mt-1 text-gray-700">ไซต์: {{ d.device_site }}</p>
          <p v-if="user?.role === 'admin'" class="text-gray-600">
            ผู้ใช้: {{ d.user_id }}
          </p>

          <div class="flex justify-end mt-3 gap-4">
            <button class="text-blue-600" @click="viewDevice(d.device_id)">
              ดูข้อมูล
            </button>
            <button class="text-green-600" @click="openEditModal(d)">
              แก้ไข
            </button>
            <button class="text-red-600" @click="confirmDelete(d)">ลบ</button>
          </div>
        </div>

        <div
          v-if="paginatedDevices.length === 0"
          class="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50"
        >
          <i class="mdi mdi-database-off text-5xl text-gray-300 mb-2"></i>
          <p class="text-gray-500">ไม่พบข้อมูลอุปกรณ์</p>
        </div>
      </div>
    </div>

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
        :disabled="currentPage >= totalPages"
        class="page-btn"
      >
        ถัดไป
      </button>
    </div>

    <teleport to="body">
      <div v-if="showAdd" class="modal-bg">
        <div class="modal-box">
          <h2 class="modal-title">เพิ่มอุปกรณ์</h2>

          <div class="input-wrapper" :class="errors.device_id && 'error'">
            <i class="mdi mdi-numeric input-icon"></i>
            <input
              v-model="addForm.device_id"
              class="input-field"
              placeholder="หมายเลขอุปกรณ์"
            />
          </div>
          <p v-if="errors.device_id" class="error-text">
            {{ errors.device_id }}
          </p>

          <div class="input-wrapper" :class="errors.device_name && 'error'">
            <i class="mdi mdi-radar input-icon"></i>
            <input
              v-model="addForm.device_name"
              class="input-field"
              placeholder="ชื่ออุปกรณ์"
            />
          </div>
          <p v-if="errors.device_name" class="error-text">
            {{ errors.device_name }}
          </p>

          <div class="input-wrapper" :class="errors.device_site && 'error'">
            <i class="mdi mdi-map-marker input-icon"></i>
            <input
              v-model="addForm.device_site"
              class="input-field"
              placeholder="ไซต์"
            />
          </div>

          <div
            v-if="user?.role === 'admin'"
            class="input-wrapper"
            :class="errors.user_id && 'error'"
          >
            <i class="mdi mdi-account input-icon"></i>
            <select v-model="addForm.user_id" class="input-field">
              <option value="">เลือกผู้ใช้</option>
              <option v-for="u in users" :key="u.user_id" :value="u.user_id">
                {{ u.username }} (ID: {{ u.user_id }})
              </option>
            </select>
          </div>

          <p v-if="errors.user_id" class="error-text">
            {{ errors.user_id }}
          </p>

          <p v-if="serverError" class="server-error">{{ serverError }}</p>

          <div class="modal-actions">
            <button @click="showAdd = false" class="btn-gray">ยกเลิก</button>
            <button @click="createDevice" class="btn-green">บันทึก</button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showEdit" class="modal-bg">
        <div class="modal-box">
          <h2 class="modal-title">แก้ไขอุปกรณ์</h2>

          <div class="input-wrapper">
            <i class="mdi mdi-numeric input-icon"></i>
            <input
              disabled
              v-model="editForm.device_id"
              class="input-field bg-gray-100"
            />
          </div>

          <div class="input-wrapper" :class="errors.device_name && 'error'">
            <i class="mdi mdi-radar input-icon"></i>
            <input v-model="editForm.device_name" class="input-field" />
          </div>

          <div class="input-wrapper" :class="errors.device_site && 'error'">
            <i class="mdi mdi-map-marker input-icon"></i>
            <input v-model="editForm.device_site" class="input-field" />
          </div>

          <div
            v-if="user?.role === 'admin'"
            class="input-wrapper"
            :class="errors.user_id && 'error'"
          >
            <i class="mdi mdi-account input-icon"></i>
            <select v-model="editForm.new_user_id" class="input-field">
              <option v-for="u in users" :key="u.user_id" :value="u.user_id">
                {{ u.username }} (ID: {{ u.user_id }})
              </option>
            </select>
          </div>

          <p v-if="errors.user_id" class="error-text">
            {{ errors.user_id }}
          </p>

          <p v-if="serverError" class="server-error">{{ serverError }}</p>

          <div class="modal-actions">
            <button @click="showEdit = false" class="btn-gray">ยกเลิก</button>
            <button @click="updateDevice" class="btn-green">บันทึก</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, computed, onMounted } from "vue";
const { user, fetchUser } = useUser();

definePageMeta({ layout: "dashboard" });

const config = useRuntimeConfig();
const devices = ref([]);
const users = ref([]);

const loadUsers = async () => {
  if (user.value.role !== "admin") return;
  const token = localStorage.getItem("token");
  const res = await axios.get(`${config.public.apiBase}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  users.value = res.data.data;
};

const loadDevices = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${config.public.apiBase}/devices`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  devices.value = res.data.data;
};

const viewDevice = (id) => navigateTo(`/devices/${id}`);

onMounted(async () => {
  await fetchUser();
  await loadUsers();
  await loadDevices();
});

/* -------------------------
   SEARCH & FILTER
--------------------------*/
const search = ref("");
const filterSite = ref("all");

const siteList = computed(() => {
  const list = devices.value.map((d) => d.device_site);
  return [...new Set(list)];
});

const perPage = ref(5);
const currentPage = ref(1);

const filteredDevices = computed(() =>
  devices.value.filter((d) => {
    const matchSearch =
      d.device_name.toLowerCase().includes(search.value.toLowerCase()) ||
      d.device_id.toString().includes(search.value);

    const matchSite =
      filterSite.value === "all" ? true : d.device_site === filterSite.value;

    return matchSearch && matchSite;
  })
);

const totalPages = computed(() =>
  Math.ceil(filteredDevices.value.length / perPage.value)
);

const paginatedDevices = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredDevices.value.slice(start, start + perPage.value);
});

const changePage = (p) => {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p;
};

/* -------------------------
   MODALS
--------------------------*/
const showAdd = ref(false);
const showEdit = ref(false);

const addForm = ref({
  device_id: "",
  device_name: "",
  device_site: "",
  user_id: "",
});

const editForm = ref({
  device_id: "",
  device_name: "",
  device_site: "",
  user_id: "",
});

const errors = ref({});
const serverError = ref("");
const toastMessage = ref("");

const showToast = (msg) => {
  toastMessage.value = msg;
  setTimeout(() => (toastMessage.value = ""), 1500);
};

/* -------------------------
   VALIDATIONS
--------------------------*/
const validateAdd = () => {
  errors.value = {};
  if (!addForm.value.device_id)
    errors.value.device_id = "กรุณากรอกหมายเลขอุปกรณ์";
  if (!addForm.value.device_name)
    errors.value.device_name = "กรุณากรอกชื่ออุปกรณ์";
  if (!addForm.value.device_site) errors.value.device_site = "กรุณากรอกไซต์";

  if (user.value.role === "admin" && !addForm.value.user_id)
    errors.value.user_id = "กรุณาเลือกเจ้าของอุปกรณ์";

  return Object.keys(errors.value).length === 0;
};

const validateEdit = () => {
  errors.value = {};
  if (!editForm.value.device_name)
    errors.value.device_name = "กรุณากรอกชื่ออุปกรณ์";
  if (!editForm.value.device_site) errors.value.device_site = "กรุณากรอกไซต์";
  return Object.keys(errors.value).length === 0;
};

/* -------------------------
   OPEN MODALS
--------------------------*/
const openAddModal = () => {
  addForm.value = {
    device_id: "",
    device_name: "",
    device_site: "",
    user_id: "",
  };
  errors.value = {};
  serverError.value = "";
  showAdd.value = true;
};

const openEditModal = (d) => {
  editForm.value = {
    device_id: d.device_id,
    device_name: d.device_name,
    device_site: d.device_site,
    new_user_id: d.user_id,
  };
  errors.value = {};
  serverError.value = "";
  showEdit.value = true;
};

/* -------------------------
   CREATE DEVICE
--------------------------*/
const createDevice = async () => {
  if (!validateAdd()) return;

  const token = localStorage.getItem("token");

  try {
    const payload = { ...addForm.value };

    // user ปกติ = ไม่ส่ง user_id
    if (user.value.role !== "admin") delete payload.user_id;

    await axios.post(`${config.public.apiBase}/devices`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    showAdd.value = false;
    showToast("เพิ่มอุปกรณ์สำเร็จ");
    await loadDevices();
  } catch (err) {
    serverError.value = err.response?.data?.message || "เกิดข้อผิดพลาด";
  }
};

/* -------------------------
   UPDATE DEVICE
--------------------------*/
const updateDevice = async () => {
  if (!validateEdit()) return;

  const token = localStorage.getItem("token");

  try {
    await axios.put(
      `${config.public.apiBase}/devices/${editForm.value.device_id}`,
      editForm.value,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    showEdit.value = false;
    showToast("แก้ไขอุปกรณ์สำเร็จ");
    await loadDevices();
  } catch (err) {
    serverError.value = err.response?.data?.message || "เกิดข้อผิดพลาด";
  }
};

/* -------------------------
   DELETE DEVICE
--------------------------*/
const confirmDelete = async (d) => {
  if (!confirm(`ต้องการลบอุปกรณ์ "${d.device_name}" หรือไม่?`)) return;

  const token = localStorage.getItem("token");

  await axios.delete(`${config.public.apiBase}/devices/${d.device_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  showToast("ลบอุปกรณ์สำเร็จ");
  await loadDevices();
};
</script>

<style scoped>
.th {
  @apply p-4 text-white;
}
.td {
  @apply p-4;
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
  @apply flex items-center rounded-xl px-4 py-2 mb-1 bg-white transition;
}
.input-wrapper.error {
  @apply border-red-400;
}
.input-icon {
  @apply text-green-600 text-xl mr-3;
}

.error-text {
  @apply text-red-600 text-sm mb-2;
}

.server-error {
  @apply text-red-600 text-sm mb-3;
}

.btn-green {
  @apply px-4 py-2 w-full bg-green-600 text-white rounded-xl font-medium shadow hover:scale-[1.01] transition flex items-center justify-center gap-2;
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
