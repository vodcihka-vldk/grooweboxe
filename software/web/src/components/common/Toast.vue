<template>
  <div
    id="save-load-toast"
    class="toast"
    :class="{ visible: visible, error: isError }"
  >{{ message }}</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const visible = ref(false);
const isError = ref(false);
const message = ref('');
let timer = null;

function showToast(e) {
  const { msg, isError: err = false } = e.detail;
  message.value = msg;
  isError.value = err;
  visible.value = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { visible.value = false; }, 2000);
}

onMounted(() => {
  window.addEventListener('show-toast', showToast);
});

onUnmounted(() => {
  window.removeEventListener('show-toast', showToast);
  if (timer) clearTimeout(timer);
});
</script>
