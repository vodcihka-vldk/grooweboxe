<template>
  <div class="sequencer">
    <h2>Секвенсор</h2>
    <!-- Управление секвенсором -->
    <div class="sequencer-controls">
      <div class="bpm-control">
        <label for="bpm-input">BPM:</label>
        <input
          id="bpm-input"
          type="number"
          v-model="bpm"
          min="40"
          max="200"
          class="bpm-input"
        />
      </div>
      <button class="play-btn" :class="{ playing: isPlaying }" @click="togglePlay">
        {{ isPlaying ? 'Стоп' : 'Пуск' }}
      </button>
    </div>
    <!-- Матрица шагов 8 каналов × 64 шага -->
    <div class="step-matrix">
      <div
        v-for="channel in channels"
        :key="channel.id"
        class="channel-row"
      >
        <div class="channel-label">
          Канал {{ channel.id }}
        </div>
        <div class="steps">
          <button
            v-for="step in 64"
            :key="step"
            :class="['step-btn', { active: isStepActive(channel.id, step) }]"
            @click="toggleStep(channel.id, step)"
          >
            {{ step }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sequencer',
  data() {
    return {
      bpm: 120,
      isPlaying: false,
      // Массив каналов (8 каналов)
      channels: Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        steps: Array(64).fill(false)
      }))
    }
  },
  methods: {
    togglePlay() {
      this.isPlaying = !this.isPlaying
      // TODO: Реализовать запуск/остановку секвенсора
    },
    isStepActive(channelId, stepIdx) {
      const channel = this.channels.find(c => c.id === channelId)
      return channel && channel.steps[stepIdx - 1]
    },
    toggleStep(channelId, stepIdx) {
      const channel = this.channels.find(c => c.id === channelId)
      if (channel) {
        channel.steps[stepIdx - 1] = !channel.steps[stepIdx - 1]
      }
    }
  }
}
</script>

<style scoped>
.sequencer {
  background: var(--surface-color, #2d2d2d);
  border: 1px solid var(--border-color, #444);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.sequencer-controls {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.bpm-control label {
  color: var(--primary-color, #007bff);
  margin-right: 0.5rem;
}

.bpm-input {
  width: 80px;
  padding: 0.25rem 0.5rem;
  background-color: var(--bg-color, #1a1a1a);
  border: 1px solid var(--border-color, #444);
  color: var(--text-color, #fff);
  border-radius: 4px;
  font-size: 1rem;
}

.play-btn {
  padding: 0.5rem 1.5rem;
  background-color: var(--primary-color, #007bff);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.play-btn.playing {
  background-color: var(--danger-color, #dc3545);
}

.step-matrix {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.channel-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.channel-label {
  width: 100px;
  color: var(--primary-color, #007bff);
  font-weight: bold;
}

.steps {
  display: grid;
  grid-template-columns: repeat(64, 1fr);
  gap: 2px;
  width: 100%;
}

.step-btn {
  width: 22px;
  height: 22px;
  background: var(--bg-color, #1a1a1a);
  border: 1px solid var(--border-color, #444);
  border-radius: 2px;
  color: var(--muted-color, #888);
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
}

.step-btn.active {
  background: var(--primary-color, #007bff);
  color: #fff;
  border-color: var(--primary-color, #007bff);
}
</style>