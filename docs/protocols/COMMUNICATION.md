# Коммуникационные протоколы GrooveBoxe

## Обзор протоколов

GrooveBoxe использует несколько протоколов для взаимодействия между компонентами системы:

1. **WebSocket Bridge** - связь веб-прототипа с ESP32
2. **UART Protocol** - основной протокол ESP32
3. **I2C Protocol** - управление периферией
4. **SPI Protocol** - работа с SD картой и дисплеем
5. **I2S Protocol** - аудио передача

## 1. WebSocket Bridge Protocol

### Назначение
Протокол для связи веб-прототипа с ESP32 во время разработки и тестирования.

### Формат сообщений
```
{"cmd":"COMMAND_NAME","data":{...},"ts":timestamp}
```

### Команды

#### Аудио команды
- **PLAY** - запуск секвенсора
  ```json
  {"cmd":"PLAY","data":{"bpm":132},"ts":1234567890}
  ```

- **STOP** - остановка секвенсора
  ```json
  {"cmd":"STOP","data":{},"ts":1234567890}
  ```

- **KNOB** - изменение параметра
  ```json
  {"cmd":"KNOB","data":{"id":"volume","val":75},"ts":1234567890}
  ```

#### Управление каналами
- **CH_PARAM** - параметр канала
  ```json
  {"cmd":"CH_PARAM","data":{"ch":0,"id":"pitch","val":50},"ts":1234567890}
  ```

- **STEP_SET** - установка шага
  ```json
  {"cmd":"STEP_SET","data":{"pat":0,"ch":0,"step":15,"on":1},"ts":1234567890}
  ```

#### Системные команды
- **FULL_STATE** - полное состояние системы
  ```json
  {"cmd":"FULL_STATE","data":{"bpm":132,"channels":[...],"patterns":[...]},"ts":1234567890}
  ```

- **REQ_STATE** - запрос состояния
  ```json
  {"cmd":"REQ_STATE","data":{},"ts":1234567890}
  ```

- **HELLO** - приветствие ESP32
  ```json
  {"cmd":"HELLO","data":{"version":"1.0.0"},"ts":1234567890}
  ```

### Обработка ошибок
- Неверный формат: игнорируется
- Неизвестная команда: логируется
- Ошибки данных: возвращается ACK с ошибкой

## 2. UART Protocol

### Назначение
Основной протокол связи ESP32 с внешними устройствами.

### Физический уровень
- Скорость: 115200 baud
- Биты данных: 8
- Стоп биты: 1
- Паритет: none
- Flow control: none

### Формат пакета
```
[START][LEN][CMD][DATA][CRC][END]
```

- START: 0xAA
- LEN: длина данных (1 байт)
- CMD: команда (1 байт)
- DATA: данные (0-255 байт)
- CRC: CRC8 (1 байт)
- END: 0x55

### Команды

#### Системные команды
- 0x01: GET_VERSION
- 0x02: RESET
- 0x03: GET_STATUS

#### Аудио команды
- 0x10: SET_BPM
- 0x11: START_PLAY
- 0x12: STOP_PLAY
- 0x13: SET_MASTER_VOLUME

#### Канальные команды
- 0x20: SET_CHANNEL_PARAM
- 0x21: SET_CHANNEL_SAMPLE
- 0x22: SET_CHANNEL_MUTE
- 0x23: SET_CHANNEL_SOLO

#### Секвенсор команды
- 0x30: SET_STEP
- 0x31: SET_PATTERN
- 0x32: SET_CURRENT_PATTERN
- 0x33: SET_BAR_LENGTH

#### Файловые команды
- 0x40: LIST_FILES
- 0x41: LOAD_SAMPLE
- 0x42: SAVE_PROJECT
- 0x43: LOAD_PROJECT

### Примеры пакетов

#### Установка BPM
```
AA 02 10 84 7F 55
```
- START: AA
- LEN: 02 (2 байта данных)
- CMD: 10 (SET_BPM)
- DATA: 84 (132 BPM)
- CRC: 7F
- END: 55

