<template>
  <div class="space-y-6 font-thai bg-gray-50/50 min-h-screen p-4 rounded-xl">
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2"
    >
      <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span class="bg-green-100 text-green-600 px-3 py-2 rounded-lg">
          <i class="mdi mdi-chart-bubble text-2xl"></i>
        </span>
        แดชบอร์ด
      </h1>
      <div
        v-if="mode !== 'loading'"
        class="text-xs text-gray-400 font-mono bg-white px-3 py-1 rounded-full border"
      >
        Last updated: {{ new Date().toLocaleTimeString("th-TH") }}
      </div>
    </div>

    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-20 text-gray-400 animate-pulse"
    >
      <i class="mdi mdi-loading mdi-spin text-5xl mb-4"></i>
      <span class="text-lg">กำลังประมวลผลข้อมูล...</span>
    </div>

    <div
      v-if="mode === 'user2'"
      class="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-xl shadow-sm"
    >
      <h3 class="text-lg font-bold text-amber-800 flex items-center gap-2">
        <i class="mdi mdi-alert-circle-outline text-2xl"></i>
        ไม่พบอุปกรณ์
      </h3>
      <p class="text-amber-700 mt-1">
        กรุณาเพิ่มอุปกรณ์ใหม่ในเมนู "จัดการอุปกรณ์" เพื่อเริ่มแสดงผล
      </p>
    </div>

    <div v-if="mode === 'admin'" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card group">
          <div
            class="icon-bg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"
          >
            <i class="mdi mdi-account-group text-2xl"></i>
          </div>
          <div>
            <p class="label">ผู้ใช้งานทั้งหมด</p>
            <h2 class="value">{{ adminData.users }}</h2>
          </div>
        </div>
        <div class="stat-card group">
          <div
            class="icon-bg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors"
          >
            <i class="mdi mdi-cpu-64-bit text-2xl"></i>
          </div>
          <div>
            <p class="label">อุปกรณ์ในระบบ</p>
            <h2 class="value">{{ adminData.devices }}</h2>
          </div>
        </div>
        <div class="stat-card group">
          <div
            class="icon-bg bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors"
          >
            <i class="mdi mdi-database text-2xl"></i>
          </div>
          <div>
            <p class="label">Logs ทั้งหมด</p>
            <h2 class="value">{{ adminData.logs }}</h2>
          </div>
        </div>
        <div class="stat-card group">
          <div
            class="icon-bg bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors"
          >
            <i class="mdi mdi-access-point-network text-2xl"></i>
          </div>
          <div>
            <p class="label">สถานะ Online</p>
            <h2 class="value">
              {{ adminData.online }}
              <span class="text-gray-400 text-sm"
                >/ {{ adminData.offline }}</span
              >
            </h2>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="graph-card col-span-1 lg:col-span-2">
          <div class="graph-header">
            <h3>
              <i class="mdi mdi-chart-line mr-2 text-blue-500"></i>ภาพรวมระบบ
              (System Logs)
            </h3>
          </div>
          <div class="canvas-wrapper">
            <canvas ref="adminLineCanvas"></canvas>
          </div>
        </div>

        <div class="graph-card">
          <div class="graph-header">
            <h3>
              <i class="mdi mdi-chart-pie mr-2 text-emerald-500"></i
              >สถานะอุปกรณ์
            </h3>
          </div>
          <div class="canvas-wrapper">
            <canvas ref="adminPieCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div v-if="mode === 'user'" class="space-y-6">
      <div
        class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="bg-gray-100 p-2 rounded-lg text-gray-500">
            <i class="mdi mdi-devices"></i>
          </div>
          <select
            v-model="selectedDeviceId"
            class="device-select w-full sm:w-64"
          >
            <option
              v-for="d in userData.devices"
              :key="d.device_id"
              :value="d.device_id"
            >
              {{ d.device_name }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500 hidden sm:block">สถานะ:</span>
          <span class="status-badge" :class="deviceStatusClass">
            <span
              class="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"
            ></span>
            {{ deviceStatusText }}
          </span>
        </div>
      </div>

      <div
        v-if="!hasLogs"
        class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center"
      >
        <i
          class="mdi mdi-chart-timeline-variant-shimmer text-4xl text-gray-300 mb-2"
        ></i>
        <h3 class="text-gray-500 font-medium">ยังไม่มีข้อมูล Logs</h3>
        <p class="text-gray-400 text-sm mt-1">รอรับค่าจากเซนเซอร์...</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="graph-card">
          <div class="graph-header">
            <div>
              <h3>อุณหภูมิ</h3>
              <p class="text-xs text-gray-400">Temperature (°C)</p>
            </div>
            <span class="text-2xl font-bold text-rose-500"
              >{{ lastTemp }}°</span
            >
          </div>
          <div class="canvas-wrapper">
            <canvas ref="uTempCanvas"></canvas>
          </div>
        </div>

        <div class="graph-card">
          <div class="graph-header">
            <div>
              <h3>ความชื้น</h3>
              <p class="text-xs text-gray-400">Humidity (%RH)</p>
            </div>
            <span class="text-2xl font-bold text-sky-500">{{ lastHum }}%</span>
          </div>
          <div class="canvas-wrapper">
            <canvas ref="uHumCanvas"></canvas>
          </div>
        </div>

        <div class="graph-card">
          <div class="graph-header">
            <div>
              <h3>ความดันบรรยากาศ</h3>
              <p class="text-xs text-gray-400">Pressure (hPa)</p>
            </div>
            <span class="text-xl font-bold text-indigo-500">{{
              lastPres
            }}</span>
          </div>
          <div class="canvas-wrapper">
            <canvas ref="uPresCanvas"></canvas>
          </div>
        </div>

        <div class="graph-card">
          <div class="graph-header">
            <h3>สถิติค่าเฉลี่ย</h3>
          </div>
          <div class="canvas-wrapper">
            <canvas ref="uDonutCanvas"></canvas>
          </div>
        </div>

        <div class="graph-card">
          <div class="graph-header">
            <h3>วิเคราะห์เซนเซอร์</h3>
          </div>
          <div class="canvas-wrapper">
            <canvas ref="uRadarCanvas"></canvas>
          </div>
        </div>

        <div class="graph-card relative overflow-hidden">
          <div class="absolute top-0 right-0 p-2 opacity-10">
            <i class="mdi mdi-heart-pulse text-6xl text-green-500"></i>
          </div>
          <div class="graph-header">
            <h3>สุขภาพอุปกรณ์</h3>
            <p class="text-xs text-gray-400">Device Health Score</p>
          </div>
          <div class="canvas-wrapper">
            <canvas ref="uGaugeCanvas"></canvas>
          </div>
          <p class="text-center text-xs text-gray-400 mt-[-10px] pb-2">
            คำนวณจากความเสถียรของสัญญาณ
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useUser } from "~/composables/useUser";

