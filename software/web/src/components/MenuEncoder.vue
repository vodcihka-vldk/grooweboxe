<template>
  <div class="menu-section">
    <div
      class="encoder-knob"
      id="knob-menu"
      data-type="encoder"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
    >
      <div class="encoder-wheel"></div>
    </div>
    <div class="menu-buttons">
      <button class="btn-rect" id="btn-back" @click="onBack">Back</button>
      <button class="btn-rect" id="btn-exit" @click="onExit">Exit</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { state } from '../store/state.js';
import { MENU_STRUCTURE } from '../utils/constants.js';
import { updateMasteringEffects } from '../composables/useAudioEngine.js';
import { getFolderItems, getFolderNode, LOADABLE_EXTS } from '../utils/fileSystem.js';
import { previewFile, loadFileToChannel, ensureSynthSounds } from '../composables/useSampler.js';

// ── Encoder drag state ────────────────────────────────────────────────
let isEncDragging = false;
let startEncY     = 0;
let startEncVal   = 0;
let didDrag       = false;

// ── Menu state (synced via events from ScreenDisplay) ─────────────────
const isMenuOpen       = ref(false);
const currentMenuLevel = ref('main');
const menuSelectedIdx  = ref(0);
const isMenuEditing    = ref(false);

// ── Folder state (synced from App.vue) ───────────────────────────────
const isFolderOpen     = ref(false);
const folderPath       = ref([]);
const folderSelectedIdx = ref(0);

function emitMenuNav(overrides = {}) {
  window.dispatchEvent(new CustomEvent('menu-navigation', {
    detail: {
      level:   currentMenuLevel.value,
      idx:     menuSelectedIdx.value,
      editing: isMenuEditing.value,
      ...overrides
    }
  }));
}

function emitFolderNav(overrides = {}) {
  window.dispatchEvent(new CustomEvent('folder-navigation', {
    detail: {
      path: folderPath.value.slice(),
      idx:  folderSelectedIdx.value,
      ...overrides
    }
  }));
}

// ── Mousedown on encoder ──────────────────────────────────────────────
function onMouseDown(e) {
  if (!isMenuOpen.value && !isFolderOpen.value) return;
  isEncDragging = true;
  didDrag = false;
  startEncY = e.clientY;

  if (isFolderOpen.value) {
    startEncVal = folderSelectedIdx.value;
    return;
  }
  if (isMenuEditing.value) {
    const item = MENU_STRUCTURE[currentMenuLevel.value][menuSelectedIdx.value];
    startEncVal = state.mastering[item.paramId];
  } else {
    startEncVal = menuSelectedIdx.value;
  }
}

// ── Mouseup on encoder ────────────────────────────────────────────────
function onMouseUp(e) {
  if (!isEncDragging) return;

  if (!didDrag) {
    if (isFolderOpen.value) {
      folderEncoderSelect();
    } else if (isMenuOpen.value) {
      if (currentMenuLevel.value === 'main') {
        const selectedItem = MENU_STRUCTURE.main[menuSelectedIdx.value];
        if (MENU_STRUCTURE[selectedItem.id]) {
          currentMenuLevel.value = selectedItem.id;
          menuSelectedIdx.value = 0;
          isMenuEditing.value = false;
          emitMenuNav();
        }
      } else if (!isMenuEditing.value) {
        isMenuEditing.value = true;
        emitMenuNav();
      } else {
        isMenuEditing.value = false;
        emitMenuNav();
      }
    }
  }
  isEncDragging = false;
}

// ── Global mousemove for encoder drag ────────────────────────────────
function onMouseMove(e) {
  if (!isEncDragging) return;
  const deltaY = startEncY - e.clientY;
  if (Math.abs(deltaY) > 3) didDrag = true;
  if (!didDrag) return;

  if (isFolderOpen.value) {
    const items = getFolderItems(folderPath.value);
    let newIdx = Math.round(startEncVal + deltaY / 12);
    newIdx = Math.max(0, Math.min(items.length - 1, newIdx));
    if (folderSelectedIdx.value !== newIdx) {
      folderSelectedIdx.value = newIdx;
      emitFolderNav({ paramText: null });
    }
    return;
  }

  if (!isMenuOpen.value) return;

  const currentList = MENU_STRUCTURE[currentMenuLevel.value];

  if (isMenuEditing.value) {
    const item = currentList[menuSelectedIdx.value];
    let newVal = Math.round(startEncVal + deltaY * 0.5);
    newVal = Math.max(0, Math.min(100, newVal));
    if (state.mastering[item.paramId] !== newVal) {
      state.mastering[item.paramId] = newVal;
      updateMasteringEffects();
      emitMenuNav();
    }
  } else {
    let newIdx = Math.round(startEncVal + deltaY / 10);
    newIdx = Math.max(0, Math.min(currentList.length - 1, newIdx));
    if (menuSelectedIdx.value !== newIdx) {
      menuSelectedIdx.value = newIdx;
      emitMenuNav();
    }
  }
}

