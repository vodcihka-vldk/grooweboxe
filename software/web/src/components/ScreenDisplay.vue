<template>
  <div class="screen">
    <!-- Header -->
    <div class="screen-header">
      <div class="screen-header-left">
        <div class="screen-channel">CH <span id="ui-current-channel">{{ state.selectedChannel + 1 }}</span></div>
        <div id="ui-sample-path" class="screen-sample-path" :style="{ visibility: headerVisible ? 'visible' : 'hidden' }">
          {{ samplePath }}
        </div>
      </div>
      <div class="screen-sample-name-wrap">
        <div
          class="screen-param-display"
          id="ui-param-display"
          :class="{ show: paramDisplayVisible }"
          v-html="paramDisplayContent"
        ></div>
        <span
          id="ui-sample-name-header"
          :style="{ opacity: sampleNameVisible ? '1' : '0' }"
        >{{ sampleName }}</span>
      </div>
      <div class="screen-bpm"><span id="ui-screen-bpm">{{ Math.round(state.bpm) }}</span> bpm</div>
    </div>

    <!-- Body: Main view -->
    <div class="screen-body" id="screen-body-main" :style="{ display: bodyMode === 'main' ? 'flex' : 'none' }">
      <div class="screen-sample-info">
        <div class="screen-sample-idx" id="ui-sample-index">{{ sampleIndex }}</div>
        <div class="screen-sample-ms" id="ui-sample-ms">{{ sampleMs }}</div>
        <div class="screen-sample-ext" id="ui-sample-ext">{{ sampleExt }}</div>
      </div>
      <div class="screen-waveform">
        <canvas id="waveform-canvas" width="250" height="60"></canvas>
        <svg preserveAspectRatio="none" viewBox="0 0 100 40" id="waveform-svg">
          <line
            x1="10" y1="0" x2="10" y2="40"
            stroke="#fff" stroke-width="1"
            id="playhead-line"
            :opacity="playheadOpacity"
            :attr-x1="playheadX" :attr-x2="playheadX"
          />
        </svg>
      </div>
    </div>

    <!-- Body: Folder browser -->
    <div class="screen-body" id="screen-body-folder" :style="{ display: bodyMode === 'folder' ? 'flex' : 'none' }">
      <div class="folder-list" id="ui-folder-list" :style="{ transform: `translateY(${folderOffsetY}px)` }">
        <div
          v-for="(item, idx) in folderItems"
          :key="idx"
          class="folder-item"
          :class="{
            selected: idx === folderSelectedIdx,
            'is-file': idx === folderSelectedIdx && item.type === 'file'
          }"
        >
          <span class="fi-icon">{{ folderIcon(item) }}</span>
          <span class="fi-name">{{ item.name }}</span>
          <span v-if="item.type === 'file'" class="fi-ext">{{ item.ext.toUpperCase() }}</span>
        </div>
      </div>
    </div>

    <!-- Body: Menu -->
    <div class="screen-body" id="screen-body-menu" :style="{ display: bodyMode === 'menu' ? 'flex' : 'none' }">
      <div class="menu-list" id="ui-menu-list" :style="{ transform: `translateY(${menuOffsetY}px)` }">
        <div
          v-for="(item, idx) in currentMenuList"
          :key="item.id"
          class="menu-item"
          :class="{
            selected: idx === menuSelectedIdx,
            editing: idx === menuSelectedIdx && isMenuEditing
          }"
        >
          <div>{{ item.title }}</div>
          <div class="menu-item-val">{{ menuItemVal(item, idx) }}</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="screen-footer">
      <div class="screen-sequence-preview" id="screen-seq-preview">
        <div v-for="col in 4" :key="col" class="seq-col">
          <div
            v-for="row in 4"
            :key="row"
            class="seq-dash"
            :class="{
              active: seqPreview[(col-1) * 4 + (row-1)]?.active,
              playing: seqPreview[(col-1) * 4 + (row-1)]?.playing
            }"
          ></div>
        </div>
      </div>
      <div class="screen-bar" id="ui-current-bar">{{ barDisplay }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { state, getSequence, getMaxBars } from '../store/state.js';
import { getCurrentBuffer, getSampleDisplayName, getSamplePath, getSampleIndexDisplay, getSampleExt } from '../composables/useSampler.js';
import { getCurrent16thNote } from '../composables/useSequencer.js';
import { LOADABLE_EXTS, MENU_STRUCTURE } from '../utils/constants.js';
import { getFolderItems, getFolderNode } from '../utils/fileSystem.js';
import { getAudioContext } from '../composables/useAudioEngine.js';

// ── Computed screen values ────────────────────────────────────────────
const sampleName  = computed(() => getSampleDisplayName(state.selectedChannel));
const samplePath  = computed(() => getSamplePath(state.selectedChannel));
const sampleIndex = computed(() => getSampleIndexDisplay(state.selectedChannel));
const sampleExt   = computed(() => getSampleExt(state.selectedChannel));

const sampleMs = computed(() => {
  const buf = getCurrentBuffer(state.selectedChannel);
  if (!buf) return '--- ms';
  const chan = state.channels[state.selectedChannel];
  const playRatio = Math.max(10, chan.length) / 100;
  return Math.round(buf.duration * playRatio * 1000) + ' ms';
});

// ── Param display ─────────────────────────────────────────────────────
const paramDisplayVisible = ref(false);
const paramDisplayContent = ref('');
const sampleNameVisible   = ref(true);
const headerVisible       = ref(true);
let paramTimer = null;

function showParamDisplay(content, keepOpen = false) {
  paramDisplayContent.value = content;
  paramDisplayVisible.value = true;
  sampleNameVisible.value = false;
  if (!keepOpen) {
    if (paramTimer) clearTimeout(paramTimer);
    paramTimer = setTimeout(() => {
      paramDisplayVisible.value = false;
      sampleNameVisible.value = true;
    }, 1500);
  }
}

function onParamDisplay(e) {
  const { name, val, knobId } = e.detail;
  if (bodyMode.value === 'folder' || bodyMode.value === 'menu') return;
  const html = name ? `${name} <span>${val}</span>` : `<span>${val}</span>`;
  showParamDisplay(html);
}

// ── Body mode ─────────────────────────────────────────────────────────
const bodyMode = ref('main'); // 'main' | 'folder' | 'menu'

// ── Folder browser state ──────────────────────────────────────────────
const folderPath = ref([]);
const folderSelectedIdx = ref(0);

const folderItems = computed(() => {
  return getFolderItems(folderPath.value);
});

const ITEM_HEIGHT = 22;
const folderOffsetY = computed(() => {
  const offset = -(folderSelectedIdx.value * ITEM_HEIGHT - 1.5 * ITEM_HEIGHT);
  return Math.min(0, offset);
});

function folderIcon(item) {
  if (item.type === 'back') return '←';
  if (item.type === 'dir') return '▶';
  if (LOADABLE_EXTS.includes(item.ext)) return '♪';
  return '·';
}

// ── Menu state ────────────────────────────────────────────────────────
const isMenuOpen       = ref(false);
const currentMenuLevel = ref('main');
const menuSelectedIdx  = ref(0);
const isMenuEditing    = ref(false);

const currentMenuList = computed(() => MENU_STRUCTURE[currentMenuLevel.value] || []);

const MENU_ITEM_HEIGHT = 24;
const menuOffsetY = computed(() => {
  const visible = 2.5;
  const offset = -(menuSelectedIdx.value * MENU_ITEM_HEIGHT - (visible / 2 - 0.5) * MENU_ITEM_HEIGHT);
  return Math.min(0, offset);
});

function menuItemVal(item, idx) {
  if (currentMenuLevel.value !== 'main' && item.paramId) {
    if (idx === menuSelectedIdx.value && isMenuEditing.value) {
      const pct = state.mastering[item.paramId];
      const bars = Math.round(pct / 10);
      return '█'.repeat(bars) + '░'.repeat(10 - bars) + ' ' + pct;
    }
    return state.mastering[item.paramId];
  }
  return '▶';
}

// ── Sequencer preview ─────────────────────────────────────────────────
const seqPreview = ref(Array.from({ length: 16 }, () => ({ active: false, playing: false })));

function updateSeqPreview() {
  const chan = state.selectedChannel;
  const seq = getSequence();
  const playing16 = state.isPlaying ? getCurrent16thNote() % 16 : -1;

  seqPreview.value = Array.from({ length: 16 }, (_, i) => {
    const globalStep = state.currentBar * 16 + i;
    return {
      active:  !!seq[chan][globalStep],
      playing: state.isPlaying && i === playing16
    };
  });
}

// ── Bar display ───────────────────────────────────────────────────────
const barDisplay = computed(() => {
  const playingBar = state.isPlaying ? Math.floor(getCurrent16thNote() / 16) : -1;
  if (state.isPlaying && playingBar !== state.currentBar) {
    return `bar ${state.currentBar + 1}/${getMaxBars()} ▶${playingBar + 1}`;
  }
  return `bar ${state.currentBar + 1}/${getMaxBars()}`;
});

// ── Waveform drawing ──────────────────────────────────────────────────
function drawWaveform() {
  const canvas = document.getElementById('waveform-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const buffer = getCurrentBuffer(state.selectedChannel);
  if (!buffer) return;

  const chan = state.channels[state.selectedChannel];
  const data = buffer.getChannelData(0);
  const step = Math.ceil(data.length / width);

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(212, 255, 0, 0.8)';
  ctx.lineWidth = 1;

  for (let i = 0; i < width; i++) {
    let min = 1.0, max = -1.0;
    for (let j = 0; j < step; j++) {
      const datum = data[(i * step) + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    const yMin = (1 + min) * height / 2;
    const yMax = (1 + max) * height / 2;
    if (i === 0) ctx.moveTo(i, yMin);
    else { ctx.lineTo(i, yMin); ctx.lineTo(i, yMax); }
  }
  ctx.stroke();

  // Overlay lines
  const startRatio = chan.start / 100;
  const lenRatio   = Math.max(10, chan.length) / 100;
  const startX     = startRatio * width;
  const endX       = Math.min(width, startX + lenRatio * width);

  // Start marker
  ctx.beginPath();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 5]);
  ctx.moveTo(startX, 0); ctx.lineTo(startX, height);
  ctx.stroke();
  ctx.setLineDash([]);

  // End marker
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(212,255,0,0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 5]);
  ctx.moveTo(endX, 0); ctx.lineTo(endX, height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Attack/Decay envelope overlay
  if (chan.attack > 2 || chan.decay < 90) {
    const attWidth = (chan.attack / 100) * lenRatio * width;
    const decStart = startX + attWidth;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.moveTo(startX, height * 0.9);
    ctx.lineTo(decStart, height * 0.1);
    const decWidth = (chan.decay / 100) * (endX - decStart);
    ctx.lineTo(decStart + decWidth, height * 0.9);
    ctx.stroke();
  }
}

// ── Playhead ──────────────────────────────────────────────────────────
const playheadOpacity = ref(0);
const playheadX = ref(10);
let activePlayheads = [];

function animatePlayhead() {
  // getAudioContext is imported at the top of the file
}

// ── Event listeners ───────────────────────────────────────────────────
function onSequencerStep(e) {
  updateSeqPreview();
}

function onScreenUpdate() {
  drawWaveform();
  updateSeqPreview();
}

function onOpenFolder(e) {
  bodyMode.value = 'folder';
  folderPath.value = [];
  folderSelectedIdx.value = 0;
  headerVisible.value = false;
  sampleNameVisible.value = false;
  showParamDisplay('<span>USB</span> / ROOT', true);
}

function onCloseFolder() {
  bodyMode.value = 'main';
  headerVisible.value = true;
  sampleNameVisible.value = true;
  paramDisplayVisible.value = false;
}

function onOpenMenu() {
  bodyMode.value = 'menu';
  isMenuOpen.value = true;
  currentMenuLevel.value = 'main';
  menuSelectedIdx.value = 0;
  isMenuEditing.value = false;
  updateMenuParamDisplay();
}

function onCloseMenu() {
  bodyMode.value = 'main';
  isMenuOpen.value = false;
  isMenuEditing.value = false;
  paramDisplayVisible.value = false;
}

function updateMenuParamDisplay() {
  if (isMenuEditing.value) {
    const item = currentMenuList.value[menuSelectedIdx.value];
    showParamDisplay(`<span>${item.title}</span> EDIT`, true);
  } else if (currentMenuLevel.value !== 'main') {
    showParamDisplay(`<span>${currentMenuLevel.value.toUpperCase()}</span>`, true);
  } else {
    showParamDisplay(`<span>MENU</span>`, true);
  }
}

function onMenuNavigation(e) {
  const { level, idx, editing } = e.detail;
  if (level !== undefined) currentMenuLevel.value = level;
  if (idx  !== undefined) menuSelectedIdx.value  = idx;
  if (editing !== undefined) isMenuEditing.value = editing;
  updateMenuParamDisplay();
}

function onFolderNavigation(e) {
  const { path, idx, paramText } = e.detail;
  if (path !== undefined) folderPath.value = path;
  if (idx  !== undefined) folderSelectedIdx.value = idx;
  if (paramText) showParamDisplay(paramText, bodyMode.value === 'folder');
}

function onShowPatternIndicator(e) {
  const pIdx = e.detail.pattern;
  showParamDisplay('PTRN <span>' + (pIdx + 1) + '</span>');
}

function onFileLoadedToChannel(e) {
  const { chan, file } = e.detail;
  showParamDisplay('CH' + (chan + 1) + ' ← <span>' + file.name.substring(0, 12) + '</span>');
}

function onSamplesReady() {
  drawWaveform();
  updateSeqPreview();
}

function onProjectLoaded() {
  drawWaveform();
  updateSeqPreview();
}

function onSampleTriggered(e) {
  if (e.detail.chanIndex === state.selectedChannel) {
    activePlayheads.push({
      startCtxTime: e.detail.startTime,
      endCtxTime: e.detail.startTime + e.detail.playDur,
      startRatio: e.detail.startLoc / e.detail.bufferDuration,
      endRatio: (e.detail.startLoc + e.detail.playDur) / e.detail.bufferDuration
    });
  }
}

// RAF playhead loop
let rafId = null;
function rafPlayhead() {
  rafId = requestAnimationFrame(rafPlayhead);
  // dynamic import to avoid circular at top level
  const audio = window._audioCtxRef;
  if (!audio) return;
  const cTime = audio.currentTime;
  activePlayheads = activePlayheads.filter(p => cTime < p.endCtxTime);
  const line = document.getElementById('playhead-line');
  if (!line) return;
  if (activePlayheads.length > 0) {
    const p = activePlayheads[0];
    if (cTime >= p.startCtxTime) {
      const progress = (cTime - p.startCtxTime) / (p.endCtxTime - p.startCtxTime);
      const x = (p.startRatio + progress * (p.endRatio - p.startRatio)) * 100;
      line.setAttribute('x1', x);
      line.setAttribute('x2', x);
      line.setAttribute('opacity', 1);
    } else {
      line.setAttribute('opacity', 0);
    }
  } else {
    line.setAttribute('opacity', 0);
  }
}

onMounted(() => {
  window.addEventListener('param-display',       onParamDisplay);
  window.addEventListener('sequencer-step',      onSequencerStep);
  window.addEventListener('screen-update',       onScreenUpdate);
  window.addEventListener('open-folder',         onOpenFolder);
  window.addEventListener('close-folder',        onCloseFolder);
  window.addEventListener('open-menu',           onOpenMenu);
  window.addEventListener('close-menu',          onCloseMenu);
  window.addEventListener('menu-navigation',     onMenuNavigation);
  window.addEventListener('folder-navigation',   onFolderNavigation);
  window.addEventListener('show-pattern-indicator', onShowPatternIndicator);
  window.addEventListener('file-loaded-to-channel', onFileLoadedToChannel);
  window.addEventListener('samples-ready',       onSamplesReady);
  window.addEventListener('synth-sounds-ready',  onSamplesReady);
  window.addEventListener('project-loaded',      onProjectLoaded);
  window.addEventListener('knob-changed',        onScreenUpdate);
  window.addEventListener('sample-triggered',    onSampleTriggered);
  window.addEventListener('sequencer-started',   onScreenUpdate);
  window.addEventListener('sequencer-stopped',   onScreenUpdate);
  rafPlayhead();
  updateSeqPreview();
  drawWaveform();
});

onUnmounted(() => {
  window.removeEventListener('param-display',       onParamDisplay);
  window.removeEventListener('sequencer-step',      onSequencerStep);
  window.removeEventListener('screen-update',       onScreenUpdate);
  window.removeEventListener('open-folder',         onOpenFolder);
  window.removeEventListener('close-folder',        onCloseFolder);
  window.removeEventListener('open-menu',           onOpenMenu);
  window.removeEventListener('close-menu',          onCloseMenu);
  window.removeEventListener('menu-navigation',     onMenuNavigation);
  window.removeEventListener('folder-navigation',   onFolderNavigation);
  window.removeEventListener('show-pattern-indicator', onShowPatternIndicator);
  window.removeEventListener('file-loaded-to-channel', onFileLoadedToChannel);
  window.removeEventListener('samples-ready',       onSamplesReady);
  window.removeEventListener('synth-sounds-ready',  onSamplesReady);
  window.removeEventListener('project-loaded',      onProjectLoaded);
  window.removeEventListener('knob-changed',        onScreenUpdate);
  window.removeEventListener('sample-triggered',    onSampleTriggered);
  window.removeEventListener('sequencer-started',   onScreenUpdate);
  window.removeEventListener('sequencer-stopped',   onScreenUpdate);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>