definePageMeta({ layout: "dashboard" });

const { user, fetchUser } = useUser();
await fetchUser();
const config = useRuntimeConfig();

const loading = ref(true);
const mode = ref("loading");
const adminData = ref({});
const userData = ref(null);
const selectedDeviceId = ref(null);

const adminLineCanvas = ref(null);
const adminPieCanvas = ref(null);
const uTempCanvas = ref(null);
const uHumCanvas = ref(null);
const uPresCanvas = ref(null);
const uDonutCanvas = ref(null);
const uRadarCanvas = ref(null);
const uGaugeCanvas = ref(null);

const loadDashboard = async () => {
  try {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    if (user.value.role === "admin") {
      const res = await axios.get(`${config.public.apiBase}/dashboard/admin`, {
        headers,
      });
      adminData.value = res.data;
      mode.value = "admin";
      await nextTick();
      drawAdminGraphs();
    } else {
      const res = await axios.get(`${config.public.apiBase}/dashboard/user`, {
        headers,
      });
      if (!res.data.hasDevices) {
        mode.value = "user2";
        return;
      }
      userData.value = res.data;
      if (!selectedDeviceId.value) {
        selectedDeviceId.value = res.data.devices[0]?.device_id || null;
      }
      mode.value = "user";
      await nextTick();
      drawUserGraphs();
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDashboard();
  setInterval(() => {
    if (mode.value !== "loading") loadDashboard();
  }, 10000);
  window.addEventListener("resize", () => {
    if (mode.value === "admin") drawAdminGraphs();
    if (mode.value === "user") drawUserGraphs();
  });
});

const selectedDevice = computed(() =>
  userData.value?.devices.find((d) => d.device_id === selectedDeviceId.value)
);
const hasLogs = computed(
  () => selectedDevice.value?.logs && selectedDevice.value.logs.length > 0
);
const deviceStatusClass = computed(() =>
  selectedDevice.value?.status === "online"
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-red-100 text-red-700 border-red-200"
);
const deviceStatusText = computed(() =>
  selectedDevice.value?.status === "online" ? "Online" : "Offline"
);

const lastTemp = computed(() =>
  hasLogs.value ? selectedDevice.value.logs.at(-1).temp : 0
);
const lastHum = computed(() =>
  hasLogs.value ? selectedDevice.value.logs.at(-1).humidity : 0
);
const lastPres = computed(() =>
  hasLogs.value ? selectedDevice.value.logs.at(-1).pressure : 0
);

const setupCanvas = (canvas) => {
  if (!canvas) return null;
  const parent = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const rect = parent.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return { ctx, w: rect.width, h: rect.height };
};

const drawModernGrid = (ctx, w, h, minV, maxV, labelsX = []) => {
  const padTop = 20;
  const padBot = 30;
  const padLeft = 35;
  const padRight = 20;

  const chartH = h - padTop - padBot;
  const chartW = w - padLeft - padRight;

  ctx.strokeStyle = "#F1F5F9";
  ctx.lineWidth = 1;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#94A3B8";
  ctx.font = "10px sans-serif";

  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const y = padTop + (chartH / steps) * i;
    const val = maxV - ((maxV - minV) / steps) * i;

    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(w - padRight, y);
    ctx.stroke();

    ctx.fillText(Math.round(val), padLeft - 8, y);
  }

  ctx.strokeStyle = "#CBD5E1";
  ctx.beginPath();
  ctx.moveTo(padLeft, h - padBot);
  ctx.lineTo(w - padRight, h - padBot);
  ctx.stroke();

  return { padTop, padBot, padLeft, padRight, chartW, chartH };
};

