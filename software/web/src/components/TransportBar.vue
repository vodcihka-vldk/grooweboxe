<template>
  <div class="transport">
    <button
      class="btn-round"
      id="btn-play"
      :class="{ highlight: state.isPlaying }"
      @click="onPlay"
    >Play</button>

    <button class="btn-round" id="btn-rec">Rec</button>

    <button
      class="btn-round"
      id="btn-func"
      :class="{ highlight: state.isFuncPressed }"
      @click="onFunc"
    >Func</button>

    <button
      class="btn-round"
      id="btn-menu"
      :class="{ highlight: menuActive }"
      @click="onMenu"
    >Menu</button>

    <button
      class="btn-round"
      id="btn-fldr"
      :class="{ highlight: folderActive }"
      @click="onFldr"
    >Fldr</button>

    <button class="btn-round highlight" id="btn-g-save" @click="onGlobalSave">Save</button>
    <button class="btn-round highlight" id="btn-g-load" @click="onGlobalLoad">Load</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { state } from '../store/state.js';
import { startSequencer, stopSequencer } from '../composables/useSequencer.js';
import { saveProject, loadProject } from '../composables/useProject.js';
import { ensureSynthSounds } from '../composables/useSampler.js';

const menuActive   = ref(false);
const folderActive = ref(false);

function onPlay() {
  if (!state.isPlaying) {
    startSequencer();
  } else {
    stopSequencer();
    state.currentBar = 0;
    window.dispatchEvent(new CustomEvent('screen-update'));
  }
}

function onFunc() {
  state.isFuncPressed = !state.isFuncPressed;
}

function onMenu() {
  if (menuActive.value) {
    menuActive.value = false;
    window.dispatchEvent(new CustomEvent('close-menu'));
  } else {
    menuActive.value = true;
    // Close folder if open
    if (folderActive.value) {
      folderActive.value = false;
      window.dispatchEvent(new CustomEvent('close-folder'));
    }
    window.dispatchEvent(new CustomEvent('open-menu'));
  }
}

function onFldr() {
  ensureSynthSounds();
  if (folderActive.value) {
    folderActive.value = false;
    window.dispatchEvent(new CustomEvent('close-folder'));
  } else {
    folderActive.value = true;
    // Close menu if open
    if (menuActive.value) {
      menuActive.value = false;
      window.dispatchEvent(new CustomEvent('close-menu'));
    }
    window.dispatchEvent(new CustomEvent('open-folder'));
  }
}

function onGlobalSave() {
  saveProject();
}

function onGlobalLoad() {
  loadProject();
}

function onMenuClosed() { menuActive.value = false; }
function onFolderClosed() { folderActive.value = false; }

function onFlashButton(e) {
  const btn = document.getElementById(e.detail.id);
  if (!btn) return;
  const orig = btn.style.background;
  const origC = btn.style.color;
  btn.style.background = 'var(--accent)';
  btn.style.color = '#000';
  setTimeout(() => {
    btn.style.background = orig;
    btn.style.color = origC;
  }, 400);
}

onMounted(() => {
  window.addEventListener('close-menu',   onMenuClosed);
  window.addEventListener('close-folder', onFolderClosed);
  window.addEventListener('flash-button', onFlashButton);
});

onUnmounted(() => {
  window.removeEventListener('close-menu',   onMenuClosed);
  window.removeEventListener('close-folder', onFolderClosed);
  window.removeEventListener('flash-button', onFlashButton);
});
</script>
