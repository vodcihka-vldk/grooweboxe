<template>
  <div class="gb-master">
    <div v-for="k in masterKnobs" :key="k.id" class="knob-container master">
      <div
        :id="'knob-' + k.id"
        class="knob"
        :data-val="k.initVal"
        @mousedown="onMouseDown($event, k.id)"
      >
        <div
          class="knob-indicator"
          :style="{ transform: `translate(-50%, -100%) rotate(${getDeg(k.id)}deg)` }"
        ></div>
      </div>
      <span class="knob-label">{{ k.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { state } from '../store/state.js';
import { setKnobValue } from '../composables/useKnobs.js';

const masterKnobs = [
  { id: 'master', label: 'Master', initVal: 80  },
  { id: 'bpm',    label: 'Bpm',    initVal: 0   },  // will be set on mount
  { id: 'swing',  label: 'Swing',  initVal: 0   },
  { id: 'bitsh',  label: 'BitSh',  initVal: 0   },
  { id: 'gate',   label: 'Gate',   initVal: 100 },
  { id: 'delay',  label: 'Delay',  initVal: 0   },
  { id: 'reverb', label: 'Reverb', initVal: 0   },
];

// knob val storage (0-100)
const knobVals = reactive({
  master: 80,
  bpm:    (state.bpm - 40) / 2.2,
  swing:  0,
  bitsh:  0,
  gate:   100,
  delay:  0,
  reverb: 0
});

function getDeg(id) {
  return -130 + (knobVals[id] / 100) * 260;
}

let dragging = null;
let startY = 0;
let startVal = 0;

function onMouseDown(e, knobId) {
  dragging = knobId;
  startY = e.clientY;
  startVal = knobVals[knobId];
  document.body.style.cursor = 'ns-resize';
  e.preventDefault();
}

function onMouseMove(e) {
  if (!dragging) return;
  const deltaY = startY - e.clientY;
  const newVal = Math.max(0, Math.min(100, startVal + deltaY));
  knobVals[dragging] = newVal;
  setKnobValue(dragging, newVal);
}

function onMouseUp() {
  if (!dragging) return;
  dragging = null;
  document.body.style.cursor = 'default';
}

// Sync from external updates (e.g. load project)
function onKnobChanged(e) {
  const { knobId, val } = e.detail;
  if (knobId in knobVals) {
    knobVals[knobId] = Math.max(0, Math.min(100, val));
  }
}

onMounted(() => {
  // Init BPM knob from state
  knobVals.bpm = (state.bpm - 40) / 2.2;
  // Init all master knobs silently
  setKnobValue('master', state.master.masterVolume, true);
  setKnobValue('bpm',    (state.bpm - 40) / 2.2,   true);
  setKnobValue('swing',  state.master.swing,        true);
  setKnobValue('gate',   state.master.gate,         true);
  setKnobValue('bitsh',  state.master.bitsh,        true);
  setKnobValue('delay',  state.master.delay,        true);
  setKnobValue('reverb', state.master.reverb,       true);

  window.addEventListener('mousemove',   onMouseMove);
  window.addEventListener('mouseup',     onMouseUp);
  window.addEventListener('knob-changed', onKnobChanged);
});

onUnmounted(() => {
  window.removeEventListener('mousemove',   onMouseMove);
  window.removeEventListener('mouseup',     onMouseUp);
  window.removeEventListener('knob-changed', onKnobChanged);
});
</script>
