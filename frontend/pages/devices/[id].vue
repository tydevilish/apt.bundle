<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <i class="mdi mdi-cellphone-link text-green-600 text-3xl"></i>
        อุปกรณ์: {{ device?.device_name || "..." }}
      </h1>

      <button
        @click="loadDetail"
        class="px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 flex items-center gap-2"
      >
        <i class="mdi mdi-refresh"></i>
        รีเฟรช
      </button>
    </div>

    <div class="bg-white shadow-md rounded-2xl p-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-700 flex items-center gap-2">
          <i class="mdi mdi-information text-green-600 text-2xl"></i>
          ข้อมูลอุปกรณ์
        </h2>

        <span
          :class="[
            'px-3 py-1 rounded-xl text-sm font-semibold',
            deviceStatus === 'online'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700',
          ]"
        >
          <i
            :class="
              deviceStatus === 'online' ? 'mdi mdi-wifi' : 'mdi mdi-wifi-off'
            "
          ></i>
          {{ deviceStatus === "online" ? "ออนไลน์" : "ออฟไลน์" }}
        </span>
      </div>

      <div class="grid md:grid-cols-2 gap-4 mt-4">
        <p>
          <span class="font-medium text-gray-600">หมายเลขอุปกรณ์:</span>
          {{ device?.device_id }}
        </p>
        <p>
          <span class="font-medium text-gray-600">ชื่ออุปกรณ์:</span>
          {{ device?.device_name }}
        </p>
        <p>
          <span class="font-medium text-gray-600">สถานที่ติดตั้ง:</span>
          {{ device?.device_site }}
        </p>
        <p>
          <span class="font-medium text-gray-600">ลงทะเบียนเมื่อ:</span>
          {{ formatDate(device?.created_at) }}
        </p>
      </div>
    </div>

    <div
      class="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row gap-3 md:items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <label class="font-medium text-gray-600">ช่วงเวลา:</label>
        <select
          v-model="filterRange"
          class="border px-4 py-2 rounded-xl w-full md:w-56"
        >
          <option value="all">ทั้งหมด</option>
          <option value="today">วันนี้</option>
          <option value="24h">ย้อนหลัง 24 ชั่วโมง</option>
          <option value="7d">ย้อนหลัง 7 วัน</option>
        </select>
      </div>

      <div class="text-gray-500 text-sm">
        ทั้งหมด {{ filteredLogs.length }} รายการ
      </div>
    </div>

    <div class="bg-white shadow-md rounded-2xl overflow-hidden">
      <h2 class="text-lg font-bold text-gray-700 p-6 border-b">
        <i class="mdi mdi-history text-green-600 text-2xl"></i>
        ประวัติข้อมูลเซนเซอร์ (ล่าสุดขึ้นก่อน)
      </h2>

      <table class="w-full hidden md:table">
        <thead class="bg-gradient-to-br from-green-500 to-green-700 text-white">
          <tr>
            <th class="th">เวลา</th>
            <th class="th">อุณหภูมิ (°C)</th>
            <th class="th">ความชื้น (%)</th>
            <th class="th">ความดัน (hPa)</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="log in paginatedLogs"
            :key="log.log_id"
            class="border-b hover:bg-gray-50"
          >
            <td class="td">{{ formatDateTime(log.updated_at) }}</td>
            <td class="td text-center">{{ log.temp }}</td>
            <td class="td text-center">{{ log.humidity }}</td>
            <td class="td text-center">{{ log.pressure }}</td>
          </tr>
        </tbody>
      </table>

      <div class="md:hidden p-4 space-y-3">
        <div
          v-for="log in paginatedLogs"
          :key="log.log_id"
          class="rounded-xl border shadow p-4 bg-gray-50"
        >
          <p class="font-semibold text-gray-700">
            เวลา: {{ formatDateTime(log.updated_at) }}
          </p>
          <p>🌡 อุณหภูมิ: {{ log.temp }}°C</p>
          <p>💧 ความชื้น: {{ log.humidity }}%</p>
          <p>🎚 ความดัน: {{ log.pressure }} hPa</p>
        </div>
      </div>

      <div
        v-if="filteredLogs.length === 0"
        class="text-center py-6 text-gray-500"
      >
        ไม่พบข้อมูลเซนเซอร์ในช่วงเวลานี้
      </div>

      <div
        v-if="totalPages > 1"
        class="flex justify-center items-center gap-2 p-4 border-t bg-gray-50"
      >
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded-lg bg-white border hover:bg-gray-100 disabled:opacity-50"
        >
          <i class="mdi mdi-chevron-left"></i>
        </button>

        <span class="text-sm text-gray-600">
          หน้า {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded-lg bg-white border hover:bg-gray-100 disabled:opacity-50"
        >
          <i class="mdi mdi-chevron-right"></i>
        </button>
      </div>
    </div>

    <button
      @click="navigateTo('/devices')"
      class="px-4 py-2 bg-gray-300 rounded-xl shadow hover:bg-gray-400 mt-4 flex items-center gap-2"
    >
      <i class="mdi mdi-arrow-left"></i>
      กลับไปหน้าอุปกรณ์
    </button>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, onUnmounted, computed, watch } from "vue";

definePageMeta({ layout: "dashboard" });

const config = useRuntimeConfig();
const route = useRoute();

const device = ref(null);
const logs = ref([]);
const filterRange = ref("all");
const deviceStatus = ref("offline");

const currentPage = ref(1);
const itemsPerPage = 15;

let autoRefresh = null;

const loadDetail = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${config.public.apiBase}/devices/${route.params.id}/detail`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    device.value = res.data.device;
    logs.value = res.data.logs;

    checkDeviceStatus();
  } catch (err) {
    console.log(err);
  }
};

onMounted(() => {
  loadDetail();
  autoRefresh = setInterval(loadDetail, 5000);
});

onUnmounted(() => {
  clearInterval(autoRefresh);
});

const checkDeviceStatus = () => {
  if (!logs.value.length) {
    deviceStatus.value = "offline";
    return;
  }
  const last = new Date(logs.value[0].updated_at);
  const diff = (Date.now() - last.getTime()) / 1000;
  deviceStatus.value = diff <= 120 ? "online" : "offline";
};

const filteredLogs = computed(() => {
  const now = new Date();
  return logs.value.filter((log) => {
    const d = new Date(log.updated_at);
    if (filterRange.value === "today")
      return d.toDateString() === now.toDateString();
    if (filterRange.value === "24h") return now - d <= 24 * 60 * 60 * 1000;
    if (filterRange.value === "7d") return now - d <= 7 * 24 * 60 * 60 * 1000;
    return true;
  });
});

watch(filterRange, () => {
  currentPage.value = 1;
});

const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / itemsPerPage);
});

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredLogs.value.slice(start, end);
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const formatDate = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("th-TH");
};

const formatDateTime = (d) => {
  return new Date(d).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.th {
  @apply p-4 text-white font-semibold;
}
.td {
  @apply p-4 text-center;
}
</style>
