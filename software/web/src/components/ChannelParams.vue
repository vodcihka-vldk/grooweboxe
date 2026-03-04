<template>
  <div class="channel-params">
    <h2>Параметры канала</h2>
    <div class="channel-settings">
      <div class="setting">
        <label for="volume">Громкость</label>
        <input
          id="volume"
          type="range"
          min="0"
          max="100"
          v-model="volume"
        />
        <span>{{ volume }}</span>
      </div>
      <div class="setting">
        <label for="pan">Панорама</label>
        <input
          id="pan"
          type="range"
          min="-50"
          max="50"
          v-model="pan"
        />
        <span>{{ pan }}</span>
      </div>
      <div class="setting">
        <label for="sample">Сэмпл</label>
        <select id="sample" v-model="sample">
          <option v-for="s in samples" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="setting">
        <label for="effect">Эффект</label>
        <select id="effect" v-model="effect">
          <option v-for="e in effects" :key="e" :value="e">{{ e }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChannelParams',
  data() {
    return {
      volume: 75,
      pan: 0,
      sample: 'kick.wav',
      samples: ['kick.wav', 'snare.wav', 'hat.wav', 'perc.wav'],
      effect: 'compressor',
      effects: ['compressor', 'reverb', 'delay', 'bitcrusher']
    }
  }
}
</script>

<style scoped>
.channel-params {
  background: var(--surface-color, #2d2d2d);
  border: 1px solid var(--border-color, #444);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.channel-settings {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 400px;
}

.setting {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.setting label {
  min-width: 100px;
  color: var(--primary-color, #007bff);
}

.setting input[type="range"] {
  flex: 1;
}

.setting select {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--border-color, #444);
  background: var(--bg-color, #1a1a1a);
  color: var(--text-color, #fff);
}
</style>