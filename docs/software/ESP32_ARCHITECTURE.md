# Программная архитектура ESP32

## Общая структура прошивки

```
src/
├── main.cpp              # Главная функция и инициализация
├── audio/                # Аудио подсистема
│   ├── audio_engine.cpp  # Основной аудио движок
│   ├── audio_engine.h
│   ├── mixer.cpp         # Микшер каналов
│   ├── mixer.h
│   ├── effects/          # Аудио эффекты
│   │   ├── compressor.cpp
│   │   ├── delay.cpp
│   │   ├── reverb.cpp
│   │   └── bitcrusher.cpp
│   └── sample_player.cpp # Проигрыватель сэмплов
├── sequencer/            # Секвенсор
│   ├── sequencer.cpp     # Движок секвенсора
│   ├── sequencer.h
│   ├── pattern.cpp       # Работа с паттернами
│   └── pattern.h
├── ui/                   # Пользовательский интерфейс
│   ├── display.cpp       # Дисплейный вывод
│   ├── display.h
│   ├── input.cpp         # Обработка ввода
│   ├── input.h
│   ├── menu.cpp          # Меню системы
│   └── menu.h
├── storage/              # Система хранения
│   ├── sd_card.cpp       # Работа с SD картой
│   ├── sd_card.h
│   ├── file_manager.cpp  # Файловый менеджер
│   └── file_manager.h
├── drivers/              # Драйверы периферии
│   ├── i2s_driver.cpp    # I2S драйвер
│   ├── i2c_driver.cpp    # I2C драйвер
│   ├── spi_driver.cpp    # SPI драйвер
│   └── gpio_driver.cpp   # GPIO драйвер
└── utils/                # Утилиты
    ├── crc.cpp           # CRC вычисления
    ├── math_utils.cpp    # Математические функции
    └── debug.cpp         # Отладочные функции
```

## 1. Главный модуль (main.cpp)

### Инициализация системы
```cpp
void setup() {
    // Инициализация периферии
    init_gpio();
    init_i2c();
    init_spi();
    init_i2s();
    
    // Инициализация подсистем
    init_storage();
    init_ui();
    init_audio();
    init_sequencer();
    
    // Загрузка сохраненного состояния
    load_state();
    
    // Запуск задач
    xTaskCreatePinnedToCore(audio_task, "audio", 8192, NULL, 5, NULL, 1);
    xTaskCreatePinnedToCore(sequencer_task, "sequencer", 4096, NULL, 4, NULL, 0);
    xTaskCreatePinnedToCore(ui_task, "ui", 4096, NULL, 3, NULL, 0);
}
```

### Архитектура задач
- **Audio Task** (Core 1): Высокоприоритетная аудио обработка
- **Sequencer Task** (Core 0): Секвенсор и тайминг
- **UI Task** (Core 0): Интерфейс и ввод

## 2. Аудио подсистема

### Audio Engine (audio_engine.cpp)

**Основные функции:**
- Управление 8 каналами
- Смешивание каналов
- Применение эффектов
- Вывод на I2S

**Архитектура:**
```cpp
class AudioEngine {
private:
    Channel channels[8];
    Mixer mixer;
    EffectsBus effects;
    I2SOutput output;
    
public:
    void process_audio();
    void set_channel_param(int ch, const ChannelParams& params);
    void trigger_step(int ch, const StepData& step);
};
```

### Channel (канал)

**Структура канала:**
```cpp
struct Channel {
    SamplePlayer player;
    ChannelParams params;
    bool muted;
    bool soloed;
    int sample_index;
    std::vector<uint8_t> sample_data;
};
```

**ChannelParams:**
```cpp
struct ChannelParams {
    float volume;      // 0.0 - 1.0
    float pitch;       // -24 to +24 semitones
    float drive;       // 0.0 - 1.0
    float start;       // 0.0 - 1.0
    float length;      // 0.0 - 1.0
    float attack;      // 0.0 - 1.0
    float decay;       // 0.0 - 1.0
};
```

### Sample Player

**Функции:**
- Загрузка сэмплов с SD карты
- Воспроизведение с параметрами
- Циклическое воспроизведение
- Pitch shifting

