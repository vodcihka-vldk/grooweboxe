<template>
  <div class="audio-params">
    <h2>Параметры аудио</h2>
    <!-- Настройки эффектов -->
    <div class="effects-list">
      <div v-for="effect in effects" :key="effect.name" class="effect-card">
        <h3>{{ effect.label }}</h3>
        <div v-for="param in effect.params" :key="param.name" class="effect-param">
          <label :for="param.name">{{ param.label }}</label>
          <input
            type="range"
            :id="param.name"
            :min="param.min"
            :max="param.max"
            v-model="param.value"
          />
          <span>{{ param.value }}</span>
        </div>
      </div>
    </div>
    <!-- Выбор эффекта для канала -->
    <div class="channel-effects">
      <h3>Эффекты по каналам</h3>
      <div v-for="channel in channels" :key="channel.id" class="channel-effect">
        <span>Канал {{ channel.id }}</span>
        <select v-model="channel.effect">
          <option v-for="effect in effects" :key="effect.name" :value="effect.name">
            {{ effect.label }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AudioParams',
  data() {
    return {
      effects: [
        {
          name: 'compressor',
          label: 'Компрессор',
          params: [
            { name: 'threshold', label: 'Порог', min: -60, max: 0, value: -20 },
            { name: 'ratio', label: 'Соотношение', min: 1, max: 20, value: 4 }
          ]
        },
        {
          name: 'reverb',
          label: 'Реверберация',
          params: [
            { name: 'decay', label: 'Затухание', min: 0, max: 10, value: 2 },
            { name: 'mix', label: 'Смешивание', min: 0, max: 100, value: 50 }
          ]
        },
        {
          name: 'delay',
          label: 'Дилей',
          params: [
            { name: 'time', label: 'Время', min: 0, max: 2000, value: 500 },
            { name: 'feedback', label: 'Обратная связь', min: 0, max: 100, value: 30 }
          ]
        },
        {
          name: 'bitcrusher',
          label: 'Bitcrusher',
          params: [
            { name: 'bits', label: 'Биты', min: 4, max: 16, value: 8 },
            { name: 'mix', label: 'Смешивание', min: 0, max: 100, value: 50 }
          ]
        }
      ],
      channels: Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        effect: 'compressor'
      }))
    }
  }
}
</script>

<style scoped>
.audio-params {
  background: var(--surface-color, #2d2d2d);
  border: 1px solid var(--border-color, #444);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.effects-list {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.effect-card {
  background: var(--bg-color, #1a1a1a);
  border: 1px solid var(--border-color, #444);
  border-radius: 8px;
  padding: 1rem;
  min-width: 220px;
}

.effect-param {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.effect-param label {
  min-width: 80px;
  color: var(--primary-color, #007bff);
}

.effect-param input[type="range"] {
  flex: 1;
}

.channel-effects {
  margin-top: 2rem;
}

.channel-effect {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.channel-effect select {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--border-color, #444);
  background: var(--bg-color, #1a1a1a);
  color: var(--text-color, #fff);
}
</style>