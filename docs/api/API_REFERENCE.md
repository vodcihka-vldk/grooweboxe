# API Reference GrooveBoxe

## Overview

This document describes the API interfaces for the GrooveBoxe ESP32 firmware. The API is organized into modules corresponding to the main subsystems of the device.

## Audio API

### AudioEngine

Main audio processing engine that manages all audio channels and effects.

```cpp
class AudioEngine {
public:
    // Initialization
    bool init();
    void deinit();
    
    // Channel management
    void set_channel_param(uint8_t channel, const ChannelParams& params);
    ChannelParams get_channel_param(uint8_t channel);
    void trigger_step(uint8_t channel, const StepData& step);
    void mute_channel(uint8_t channel, bool mute);
    void solo_channel(uint8_t channel, bool solo);
    
    // Master controls
    void set_master_volume(float volume);
    void set_bpm(uint16_t bpm);
    void set_master_effect(const MasterEffectParams& params);
    
    // Processing
    void process_audio(float* buffer, size_t samples);
    void start();
    void stop();
    
private:
    Channel channels[8];
    Mixer mixer;
    EffectsBus effects;
    I2SOutput output;
    uint16_t current_bpm;
};
```

### ChannelParams

Parameters for individual audio channels.

```cpp
struct ChannelParams {
    float volume;      // 0.0 - 1.0
    float pitch;       // -24.0 to +24.0 semitones
    float drive;       // 0.0 - 1.0
    float start;       // 0.0 - 1.0 (start position)
    float length;      // 0.0 - 1.0 (playback length)
    float attack;      // 0.0 - 1.0 (attack time)
    float decay;       // 0.0 - 1.0 (decay time)
    uint8_t sample_index; // Sample selection
};
```

### StepData

Data structure for sequencer steps with parameter locks.

```cpp
struct StepData {
    bool active;
    ChannelParams locks;  // Parameter overrides for this step
};
```

### SamplePlayer

Handles sample loading and playback.

```cpp
class SamplePlayer {
public:
    bool load_sample(const char* filename);
    bool load_sample_from_buffer(const uint8_t* data, size_t size);
    void play(const ChannelParams& params);
    void stop();
    bool is_playing();
    size_t get_sample_length();
    void set_loop(bool enable);
    
private:
    uint8_t* sample_data;
    size_t sample_size;
    bool loop_enabled;
    bool playing;
};
```

### Effects API

#### Compressor

Dynamic range compressor effect.

```cpp
class Compressor {
public:
    void set_threshold(float threshold_db);  // -60 to 0 dB
    void set_ratio(float ratio);             // 1.0 to 20.0
    void set_attack(float attack_ms);        // 0.1 to 100 ms
    void set_release(float release_ms);      // 10 to 1000 ms
    void set_knee(float knee_db);            // 0 to 24 dB
    void process(float* buffer, size_t samples);
};
```

#### Delay

Echo/delay effect.

```cpp
class Delay {
public:
    void set_time(float time_ms);            // 1 to 2000 ms
    void set_feedback(float feedback);       // 0.0 to 0.95
    void set_mix(float dry_wet);             // 0.0 to 1.0
    void set_sync_to_bpm(bool sync);
    void process(float* buffer, size_t samples);
};
```

#### Reverb

Reverberation effect.

```cpp
class Reverb {
public:
    void set_decay_time(float time_s);       // 0.1 to 10.0 s
    void set_room_size(float size);          // 0.0 to 1.0
    void set_damping(float damping);         // 0.0 to 1.0
    void set_wet_dry(float wet_dry);         // 0.0 to 1.0
    void process(float* buffer, size_t samples);
};
```

#### Bitcrusher

Digital distortion effect.

```cpp
class Bitcrusher {
public:
    void set_bit_depth(uint8_t bits);        // 4 to 16 bits
    void set_sample_rate_reduction(float factor); // 1.0 to 16.0
    void process(float* buffer, size_t samples);
};
```

## Sequencer API

### Sequencer

Main sequencer engine.

```cpp
class Sequencer {
public:
    // Initialization
    bool init();
    void deinit();
    
    // Pattern management
    void set_pattern(uint8_t pattern_index);
    uint8_t get_current_pattern();
    void set_step(uint8_t channel, uint8_t step, bool active);
    void set_step_params(uint8_t channel, uint8_t step, const ChannelParams& params);
    bool get_step(uint8_t channel, uint8_t step);
    
    // Timing
    void set_bpm(uint16_t bpm);
    void set_bar_length(uint8_t channel, uint8_t bars);  // 1-4 bars
    uint8_t get_bar_length(uint8_t channel);
    
    // Playback control
    void start();
    void stop();
    void pause();
    void resume();
    bool is_playing();
    
    // Pattern operations
    void copy_pattern(uint8_t source, uint8_t destination);
    void clear_pattern(uint8_t pattern);
    void set_pattern_label(uint8_t pattern, const char* label);
    
private:
    Pattern patterns[8];
    uint8_t current_pattern;
    uint8_t current_step;
    uint32_t step_timer;
    bool playing;
};
```