**Оптимизации:**
- DMA буферизация
- Кэширование сэмплов
- Интерполяция для pitch shifting

### Effects (эффекты)

**Доступные эффекты:**
- Compressor (компрессор)
- Delay (задержка)
- Reverb (реверберация)
- Bitcrusher (бит-крашер)

**Эффект-шин:**
```cpp
class EffectsBus {
private:
    Compressor compressor;
    Delay delay;
    Reverb reverb;
    Bitcrusher bitcrusher;
    
public:
    void process(float* buffer, size_t samples);
    void set_effect_params(const EffectParams& params);
};
```

## 3. Секвенсор

### Sequencer Engine

**Основные функции:**
- Управление 8 каналами × 64 шагами
- Поддержка 8 паттернов
- Смена паттернов в реальном времени
- Функция FUNC для изменения длины баров

**Структура данных:**
```cpp
struct Step {
    bool active;
    ChannelParams locks;  // Параметры для этого шага
};

struct Pattern {
    Step steps[8][64];           // 8 каналов × 64 шага
    uint8_t channel_max_bars[8]; // Длина каждого канала
    std::string label;
    ChannelParams channel_settings[8];
};

class Sequencer {
private:
    Pattern patterns[8];
    uint8_t current_pattern;
    uint8_t current_step;
    uint32_t step_timer;
    
public:
    void start();
    void stop();
    void next_step();
    void set_pattern(uint8_t pattern);
};
```

### Тайминг

**Расчет тайминга:**
```cpp
// 16-я нота = 60000ms / BPM / 4
uint32_t step_interval = (60000 * 1000) / (bpm * 4);

// Использование hardware timer
hw_timer_t *timer = timerBegin(0, 80, true);  // 1MHz
timerAttachInterrupt(timer, &on_step, true);
timerAlarmWrite(timer, step_interval, true);
timerAlarmEnable(timer);
```

## 4. Пользовательский интерфейс

### Display Manager

**Поддержка дисплеев:**
- SSD1306 OLED 128x64
- ILI9341 TFT 320x240

**Функции:**
```cpp
class DisplayManager {
private:
    DisplayInterface* display;
    UIState current_state;
    
public:
    void draw_main_screen();
    void draw_menu();
    void draw_sequencer();
    void draw_channel_params();
    void update();
};
```

### Input Manager

**Обработка ввода:**
```cpp
class InputManager {
private:
    std::vector<Encoder> encoders;
    std::vector<Button> buttons;
    
public:
    void scan_inputs();
    void handle_encoder(int encoder_id, int delta);
    void handle_button(int button_id, bool pressed);
    InputEvent get_next_event();
};
```

### Menu System

**Иерархия меню:**
```
Main Menu
├── Mastering
│   ├── Low EQ
│   ├── High EQ
│   ├── Comp Thresh
│   ├── Comp Ratio
│   └── Saturation
├── System
│   ├── Save Project
│   ├── Load Project
│   └── Settings
└── Help
```

## 5. Система хранения

### File Manager

**Функции:**
- Работа с FAT16 на SD карте
- Загрузка сэмплов
- Сохранение проектов
- Управление папками

**Форматы файлов:**
```cpp
// Проект (.grv)
struct Project {
    uint32_t version;
    uint8_t current_pattern;
    uint16_t bpm;
    MasterParams master;
    MasteringParams mastering;
    ChannelParams channels[8];
    Pattern patterns[8];
};

// Паттерн (.ptrn)
struct PatternFile {
    Step steps[8][64];
    uint8_t channel_max_bars[8];
    std::string label;
};
```

### SD Card Driver

**Использование ESP-IDF:**
```cpp
class SDCard {
private:
    sdmmc_host_t host;
    sdmmc_card_t* card;
    
public:
    bool mount();
    bool unmount();
    File open_file(const char* path);
    bool read_file(File file, uint8_t* buffer, size_t size);
    bool write_file(File file, const uint8_t* buffer, size_t size);
};
```

## 6. Драйверы периферии

### I2S Driver

**Конфигурация:**
```cpp
i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
    .sample_rate = 44100,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .dma_buf_count = 2,
    .dma_buf_len = 512,
    .use_apll = false,
    .tx_desc_auto_clear = true,
    .fixed_mclk = 0
};
```