const drawTooltip = (ctx, x, y, value, color) => {
  const text = `${value}`;
  const tw = ctx.measureText(text).width + 16;
  const th = 24;
  const r = 4;

  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  const bx = x - tw / 2;
  const by = y - th - 10;

  ctx.beginPath();
  ctx.roundRect(bx, by, tw, th, r);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#1E293B";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, by + th / 2);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 4, by + th);
  ctx.lineTo(x + 4, by + th);
  ctx.lineTo(x, by + th + 4);
  ctx.fill();
};

const drawSmoothLine = (canvas, values, colorHex, label) => {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, w, h } = setup;

  const minV = Math.min(...values) * 0.9 || 0;
  const maxV = Math.max(...values) * 1.1 || 10;

  const { padTop, padLeft, chartW, chartH } = drawModernGrid(
    ctx,
    w,
    h,
    minV,
    maxV
  );

  const stepX = chartW / (values.length - 1 || 1);
  const getY = (v) => padTop + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const grad = ctx.createLinearGradient(0, padTop, 0, h);
  grad.addColorStop(0, colorHex + "66");
  grad.addColorStop(1, colorHex + "05");

  ctx.beginPath();
  values.forEach((v, i) => {
    const x = padLeft + i * stepX;
    const y = getY(v);
    if (i === 0) ctx.moveTo(x, y);
    else {
      const px = padLeft + (i - 1) * stepX;
      const py = getY(values[i - 1]);
      const cx = (px + x) / 2;
      ctx.bezierCurveTo(cx, py, cx, y, x, y);
    }
  });
  ctx.lineTo(padLeft + (values.length - 1) * stepX, padTop + chartH);
  ctx.lineTo(padLeft, padTop + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  values.forEach((v, i) => {
    const x = padLeft + i * stepX;
    const y = getY(v);
    if (i === 0) ctx.moveTo(x, y);
    else {
      const px = padLeft + (i - 1) * stepX;
      const py = getY(values[i - 1]);
      const cx = (px + x) / 2;
      ctx.bezierCurveTo(cx, py, cx, y, x, y);
    }
  });
  ctx.stroke();

  const lastIdx = values.length - 1;
  const lastX = padLeft + lastIdx * stepX;
  const lastY = getY(values[lastIdx]);

  ctx.beginPath();
  ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  drawTooltip(ctx, lastX, lastY, values[lastIdx], colorHex);
};

const drawModernBar = (canvas, values, colorHex) => {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, w, h } = setup;

  const minV = 0;
  const maxV = Math.max(...values) * 1.2 || 10;
  const { padTop, padLeft, chartW, chartH } = drawModernGrid(
    ctx,
    w,
    h,
    minV,
    maxV
  );

  const barW = (chartW / values.length) * 0.6;
  const gap = (chartW / values.length) * 0.4;

  values.forEach((v, i) => {
    const x = padLeft + gap / 2 + i * (barW + gap);
    const barH = (v / maxV) * chartH;
    const y = padTop + chartH - barH;

    const grad = ctx.createLinearGradient(0, y, 0, y + barH);
    grad.addColorStop(0, colorHex);
    grad.addColorStop(1, colorHex + "CC");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
    ctx.fill();

    if (i === values.length - 1) {
      drawTooltip(ctx, x + barW / 2, y, v, colorHex);
    }
  });
};