#### Установка параметра канала
```
AA 04 20 01 05 4B 9A 55
```
- START: AA
- LEN: 04 (4 байта данных)
- CMD: 20 (SET_CHANNEL_PARAM)
- DATA: 01 (канал 1), 05 (параметр pitch), 4B (значение 75)
- CRC: 9A
- END: 55

## 3. I2C Protocol

### Назначение
Управление периферийными устройствами (дисплеи, кодеки).

### Адреса устройств
- SSD1306 OLED: 0x3C
- ILI9341 TFT: 0x2C (команды)
- ES8388 Codec: 0x10
- PCF8574 GPIO: 0x20-0x27

### Формат команд
```
[DEVICE_ADDR][REGISTER][DATA...]
```

### Примеры

#### Инициализация SSD1306
```
0x3C 0x00 0xAE  // Display OFF
0x3C 0x00 0xA8  // Set Mux Ratio
0x3C 0x01 0x3F  // 63 (128x64)
```

#### Управление ES8388
```
0x10 0x02 0x00  // Power down all
0x10 0x02 0x0F  // Power up all
0x10 0x1A 0x18  // Set sample rate 44.1kHz
```

## 4. SPI Protocol

### Назначение
Работа с SD картой и TFT дисплеем.

### Пины
- SCK: GPIO 18
- MOSI: GPIO 23
- MISO: GPIO 19
- CS: GPIO 5 (SD), GPIO 15 (TFT)

### Режимы
- SD Card: Mode 0 (CPOL=0, CPHA=0)
- TFT: Mode 0 (4-wire)

### Команды SD карты
- CMD0: Reset card
- CMD8: Check voltage
- CMD17: Read single block
- CMD24: Write single block
- CMD55: Application specific command
- ACMD41: Initialize card

### Команды TFT
- 0x2A: Set column address
- 0x2B: Set page address
- 0x2C: Write memory
- 0x36: Memory access control

## 5. I2S Protocol

### Назначение
Передача аудио данных на DAC.

### Пины
- BCLK: GPIO 27
- LRCLK: GPIO 26
- DOUT: GPIO 25

### Параметры
- Format: I2S_FORMAT_STAND_I2S
- Sample rate: 44100 Hz
- Bits per sample: 16-bit
- Channel format: I2S_CHANNEL_FMT_RIGHT_LEFT
- Communication format: I2S_COMM_FORMAT_STAND_MSB

### DMA Buffer
- Buffer size: 512 samples
- Buffer count: 2
- Interrupt: half-empty

## 6. Error Handling

### CRC Calculation
```c
uint8_t crc8(uint8_t *data, size_t len) {
    uint8_t crc = 0;
    for (size_t i = 0; i < len; i++) {
        crc ^= data[i];
        for (int j = 0; j < 8; j++) {
            if (crc & 0x80) {
                crc = (crc << 1) ^ 0x07;
            } else {
                crc <<= 1;
            }
        }
    }
    return crc;
}
```

### Timeout Handling
- UART: 100ms timeout
- I2C: 10ms timeout
- SPI: 50ms timeout
- I2S: DMA interrupt based

### Retry Logic
- UART: 3 retries
- I2C: 5 retries
- SPI: 2 retries
- I2S: No retry (real-time)

## 7. Debug Interface

### USB CDC
- Speed: 115200 baud
- Format: 8N1
- Commands:
  - `debug on/off` - включение/выключение отладки
  - `status` - состояние системы
  - `memory` - использование памяти
  - `audio` - статус аудио

### Log Levels
- ERROR: Критические ошибки
- WARN: Предупреждения
- INFO: Информационные сообщения
- DEBUG: Отладочная информация
- TRACE: Детальная трассировка

### Пример лога
```
[INFO] System initialized
[INFO] Audio engine started
[INFO] Display initialized
[DEBUG] Channel 0: sample loaded
[DEBUG] Pattern 0: 16 steps active
[TRACE] Step 0 triggered on channel 0