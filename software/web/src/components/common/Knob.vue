<template>
  <div class="knob-container">
    <span class="knob-label">{{ label }}</span>
    <div
      :id="'knob-' + knobId"
      class="knob"
      :class="extraClass"
      :data-val="internalVal"
      @mousedown="onMouseDown"
    >
      <div
        class="knob-indicator"
        :style="{ transform: `translate(-50%, -100%) rotate(${deg}deg)` }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { setKnobValue } from '../../composables/useKnobs.js';

const props = defineProps({
  knobId:     { type: String, required: true },
  label:      { type: String, default: '' },
  initialVal: { type: Number, default: 50 },
  extraClass: { type: String, default: '' }
});

const internalVal = ref(props.initialVal);

const deg = computed(() => -130 + (internalVal.value / 100) * 260);

let isDragging = false;
let startY = 0;
let startVal = 0;

function onMouseDown(e) {
  isDragging = true;
  startY = e.clientY;
  startVal = internalVal.value;
  document.body.style.cursor = 'ns-resize';
  e.preventDefault();
}

function onMouseMove(e) {
  if (!isDragging) return;
  const deltaY = startY - e.clientY;
  const newVal = Math.max(0, Math.min(100, startVal + deltaY));
  internalVal.value = newVal;
  setKnobValue(props.knobId, newVal);
}

function onMouseUp() {
  if (!isDragging) return;
  isDragging = false;
  document.body.style.cursor = 'default';
}

// Listen for external knob updates (e.g. from load project)
function onKnobChanged(e) {
  if (e.detail.knobId === props.knobId) {
    internalVal.value = Math.max(0, Math.min(100, e.detail.val));
  }
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('knob-changed', onKnobChanged);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
  window.removeEventListener('knob-changed', onKnobChanged);
});

// Expose so parent can force-update value
defineExpose({ setValue: (v) => { internalVal.value = Math.max(0, Math.min(100, v)); } });
</script>