### Pattern

Pattern data structure.

```cpp
struct Pattern {
    Step steps[8][64];           // 8 channels × 64 steps
    uint8_t channel_max_bars[8]; // Max bars per channel (1-4)
    char label[32];              // Pattern name
    ChannelParams channel_settings[8]; // Channel parameters
};
```

## UI API

### DisplayManager

Handles all display operations.

```cpp
class DisplayManager {
public:
    // Initialization
    bool init(DisplayType type);
    void deinit();
    
    // Screen management
    void set_screen(ScreenType screen);
    void update();
    void clear();
    
    // Drawing functions
    void draw_text(int x, int y, const char* text, FontSize size = FONT_NORMAL);
    void draw_rectangle(int x, int y, int w, int h, bool filled = false);
    void draw_line(int x1, int y1, int x2, int y2);
    void draw_circle(int x, int y, int radius, bool filled = false);
    void draw_progress_bar(int x, int y, int width, float value);
    
    // Screen-specific functions
    void draw_main_screen();
    void draw_sequencer_screen();
    void draw_channel_params_screen();
    void draw_menu_screen();
    void draw_browser_screen();
    
private:
    DisplayInterface* display;
    ScreenType current_screen;
};
```

### InputManager

Handles all input devices.

```cpp
class InputManager {
public:
    // Initialization
    bool init();
    void deinit();
    
    // Scanning
    void scan();
    
    // Encoder handling
    void set_encoder_callback(uint8_t encoder_id, EncoderCallback callback);
    int get_encoder_position(uint8_t encoder_id);
    bool is_encoder_pressed(uint8_t encoder_id);
    
    // Button handling
    void set_button_callback(uint8_t button_id, ButtonCallback callback);
    bool is_button_pressed(uint8_t button_id);
    bool is_button_held(uint8_t button_id);
    
    // Event handling
    InputEvent get_next_event();
    void clear_events();
    
private:
    std::vector<Encoder> encoders;
    std::vector<Button> buttons;
    std::queue<InputEvent> event_queue;
};
```

### MenuSystem

Hierarchical menu system.

```cpp
class MenuSystem {
public:
    // Navigation
    void enter_menu();
    void exit_menu();
    void navigate_up();
    void navigate_down();
    void navigate_back();
    void select_item();
    
    // Menu management
    void add_menu_item(const MenuItem& item);
    void remove_menu_item(uint8_t index);
    void set_menu_callback(MenuCallback callback);
    
    // State
    bool is_in_menu();
    MenuItem get_current_item();
    uint8_t get_menu_depth();
    
private:
    std::vector<Menu> menu_stack;
    MenuCallback callback;
};
```

## Storage API

### FileManager

File system operations.

```cpp
class FileManager {
public:
    // Initialization
    bool mount_sd_card();
    bool unmount_sd_card();
    
    // File operations
    File open_file(const char* path, FileMode mode);
    void close_file(File file);
    size_t read_file(File file, uint8_t* buffer, size_t size);
    size_t write_file(File file, const uint8_t* buffer, size_t size);
    bool delete_file(const char* path);
    bool file_exists(const char* path);
    
    // Directory operations
    bool create_directory(const char* path);
    bool remove_directory(const char* path);
    std::vector<FileInfo> list_directory(const char* path);
    
    // Project operations
    bool save_project(const Project& project, const char* filename);
    bool load_project(const char* filename, Project& project);
    bool save_pattern(const Pattern& pattern, const char* filename);
    bool load_pattern(const char* filename, Pattern& pattern);
    
private:
    sdmmc_card_t* card;
};
```

### Project

Project data structure.

```cpp
struct Project {
    uint32_t version;
    uint8_t current_pattern;
    uint16_t bpm;
    MasterParams master;
    MasteringParams mastering;
    ChannelParams channels[8];
    Pattern patterns[8];
    char name[64];
    char author[64];
    char description[256];
};
```

## Driver API

### I2SDriver

I2S audio interface driver.