const drawGauge = (canvas, value) => {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, w, h } = setup;

  const cx = w / 2;
  const cy = h * 0.8;
  const r = Math.min(w, h) * 0.55;

  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0);
  ctx.lineWidth = 25;
  ctx.strokeStyle = "#F1F5F9";
  ctx.lineCap = "round";
  ctx.stroke();

  const percentage = Math.min(Math.max(value / 100, 0), 1);
  const endAngle = Math.PI + percentage * Math.PI;

  let color = "#EF4444";
  if (value > 40) color = "#EAB308";
  if (value > 75) color = "#22C55E";

  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, endAngle);
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#334155";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText(`${Math.round(value)}%`, cx, cy - 20);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "12px sans-serif";
  ctx.fillText(value > 75 ? "Excellent" : value > 40 ? "Good" : "Poor", cx, cy);
};

const drawModernDonut = (canvas, values, colors) => {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, w, h } = setup;

  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.35;
  const total = values.reduce((a, b) => a + b, 0) || 1;
  let start = -Math.PI / 2;

  values.forEach((v, i) => {
    const slice = (v / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, start + slice);
    ctx.lineWidth = 20;
    ctx.strokeStyle = colors[i];
    ctx.stroke();
    start += slice;
  });

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#475569";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("AVG", cx, cy - 8);
  ctx.fillStyle = "#0EA5E9";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(values[1], cx, cy + 10);
};

const drawModernRadar = (canvas, labels, values, colorHex) => {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, w, h } = setup;

  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.35;
  const maxV = Math.max(...values) * 1.1 || 10;
  const total = values.length;

  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1;
  for (let l = 1; l <= 4; l++) {
    ctx.beginPath();
    for (let i = 0; i < total; i++) {
      const ang = (Math.PI * 2 * i) / total - Math.PI / 2;
      const dist = r * (l / 4);
      const x = cx + Math.cos(ang) * dist;
      const y = cy + Math.sin(ang) * dist;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.beginPath();
  values.forEach((v, i) => {
    const ang = (Math.PI * 2 * i) / total - Math.PI / 2;
    const dist = r * (v / maxV);
    const x = cx + Math.cos(ang) * dist;
    const y = cy + Math.sin(ang) * dist;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = colorHex + "44";
  ctx.fill();
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#64748B";
  ctx.font = "10px sans-serif";
  labels.forEach((l, i) => {
    const ang = (Math.PI * 2 * i) / total - Math.PI / 2;
    const x = cx + Math.cos(ang) * (r + 15);
    const y = cy + Math.sin(ang) * (r + 15);
    ctx.fillText(l, x, y);
  });
};

const drawAdminGraphs = () => {
  if (!adminLineCanvas.value) return;
  const d = adminData.value;

  const trend = [d.users * 0.8, d.users * 0.9, d.users, d.users * 1.1, d.users];
  drawSmoothLine(adminLineCanvas.value, trend, "#3B82F6");

  drawModernDonut(
    adminPieCanvas.value,
    [d.online, d.offline],
    ["#10B981", "#EF4444"]
  );
};

const drawUserGraphs = () => {
  if (!uTempCanvas.value || !hasLogs.value) return;

  const logs = [...selectedDevice.value.logs].reverse().slice(0, 10);
  const temps = logs.map((l) => l.temp);
  const hums = logs.map((l) => l.humidity);
  const press = logs.map((l) => l.pressure);

  drawSmoothLine(uTempCanvas.value, temps, "#F43F5E");

  drawSmoothLine(uHumCanvas.value, hums, "#0EA5E9");

  drawModernBar(uPresCanvas.value, press, "#6366F1");

  const avg = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  drawModernDonut(
    uDonutCanvas.value,
    [min, avg, max],
    ["#34D399", "#3B82F6", "#F43F5E"]
  );

  const last = logs[logs.length - 1];
  drawModernRadar(
    uRadarCanvas.value,
    ["TEMP", "HUM", "PRES"],
    [last.temp, last.humidity, last.pressure / 20],
    "#8B5CF6"
  );

  const health = 85 + (Math.random() * 10 - 5);
  drawGauge(uGaugeCanvas.value, health);
};

watch(selectedDeviceId, async () => {
  if (mode.value === "user") {
    await nextTick();
    drawUserGraphs();
  }
});
</script>

<style scoped>
.stat-card {
  @apply bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md cursor-default;
}
.stat-card .icon-bg {
  @apply w-12 h-12 rounded-lg flex items-center justify-center transition-all;
}
.stat-card .label {
  @apply text-sm text-gray-500 font-medium;
}
.stat-card .value {
  @apply text-2xl font-bold text-gray-800;
}

.graph-card {
  @apply bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full transition-shadow hover:shadow-md;
}
.graph-header {
  @apply flex justify-between items-start mb-4;
}
.graph-header h3 {
  @apply text-gray-700 font-bold text-sm uppercase tracking-wide flex items-center;
}
.canvas-wrapper {
  @apply relative w-full flex-grow;
  min-height: 200px;
}

.device-select {
  @apply bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none;
}
.status-badge {
  @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border;
}
</style>