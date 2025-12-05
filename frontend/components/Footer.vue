<template>
  <footer
    class="w-full bg-gradient-to-br from-green-500 to-green-700 border-t mt-auto shadow-inner"
  >
    <div
      class="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm"
    >
      <p class="flex items-center gap-2 text-white">
        <i class="mdi mdi-access-point-network text-white text-xl"></i>
        Sensor Monitoring System © {{ year }}
      </p>

      <p class="mt-2 md:mt-0 text-white">
        Developed with ❤️ by CMTC DEVOPS Team
      </p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>
