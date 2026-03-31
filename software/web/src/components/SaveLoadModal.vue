<template>
  <!-- Save Modal -->
  <Teleport to="body">
    <div v-if="saveModalVisible" class="modal-overlay" @click.self="closeSaveModal">
      <div class="modal-inner">
        <div class="modal-header">
          <span class="modal-title">{{ saveFilename }}</span>
          <button class="modal-close" @click="closeSaveModal">✕</button>
        </div>
        <div class="modal-hint">Copy this JSON or use the Download button to save as {{ saveFilename }}</div>
        <textarea class="modal-textarea" readonly :value="saveContent" ref="saveTextarea"></textarea>
        <div class="modal-btn-row">
          <button class="modal-btn-dl" @click="onDownload">{{ dlBtnText }}</button>
          <button class="modal-btn-copy" @click="onCopyJson">{{ copyBtnText }}</button>
        </div>
      </div>
    </div>

    <!-- Load Modal -->
    <div v-if="loadModalVisible" class="modal-overlay" @click.self="closeLoadModal">
      <div class="load-modal-inner">
        <div class="modal-header">
          <span class="modal-title">LOAD FILE</span>
          <button class="modal-close" @click="closeLoadModal">✕</button>
        </div>
        <div class="modal-hint">Paste .ptrn or .grv file contents below, or choose a file</div>
        <textarea
          class="load-textarea"
          placeholder="Paste JSON here..."
          v-model="loadText"
        ></textarea>
        <div class="modal-btn-row">
          <button class="modal-btn-dl" @click="onChooseFile">Choose File</button>
          <button class="modal-btn-copy" @click="onApplyLoad">Load</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { applyLoadedProject } from '../composables/useProject.js';

// ── Save modal ────────────────────────────────────────────────────────
const saveModalVisible = ref(false);
const saveContent      = ref('');
const saveFilename     = ref('');
const dlBtnText        = ref('Download File');
const copyBtnText      = ref('Copy JSON');
const saveTextarea     = ref(null);

function onShowSaveModal(e) {
  saveContent.value  = e.detail.content;
  saveFilename.value = e.detail.filename;
  dlBtnText.value    = 'Download File';
  copyBtnText.value  = 'Copy JSON';
  saveModalVisible.value = true;
  nextTick(() => {
    if (saveTextarea.value) saveTextarea.value.select();
  });
}

function closeSaveModal() {
  saveModalVisible.value = false;
}

function onDownload() {
  try {
    const blob = new Blob([saveContent.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = saveFilename.value;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
    dlBtnText.value = 'Downloading...';
    setTimeout(() => { dlBtnText.value = 'Download File'; }, 1500);
  } catch(e) {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg: 'Download failed', isError: true } }));
  }
}

async function onCopyJson() {
  const txt = saveContent.value;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(txt);
    } else {
      saveTextarea.value?.select();
      document.execCommand('copy');
    }
    copyBtnText.value = 'Copied ✓';
    setTimeout(() => { closeSaveModal(); }, 800);
  } catch(e) {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg: 'Copy failed — Ctrl+C manually', isError: true } }));
  }
}

// ── Load modal ────────────────────────────────────────────────────────
const loadModalVisible = ref(false);
const loadText = ref('');

function onShowLoadModal() {
  loadText.value = '';
  loadModalVisible.value = true;
}

function closeLoadModal() {
  loadModalVisible.value = false;
}

function onChooseFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.ptrn,.grv,.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { loadText.value = ev.target.result; };
    reader.readAsText(file);
  };
  input.click();
}

function onApplyLoad() {
  const text = loadText.value.trim();
  if (!text) {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg: 'Paste JSON first', isError: true } }));
    return;
  }
  applyLoadedProject(text);
  closeLoadModal();
}

onMounted(() => {
  window.addEventListener('show-save-modal', onShowSaveModal);
  window.addEventListener('show-load-modal', onShowLoadModal);
});

onUnmounted(() => {
  window.removeEventListener('show-save-modal', onShowSaveModal);
  window.removeEventListener('show-load-modal', onShowLoadModal);
});
</script>
