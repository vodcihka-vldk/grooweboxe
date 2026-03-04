# GrooveBoxe ESP32 Firmware

This directory contains the ESP32-S3 firmware for the GrooveBoxe hardware groovebox sampler.

## Project Structure

```
software/esp32/
├── CMakeLists.txt              # Main project configuration
├── main/
│   ├── CMakeLists.txt          # Main component configuration
│   └── main.c                  # Application entry point
├── components/                 # ESP-IDF components
│   ├── audio/                  # Audio engine and processing
│   │   ├── audio_engine.h      # Audio engine interface
│   │   ├── audio_engine.c      # Audio engine implementation
│   │   ├── sample_player.h     # Sample player interface
│   │   ├── sample_player.c     # Sample player implementation
│   │   ├── effects/            # Audio effects
│   │   │   ├── compressor.h    # Compressor effect
│   │   │   ├── delay.h         # Delay effect
│   │   │   ├── reverb.h        # Reverb effect
│   │   │   └── bitcrusher.h    # Bitcrusher effect
│   │   └── mixer.h             # Audio mixer
│   ├── sequencer/              # Sequencer functionality
│   │   ├── sequencer.h         # Sequencer interface
│   │   ├── sequencer.c         # Sequencer implementation
│   │   ├── pattern_manager.h   # Pattern management
│   │   └── timing.h            # Timing and BPM control
│   ├── ui/                     # User interface
│   │   ├── display_manager.h   # Display management
│   │   ├── input_manager.h     # Input handling
│   │   ├── menu_system.h       # Menu system
│   │   └── screens/            # Screen implementations
│   ├── storage/                # File system and storage
│   │   ├── file_manager.h      # File operations
│   │   ├── project_manager.h   # Project management
│   │   └── sd_card_driver.h    # SD card driver
│   ├── drivers/                # Hardware drivers
│   │   ├── i2s_driver.h        # I2S audio driver
│   │   ├── i2c_driver.h        # I2C driver
│   │   ├── spi_driver.h        # SPI driver
│   │   └── gpio_driver.h       # GPIO driver
│   └── utils/                  # Utility functions
│       ├── math_utils.h        # Math utilities
│       ├── debug.h             # Debug utilities
│       └── crc_utils.h         # CRC utilities
└── build/                      # Build output (auto-generated)
```

## Build Instructions

### Prerequisites

1. Install ESP-IDF (ESP32 Development Framework)
   - Follow the official installation guide: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/index.html

2. Set up the development environment
   ```bash
   # Source the ESP-IDF environment
   source $IDF_PATH/export.sh
   
   # Or add to your shell profile
   echo 'source $IDF_PATH/export.sh' >> ~/.bashrc
   ```

### Building the Firmware

1. Navigate to the project directory
   ```bash
   cd software/esp32
   ```

2. Configure the project
   ```bash
   idf.py set-target esp32s3
   idf.py menuconfig
   ```

3. Build the project
   ```bash
   idf.py build
   ```

4. Flash to device
   ```bash
   idf.py -p /dev/ttyUSB0 flash
   ```

5. Monitor output
   ```bash
   idf.py -p /dev/ttyUSB0 monitor
   ```

## Configuration

The project can be configured using `idf.py menuconfig`. Key configuration options include:

- **Audio Settings**: Sample rate, buffer size, channel count
- **Display Settings**: Display type (OLED/TFT), resolution
- **Storage Settings**: SD card configuration, file system options
- **Debug Settings**: Log levels, performance monitoring
- **Hardware Settings**: GPIO pin assignments, I2C/I2S configuration

## Development

### Adding New Components

1. Create a new directory in `components/`
2. Add a `component.mk` file for build configuration
3. Create header files in `include/` directory
4. Implement functionality in `.c` files
5. Update `CMakeLists.txt` to include the new component

### Audio Processing

The audio engine is designed for real-time processing with the following features:

- **8-channel audio engine** with individual parameter control
- **Real-time effects processing** (compressor, delay, reverb, bitcrusher)
- **I2S audio output** at 44.1kHz, 16-bit
- **DMA-based audio transmission** for low latency
- **PSRAM support** for large sample buffers

### Sequencer

The sequencer provides:

- **8×64 step patterns** with parameter locks
- **8 independent patterns** with pattern chaining
- **Real-time BPM control** (40-200 BPM)
- **Multi-bar support** (1-4 bars per channel)
- **Pattern copying and clearing**

### User Interface

The UI system supports:

- **Multiple display types** (OLED 128×64, TFT 320×240)
- **8 rotary encoders** with push-button functionality
- **24 tactile switches** for sequencer and channel control
- **Hierarchical menu system** for parameter editing
- **Real-time parameter display** and editing

### Storage

File system features:

- **MicroSD card support** (up to 2GB)
- **FAT16 file system** for compatibility
- **Project and pattern file formats**
- **Automatic file organization**
- **File browser interface**

## Debugging

### Logging

The debug system provides multiple log levels:

```c
DEBUG_LOG_ERROR("Critical error occurred");
DEBUG_LOG_WARN("Warning message");
DEBUG_LOG_INFO("Informational message");
DEBUG_LOG_DEBUG("Debug information");
DEBUG_LOG_VERBOSE("Verbose debug output");
```

### Performance Monitoring

Use the timer utilities for performance analysis:

```c
DEBUG_TIMER_START("audio_processing");
// ... audio processing code ...
DEBUG_TIMER_STOP("audio_processing");
float duration = DEBUG_TIMER_DURATION("audio_processing");
```

### Memory Monitoring

Monitor memory usage:

```c
DEBUG_LOG_HEAP();                    // Log heap usage
DEBUG_LOG_STACK(task_handle);      // Log task stack usage
```

## Hardware Integration

### GPIO Pin Assignments

The firmware uses the following GPIO pins:

- **I2S Audio**: GPIO 25 (DIN), 26 (LRCK), 27 (BCLK)
- **I2C Display**: GPIO 21 (SDA), 22 (SCL)
- **SPI Peripherals**: GPIO 18 (SCK), 19 (MISO), 23 (MOSI)
- **Encoders**: GPIO 32-39 (A/B phases and switches)
- **Buttons**: GPIO 2-5, 12-19 (sequencer and channel buttons)
- **SD Card**: GPIO 5 (CS), 2 (detect)

### Power Management

The firmware includes power management features:

- **Dynamic clock scaling** based on audio load
- **Peripheral power gating** when not in use
- **Low-power modes** during idle periods
- **Watchdog timer** for system reliability

## Testing

### Unit Tests

Unit tests are located in the `test/` directory:

```bash
# Run unit tests
idf.py test
```

### Integration Tests

Integration tests verify component interaction:

```bash
# Run integration tests
idf.py integration-test
```

### Hardware Tests

Hardware-specific tests are available:

```bash
# Test audio output
idf.py test-audio

# Test display functionality
idf.py test-display

# Test input handling
idf.py test-input
```

## Contributing

1. Follow the ESP-IDF coding standards
2. Add appropriate documentation for new features
3. Include unit tests for new functionality
4. Update this README for significant changes
5. Use meaningful commit messages

## License

This firmware is licensed under the MIT License. See the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the project repository
- Check the ESP-IDF documentation
- Review the hardware schematics and specifications
- Consult the API documentation in the docs/ directory