### I2C Driver

**Для дисплеев и кодеков:**
```cpp
class I2CDriver {
private:
    i2c_port_t port;
    
public:
    bool init(int sda_pin, int scl_pin, uint32_t frequency);
    bool write_byte(uint8_t device_addr, uint8_t reg, uint8_t data);
    bool read_byte(uint8_t device_addr, uint8_t reg, uint8_t* data);
};
```

## 7. Архитектурные паттерны

### Observer Pattern

**Для обновления UI:**
```cpp
class Observer {
public:
    virtual void on_state_change(const State& state) = 0;
};

class Subject {
private:
    std::vector<Observer*> observers;
    
public:
    void attach(Observer* observer);
    void detach(Observer* observer);
    void notify(const State& state);
};
```

### State Machine

**Для управления режимами:**
```cpp
enum class SystemState {
    IDLE,
    PLAYING,
    RECORDING,
    MENU,
    BROWSER
};

class StateMachine {
private:
    SystemState current_state;
    
public:
    void transition(SystemState new_state);
    void handle_event(Event event);
};
```

### Command Pattern

**Для обработки пользовательских действий:**
```cpp
class Command {
public:
    virtual void execute() = 0;
    virtual void undo() = 0;
};

class SetBPMCommand : public Command {
private:
    uint16_t new_bpm;
    uint16_t old_bpm;
    
public:
    void execute() override;
    void undo() override;
};
```

## 8. Оптимизации производительности

### Memory Management

**Использование PSRAM:**
```cpp
// Выделение буферов в PSRAM
uint8_t* audio_buffer = (uint8_t*)ps_malloc(buffer_size);
uint8_t* sample_buffer = (uint8_t*)heap_caps_malloc(sample_size, MALLOC_CAP_SPIRAM);
```

### CPU Optimization

**Использование DSP инструкций:**
```cpp
// Для аудио обработки
#include "esp_dsp.h"
void process_audio_dsp(float* input, float* output, size_t length) {
    dsps_add_f32_ansi(input, output, output, length, 1, 1, 1);
}
```

### Power Management

**Режимы энергосбережения:**
```cpp
// Deep Sleep для экономии энергии
esp_sleep_enable_timer_wakeup(1000000);  // 1 секунда
esp_deep_sleep_start();
```

## 9. Отладка и тестирование

### Logging System

**Использование ESP-IDF logging:**
```cpp
#include "esp_log.h"
static const char* TAG = "AUDIO";

ESP_LOGI(TAG, "Audio engine started");
ESP_LOGD(TAG, "Buffer underrun detected");
ESP_LOGE(TAG, "I2S error: %d", error_code);
```

### Unit Testing

**Использование CMocka:**
```cpp
void test_audio_engine_init(void** state) {
    AudioEngine engine;
    assert_true(engine.init());
}

void test_sequencer_timing(void** state) {
    Sequencer seq;
    seq.set_bpm(120);
    assert_int_equal(seq.get_step_interval(), 125000); // microseconds
}
```

### Profiling

**Измерение производительности:**
```cpp
uint32_t start = esp_timer_get_time();
// Код для профилирования
uint32_t end = esp_timer_get_time();
ESP_LOGI(TAG, "Execution time: %d μs", end - start);
```

## 10. Безопасность и надежность

### Error Handling

**Обработка ошибок:**
```cpp
enum class ErrorCode {
    OK,
    OUT_OF_MEMORY,
    FILE_NOT_FOUND,
    I2S_ERROR,
    SD_ERROR
};

class Result {
private:
    ErrorCode code;
    std::string message;
    
public:
    static Result success();
    static Result error(ErrorCode code, const std::string& msg);
    bool is_ok() const;
};
```

### Watchdog

**Защита от зависаний:**
```cpp
#include "esp_task_wdt.h"

void setup() {
    esp_task_wdt_init(30, true);  // 30 секунд
    esp_task_wdt_add(NULL);       // Добавить текущую задачу
}

void loop() {
    // Работа задачи
    esp_task_wdt_reset();  // Сбросить watchdog
}
```

Эта архитектура обеспечивает модульность, производительность и надежность системы, позволяя легко расширять функциональность и поддерживать код.