```cpp
class I2SDriver {
public:
    bool init(const I2SConfig& config);
    void deinit();
    bool start();
    void stop();
    bool write(const uint8_t* data, size_t size);
    bool set_sample_rate(uint32_t sample_rate);
    bool set_volume(float volume);
    
private:
    i2s_port_t port;
    I2SConfig config;
};
```

### I2CDriver

I2C communication driver.

```cpp
class I2CDriver {
public:
    bool init(int sda_pin, int scl_pin, uint32_t frequency);
    void deinit();
    bool write_byte(uint8_t device_addr, uint8_t reg, uint8_t data);
    bool read_byte(uint8_t device_addr, uint8_t reg, uint8_t* data);
    bool write_buffer(uint8_t device_addr, uint8_t reg, const uint8_t* data, size_t length);
    bool read_buffer(uint8_t device_addr, uint8_t reg, uint8_t* data, size_t length);
    
private:
    i2c_port_t port;
};
```

### SPIDriver

SPI communication driver.

```cpp
class SPIDriver {
public:
    bool init(int sck_pin, int mosi_pin, int miso_pin, int cs_pin);
    void deinit();
    bool transfer(const uint8_t* tx_data, uint8_t* rx_data, size_t length);
    bool set_frequency(uint32_t frequency);
    
private:
    spi_device_handle_t device_handle;
};
```

## Utility API

### MathUtils

Mathematical utility functions.

```cpp
class MathUtils {
public:
    static float db_to_linear(float db);
    static float linear_to_db(float linear);
    static float clamp(float value, float min, float max);
    static float lerp(float a, float b, float t);
    static float smoothstep(float edge0, float edge1, float x);
    static uint32_t crc32(const uint8_t* data, size_t length);
    static uint8_t crc8(const uint8_t* data, size_t length);
};
```

### Debug

Debug and logging utilities.

```cpp
class Debug {
public:
    static void log(LogLevel level, const char* tag, const char* format, ...);
    static void log_memory_usage();
    static void log_performance_counters();
    static void set_log_level(LogLevel level);
    static void dump_state();
    
    // Performance monitoring
    static void start_timer(const char* name);
    static void stop_timer(const char* name);
    static float get_timer_duration(const char* name);
    
private:
    static LogLevel current_level;
    static std::map<std::string, uint32_t> timers;
};
```

## Error Handling

### Error Codes

```cpp
enum class ErrorCode {
    OK = 0,
    OUT_OF_MEMORY,
    FILE_NOT_FOUND,
    FILE_READ_ERROR,
    FILE_WRITE_ERROR,
    I2S_ERROR,
    I2C_ERROR,
    SPI_ERROR,
    SD_ERROR,
    INVALID_PARAMETER,
    NOT_IMPLEMENTED,
    TIMEOUT
};

class Result {
public:
    static Result success();
    static Result error(ErrorCode code, const std::string& message = "");
    
    bool is_ok() const;
    ErrorCode get_code() const;
    const std::string& get_message() const;
    
private:
    ErrorCode code;
    std::string message;
};
```

## Callback Types

```cpp
// Input callbacks
typedef void (*EncoderCallback)(uint8_t encoder_id, int delta);
typedef void (*ButtonCallback)(uint8_t button_id, bool pressed);

// Menu callbacks
typedef void (*MenuCallback)(uint8_t menu_id, uint8_t item_id);

// Audio callbacks
typedef void (*AudioCallback)(float* buffer, size_t samples);

// File callbacks
typedef void (*FileCallback)(const char* filename, bool success);
```

## Usage Examples

### Basic Audio Setup

```cpp
// Initialize audio engine
AudioEngine audio;
audio.init();

// Set channel parameters
ChannelParams params;
params.volume = 0.8f;
params.pitch = 0.0f;  // No pitch shift
params.attack = 0.1f;
params.decay = 0.5f;
audio.set_channel_param(0, params);

// Start audio processing
audio.start();
```

### Sequencer Control

```cpp
// Initialize sequencer
Sequencer seq;
seq.init();
seq.set_bpm(120);

// Set up pattern
seq.set_step(0, 0, true);   // Channel 0, step 0, active
seq.set_step(0, 4, true);   // Channel 0, step 4, active

// Start playback
seq.start();
```

### File Operations

```cpp
// Mount SD card
FileManager fm;
fm.mount_sd_card();

// Save project
Project project;
// ... fill project data ...
fm.save_project(project, "my_project.grv");

// Load sample
SamplePlayer player;
player.load_sample("/samples/kick.wav");
```

This API provides a comprehensive interface for controlling all aspects of the GrooveBoxe hardware, from audio processing to user interface and file management.