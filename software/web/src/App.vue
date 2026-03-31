<template>
  <div class="app-wrapper">
    <div class="groovebox">
      <div class="gb-main">

        <!-- TOP SECTION -->
        <div class="gb-top">
          <ScreenDisplay />
          <MenuEncoder />
        </div>

        <!-- MIDDLE SECTION -->
        <div class="gb-middle">
          <TransportBar />

          <div class="controls-grid">
            <KnobsMatrix />

            <!-- Right util buttons -->
            <div class="utils-matrix">
              <button class="btn-square" id="btn-s-save" @click="onPatternSave">Save</button>
              <button
                class="btn-square"
                id="btn-ptrn"
                :class="{ active: isPtrnMode }"
                @mousedown="onPtrnDown"
                @mouseup="onPtrnUp"
                @touchstart.prevent="onPtrnDown"
                @touchend.prevent="onPtrnUp"
              >Ptrn</button>
              <button
                class="btn-square"
                id="btn-mute"
                :class="{ active: muteActive }"
                @click="onMute"
              >Mute</button>
              <button
                class="btn-square"
                id="btn-solo"
                :class="{ active: soloActive }"
                @click="onSolo"
              >Solo</button>
            </div>
          </div>
        </div>

        <!-- BOTTOM SECTION -->
        <div class="gb-bottom">
          <SequencerGrid />
          <ChannelsGrid />
        </div>

      </div>

      <!-- MASTER SECTION -->
      <MasterSection />
    </div>

    <!-- Modals & Toast -->
    <SaveLoadModal />
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ScreenDisplay  from './components/ScreenDisplay.vue';
import MenuEncoder    from './components/MenuEncoder.vue';
import KnobsMatrix    from './components/KnobsMatrix.vue';
import TransportBar   from './components/TransportBar.vue';
import SequencerGrid  from './components/SequencerGrid.vue';
import ChannelsGrid   from './components/ChannelsGrid.vue';
import MasterSection  from './components/MasterSection.vue';
import SaveLoadModal  from './components/SaveLoadModal.vue';
import Toast          from './components/common/Toast.vue';

import { initBasicSamples } from './composables/useSampler.js';
import { savePatternSettings } from './composables/useProject.js';
import { getAudioContext } from './composables/useAudioEngine.js';

const isPtrnMode  = ref(false);
const muteActive  = ref(false);
const soloActive  = ref(false);

// ── Pattern button ────────────────────────────────────────────────────
function onPtrnDown() {
  isPtrnMode.value = true;
  window.dispatchEvent(new CustomEvent('enter-ptrn-mode'));
}

function onPtrnUp() {
  setTimeout(() => {
    if (isPtrnMode.value) {
      isPtrnMode.value = false;
      window.dispatchEvent(new CustomEvent('exit-ptrn-mode'));
    }
  }, 80);
}

// ── Pattern save (internal) ───────────────────────────────────────────
function onPatternSave() {
  savePatternSettings();
}

// ── Mute / Solo (basic stubs — could be extended) ────────────────────
function onMute() { muteActive.value = !muteActive.value; }
function onSolo() { soloActive.value = !soloActive.value; }

// ── Global error handler ──────────────────────────────────────────────
window.addEventListener('error', (e) => {
  console.error('Groovebox error:', e.message, e.filename, e.lineno);
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { msg: 'Error: ' + e.message, isError: true }
  }));
});

onMounted(() => {
  // Generate basic samples (startup, fast)
  initBasicSamples();

  // Expose audioCtx to window for playhead animation in ScreenDisplay
  const checkAudio = setInterval(() => {
    const ctx = getAudioContext();
    if (ctx) {
      window._audioCtxRef = ctx;
      clearInterval(checkAudio);
    }
  }, 200);
});
</script>
