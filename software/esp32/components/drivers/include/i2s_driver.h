/**
 * @file i2s_driver.h
 * @brief I2S driver component header
 * 
 * This file contains the I2S driver component interface for the
 * GrooveBoxe ESP32 firmware. The I2S driver handles audio data
 * transmission to the DAC.
 */

#ifndef I2S_DRIVER_H
#define I2S_DRIVER_H

#include <stdint.h>
#include <stdbool.h>
#include "driver/i2s.h"

// I2S configuration
#define I2S_SAMPLE_RATE 44100
#define I2S_BUFFER_SIZE 1024
#define I2S_CHANNELS 2
#define I2S_BITS_PER_SAMPLE I2S_BITS_PER_SAMPLE_16BIT

// I2S pins configuration
#define I2S_PIN_BCK 27
#define I2S_PIN_WS 26
#define I2S_PIN_DATA 25

// I2S driver interface
typedef struct {
    // Initialization
    bool (*init)(const i2s_config_t* config);
    void (*deinit)(void);
    
    // Control
    bool (*start)(void);
    void (*stop)(void);
    bool (*set_sample_rate)(uint32_t sample_rate);
    bool (*set_volume)(float volume);
    
    // Data transmission
    bool (*write)(const uint8_t* data, size_t size);
    bool (*write_buffer)(const int16_t* left, const int16_t* right, size_t samples);
    
    // Status
    bool (*is_running)(void);
    uint32_t (*get_sample_rate)(void);
    size_t (*get_buffer_size)(void);
} i2s_driver_t;

// Global I2S driver instance
extern i2s_driver_t i2s_driver;

// Public functions
bool i2s_driver_init(const i2s_config_t* config);
void i2s_driver_deinit(void);
bool i2s_driver_start(void);
void i2s_driver_stop(void);
bool i2s_driver_set_sample_rate(uint32_t sample_rate);
bool i2s_driver_set_volume(float volume);
bool i2s_driver_write(const uint8_t* data, size_t size);
bool i2s_driver_write_buffer(const int16_t* left, const int16_t* right, size_t samples);
bool i2s_driver_is_running(void);
uint32_t i2s_driver_get_sample_rate(void);
size_t i2s_driver_get_buffer_size(void);

// Default configuration
const i2s_config_t* i2s_driver_get_default_config(void);

// Utility functions
void i2s_driver_convert_float_to_int16(const float* input, int16_t* output, size_t samples);
void i2s_driver_convert_stereo_to_mono(const int16_t* left, const int16_t* right, int16_t* output, size_t samples);

#endif // I2S_DRIVER_H