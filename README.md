# GrooveBoxe - ESP32 Groovebox Sampler

Проект создания аппаратного groovebox sampler на базе ESP32 с веб-прототипом для разработки.

## Архитектура проекта

```
GrooweBoxe/
├── docs/                    # Архитектурная документация
│   ├── hardware/           # Спецификации компонентов
│   ├── software/           # Программная архитектура
│   ├── protocols/          # Коммуникационные протоколы
│   └── api/               # API документация
├── hardware/               # Схемы и печатные платы
│   ├── schematics/        # Электрические схемы
│   └── pcb/              # Печатные платы
├── software/               # Исходный код
│   ├── esp32/            # Прошивка для ESP32
│   └── web/              # Веб-прототип
├── prototypes/             # Прототипы и тесты
└── grooweboxe.html        # Веб-прототип
```

## Технические характеристики

- **Процессор**: ESP32-S3 (240MHz, 512KB SRAM, 384KB SRAM)
- **Память**: 4MB PSRAM для сэмплов
- **Аудио**: I2S DAC, 44.1kHz, 16-bit
- **Каналы**: 8 одновременных голосов
- **Хранение**: MicroSD карта до 2GB
- **Дисплей**: SSD1306 OLED 128x64 или ILI9341 TFT 320x240
- **Управление**: 8 энкодеров, 24 кнопки
- **Питание**: USB 5V

## Разработка

### Предварительные требования

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **Git**
- **Python** ≥ 3.8 (для ESP32)
- **ESP-IDF** (для прошивки ESP32)

### Веб-прототип

Веб-интерфейс находится в каталоге `software/web/` и реализован на Vue 3 + Vite.

#### Установка

```bash
cd software/web
npm install
```

#### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:3000/`

#### Сборка для production

```bash
npm run build
```

Готовая сборка будет в каталоге `dist/`

#### Структура веб-прототипа

```
software/web/
├── src/
│   ├── components/       # Vue компоненты (Sequencer, Browser, AudioParams, ChannelParams)
│   ├── utils/           # Утилиты (audioEngine, communicationManager, storageManager)
│   ├── App.vue          # Корневой компонент
│   └── main.js          # Инициализация приложения
├── index.html           # HTML точка входа
├── package.json         # Зависимости проекта
└── vite.config.js       # Конфигурация Vite
```

### Прошивка ESP32

Исходный код прошивки находится в `software/esp32/`.

#### Установка ESP-IDF

Следуйте официальной документации: https://docs.espressif.com/projects/esp-idf/

#### Сборка прошивки

```bash
cd software/esp32
idf.py build
```

#### Загрузка на устройство

```bash
idf.py -p /dev/ttyUSB0 flash monitor
```

Замените `/dev/ttyUSB0` на ваш последовательный порт.

### Аппаратное обеспечение

- Схемы находятся в `hardware/schematics/`
- Компоновка печатной платы в `hardware/pcb/`
- Спецификации компонентов в `docs/hardware/SPECIFICATIONS.md`

### Документация

- Архитектура проекта: `docs/ARCHITECTURE.md`
- API документация: `docs/api/API_REFERENCE.md`
- Протоколы коммуникации: `docs/protocols/COMMUNICATION.md`
- Спецификация ПО ESP32: `docs/software/ESP32_ARCHITECTURE.md`
- Спецификация аппаратного обеспечения: `docs/hardware/SPECIFICATIONS.md`

### Разработка

#### Создание новых компонентов Vue

Создавайте новые компоненты в `software/web/src/components/` с расширением `.vue`.

Пример структуры компонента:

```vue
<template>
  <div class="my-component">
    <!-- Шаблон HTML -->
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  data() {
    return {
      // Состояние
    }
  },
  methods: {
    // Методы
  }
}
</script>

<style scoped>
/* Стили */
</style>
```

#### Использование хранилища (Vuex)

Для доступа к глобальному состоянию используйте `this.$store`:

```javascript
// Получение состояния
this.$store.state.bpm

// Commit мутации
this.$store.commit('SET_BPM', 140)

// Dispatch экшена
this.$store.dispatch('initAudioEngine')

// Использование getter
this.$store.getters.currentChannel
```

#### Работа с аудио

Используйте `AudioEngine` для работы с Web Audio API:

```javascript
import { AudioEngine } from '../utils/audioEngine'

const engine = new AudioEngine()
await engine.init()
engine.setBPM(120)
engine.playSample(0) // Проиграть сэмпл канала 0
```

#### Коммуникация с ESP32

Используйте `CommunicationManager` для взаимодействия с аппаратным устройством:

```javascript
import { CommunicationManager } from '../utils/communicationManager'

const comm = new CommunicationManager()
await comm.connect()
await comm.setBPM(120)
```

#### Хранение проектов

Используйте `StorageManager` для работы с проектами и сэмплами:

```javascript
import { StorageManager } from '../utils/storageManager'

const storage = new StorageManager()
await storage.init()
const project = storage.createNewProject('My Project')
await storage.saveProject(project)
```

### Тестирование

Для запуска тестов используйте:

```bash
npm run test
```

### Отладка

Используйте встроенные инструменты разработки браузера для отладки Vite приложения (F12 или Ctrl+Shift+I).

Для отладки ESP32 используйте встроенный монитор:

```bash
idf.py monitor
```

## Статус

- [x] Веб-прототип (функциональный)
- [ ] Архитектурная документация
- [ ] Прошивка ESP32
- [ ] Аппаратная часть
- [ ] Сборка устройства

## План изменений для веб-интерфейса GrooweBoxe

1. Реализовать полноценный UI для секвенсора (Sequencer.vue):
   - Отображение 8 каналов, матрица шагов (8×64), управление параметрами, кнопки воспроизведения/стоп, BPM, выбор паттерна.
2. Реализовать браузер файлов (Browser.vue):
   - Список файлов, загрузка/сохранение проектов, предпросмотр сэмплов.
3. Реализовать экран аудио-параметров (AudioParams.vue):
   - Настройки эффектов (компрессор, реверб, дилей, биткрашер), выбор эффектов для каналов.
4. Реализовать экран параметров канала (ChannelParams.vue):
   - Настройки громкости, панорамы, выбор сэмпла, индивидуальные эффекты.
5. Обеспечить стилизацию согласно макету (темные тона, современный UI, акцентные цвета).
6. Проверить работу всех экранов и навигацию.

_Комментарии и документация на русском языке согласно .clinerules/communication-style.md_
