<template>
  <div class="browser">
    <h2>Браузер файлов</h2>
    <!-- Список файлов -->
    <div class="file-list">
      <div
        v-for="file in files"
        :key="file.id"
        class="file-item"
        @click="selectFile(file)"
        :class="{ selected: selectedFile && selectedFile.id === file.id }"
      >
        {{ file.name }}
      </div>
    </div>
    <!-- Кнопки управления -->
    <div class="browser-controls">
      <button class="btn btn-primary" @click="loadFile" :disabled="!selectedFile">
        Загрузить
      </button>
      <button class="btn btn-secondary" @click="saveFile">
        Сохранить проект
      </button>
      <button class="btn" @click="previewFile" :disabled="!selectedFile">
        Предпросмотр
      </button>
    </div>
    <!-- Предпросмотр сэмпла -->
    <div v-if="previewContent" class="preview">
      <h3>Предпросмотр: {{ selectedFile.name }}</h3>
      <pre>{{ previewContent }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Browser',
  data() {
    return {
      files: [
        // Пример файлов, заменить на реальные данные
        { id: 1, name: 'project1.gbproj' },
        { id: 2, name: 'kick.wav' },
        { id: 3, name: 'snare.wav' }
      ],
      selectedFile: null,
      previewContent: ''
    }
  },
  methods: {
    selectFile(file) {
      this.selectedFile = file
      this.previewContent = ''
    },
    loadFile() {
      // TODO: Реализовать загрузку выбранного файла
      alert(`Загрузка файла: ${this.selectedFile.name}`)
    },
    saveFile() {
      // TODO: Реализовать сохранение проекта
      alert('Сохранение проекта...')
    },
    previewFile() {
      // TODO: Реализовать предпросмотр файла (например, показать содержимое или проиграть аудио)
      this.previewContent = 'Демо содержимое файла...'
    }
  }
}
</script>

<style scoped>
.browser {
  background: var(--surface-color, #2d2d2d);
  border: 1px solid var(--border-color, #444);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.file-item {
  padding: 0.5rem 1rem;
  background: var(--bg-color, #1a1a1a);
  border: 1px solid var(--border-color, #444);
  border-radius: 4px;
  color: var(--text-color, #fff);
  cursor: pointer;
  transition: background 0.2s;
}

.file-item.selected {
  background: var(--primary-color, #007bff);
  color: #fff;
  border-color: var(--primary-color, #007bff);
}

.browser-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color, #444);
  background-color: transparent;
  color: var(--text-color, #fff);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-primary {
  background-color: var(--primary-color, #007bff);
  border-color: var(--primary-color, #007bff);
  color: white;
}

.btn-secondary {
  background-color: var(--secondary-color, #6c757d);
  border-color: var(--secondary-color, #6c757d);
  color: white;
}

.preview {
  background: var(--bg-color, #1a1a1a);
  border: 1px solid var(--border-color, #444);
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
  color: var(--text-color, #fff);
}
</style>