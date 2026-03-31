<template>
  <div class="knobs-matrix">
    <Knob
      v-for="k in knobDefs"
      :key="k.id"
      :ref="el => knobRefs[k.id] = el"
      :knobId="k.id"
      :label="k.label"
      :initialVal="getInitialVal(k.id)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Knob from './common/Knob.vue';
import { state } from '../store/state.js';

const knobDefs = [
  { id: 'sample', label: 'Sample' },
  { id: 'volume', label: 'Volume' },
  { id: 'pitch',  label: 'Pitch'  },
  { id: 'drive',  label: 'Drive'  },
  { id: 'start',  label: 'Start'  },
  { id: 'length', label: 'Length' },
  { id: 'attack', label: 'Attack' },
  { id: 'decay',  label: 'Decay'  },
];

const knobRefs = ref({});

function getInitialVal(id) {
  const chan = state.channels[state.selectedChannel];
  if (id === 'sample') return chan.sample * 15;
  return chan[id] ?? 50;
}

// When channel switches, update all knob visuals
function onKnobChanged(e) {
  // Each Knob handles its own update via the knob-changed event
}

// Refresh knobs when channel switches
function onChannelKnobsUpdate() {
  const chan = state.channels[state.selectedChannel];
  const vals = {
    sample: chan.sample * 15,
    volume: chan.volume,
    pitch:  chan.pitch,
    drive:  chan.drive,
    start:  chan.start,
    length: chan.length,
    attack: chan.attack,
    decay:  chan.decay,
  };
  for (const [id, val] of Object.entries(vals)) {
    if (knobRefs.value[id]) {
      knobRefs.value[id].setValue(val);
    }
  }
}

onMounted(() => {
  window.addEventListener('update-channel-knobs', onChannelKnobsUpdate);
});

onUnmounted(() => {
  window.removeEventListener('update-channel-knobs', onChannelKnobsUpdate);
});
</script>