function onMouseUpGlobal() {
  if (isEncDragging) isEncDragging = false;
}

// ── Folder encoder select (Enter/Click) ──────────────────────────────
function folderEncoderSelect() {
  const items = getFolderItems(folderPath.value);
  const item = items[folderSelectedIdx.value];
  if (!item) return;

  if (item.type === 'back') {
    folderPath.value = folderPath.value.slice(0, -1);
    folderSelectedIdx.value = 0;
    emitFolderNav({ paramText: buildFolderParam() });
  } else if (item.type === 'dir') {
    const offset = folderPath.value.length > 0 ? 1 : 0;
    folderPath.value = [...folderPath.value, folderSelectedIdx.value - offset];
    folderSelectedIdx.value = 0;
    emitFolderNav({ paramText: buildFolderParam() });
  } else if (item.type === 'file') {
    if (LOADABLE_EXTS.includes(item.ext)) {
      previewFile(item);
      loadFileToChannel(item, folderPath.value);
    }
  }
}

function buildFolderParam() {
  const node = getFolderNode(folderPath.value);
  const pathStr = folderPath.value.length === 0 ? 'root' : node.name;
  return '<span>USB</span> / ' + pathStr;
}

// ── Back / Exit buttons ───────────────────────────────────────────────
function onBack() {
  if (isFolderOpen.value) {
    if (folderPath.value.length > 0) {
      folderPath.value = folderPath.value.slice(0, -1);
      folderSelectedIdx.value = 0;
      emitFolderNav({ paramText: buildFolderParam() });
    } else {
      window.dispatchEvent(new CustomEvent('close-folder'));
    }
    return;
  }
  if (isMenuOpen.value) {
    if (isMenuEditing.value) {
      isMenuEditing.value = false;
      emitMenuNav();
    } else if (currentMenuLevel.value !== 'main') {
      currentMenuLevel.value = 'main';
      menuSelectedIdx.value = 0;
      emitMenuNav();
    } else {
      closeMenu();
    }
  }
}

function onExit() {
  if (isFolderOpen.value) {
    window.dispatchEvent(new CustomEvent('close-folder'));
    return;
  }
  if (isMenuOpen.value) closeMenu();
}

function closeMenu() {
  isMenuOpen.value = false;
  currentMenuLevel.value = 'main';
  menuSelectedIdx.value = 0;
  isMenuEditing.value = false;
  window.dispatchEvent(new CustomEvent('close-menu'));
}

// ── Listen for open/close events ─────────────────────────────────────
function onOpenMenu() {
  isMenuOpen.value = true;
  currentMenuLevel.value = 'main';
  menuSelectedIdx.value = 0;
  isMenuEditing.value = false;
}
function onCloseMenuEv() {
  isMenuOpen.value = false;
}
function onOpenFolder() {
  isFolderOpen.value = true;
  folderPath.value = [];
  folderSelectedIdx.value = 0;
}
function onCloseFolderEv() {
  isFolderOpen.value = false;
  folderPath.value = [];
  folderSelectedIdx.value = 0;
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUpGlobal);
  window.addEventListener('open-menu',   onOpenMenu);
  window.addEventListener('close-menu',  onCloseMenuEv);
  window.addEventListener('open-folder', onOpenFolder);
  window.addEventListener('close-folder', onCloseFolderEv);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUpGlobal);
  window.removeEventListener('open-menu',   onOpenMenu);
  window.removeEventListener('close-menu',  onCloseMenuEv);
  window.removeEventListener('open-folder', onOpenFolder);
  window.removeEventListener('close-folder', onCloseFolderEv);
});
</script>
