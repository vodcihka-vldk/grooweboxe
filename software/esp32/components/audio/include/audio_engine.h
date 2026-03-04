/**
 * @file audio_engine.h
 * @brief Audio engine component header
 * 
 * This file contains the audio engine component interface for the
 * GrooveBoxe ESP32 firmware. The audio engine manages all audio
 * channels, effects, and the main audio processing pipeline.
 */

#ifndef AUDIO_ENGINE_H
#define AUDIO_ENGINE_H

#include <stdint.h>
#include <stdbool.h>
#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"

// Audio configuration
#define AUDIO_SAMPLE_RATE 44100
#define AUDIO_BUFFER_SIZE 1024
#define AUDIO_CHANNELS 8
#define AUDIO_BITS_PER_SAMPLE 16

// Channel configuration
#define CHANNEL_BUFFER_SIZE 4096

// Effect types
typedef enum {
    EFFECT_NONE = 0,
    EFFECT_COMPRESSOR,
    EFFECT_DELAY,
    EFFECT_REVERB,
    EFFECT_BITCRUSHER
} effect_type_t;

// Channel parameters structure
typedef struct {
    float volume;           // 0.0 - 1.0
    float pitch;            // -24.0 to +24.0 semitones
    float drive;            // 0.0 - 1.0
    float start;            // 0.0 - 1.0 (start position)
    float length;           // 0.0 - 1.0 (playback length)
    float attack;           // 0.0 - 1.0 (attack time)
    float decay;            // 0.0 - 1.0 (decay time)
    uint8_t sample_index;   // Sample selection
    bool muted;             // Channel mute state
    bool soloed;            // Channel solo state
} channel_params_t;

// Step data structure for parameter locks
typedef struct {
    bool active;
    channel_params_t locks;  // Parameter overrides for this step
} step_data_t;

// Effect parameters
typedef struct {
    effect_type_t type;
    union {
        struct {
            float threshold;    // -60 to 0 dB
            float ratio;        // 1.0 to 20.0
            float attack;       // 0.1 to 100 ms
            float release;      // 10 to 1000 ms
            float knee;         // 0 to 24 dB
        } compressor;
        
        struct {
            float time;         // 1 to 2000 ms
            float feedback;     // 0.0 to 0.95
            float mix;          // 0.0 to 1.0
            bool sync_to_bpm;   // Sync to BPM
        } delay;
        
        struct {
            float decay_time;   // 0.1 to 10.0 s
            float room_size;    // 0.0 to 1.0
            float damping;      // 0.0 to 1.0
            float wet_dry;      // 0.0 to 1.0
        } reverb;
        
        struct {
            uint8_t bit_depth;  // 4 to 16 bits
            float sample_rate_reduction; // 1.0 to 16.0
        } bitcrusher;
    };
} effect_params_t;

// Master effect parameters
typedef struct {
    effect_params_t effects[4];  // Up to 4 master effects
    float master_volume;         // 0.0 - 1.0
} master_effect_params_t;

// Audio engine interface
typedef struct {
    // Initialization
    bool (*init)(void);
    void (*deinit)(void);
    
    // Channel management
    void (*set_channel_param)(uint8_t channel, const channel_params_t* params);
    channel_params_t (*get_channel_param)(uint8_t channel);
    void (*trigger_step)(uint8_t channel, const step_data_t* step);
    void (*mute_channel)(uint8_t channel, bool mute);
    void (*solo_channel)(uint8_t channel, bool solo);
    
    // Master controls
    void (*set_master_volume)(float volume);
    void (*set_bpm)(uint16_t bpm);
    void (*set_master_effect)(const master_effect_params_t* params);
    
    // Processing
    void (*process_audio)(float* buffer, size_t samples);
    void (*start)(void);
    void (*stop)(void);
    
    // Status
    bool (*is_playing)(void);
    uint16_t (*get_bpm)(void);
} audio_engine_t;

// Global audio engine instance
extern audio_engine_t audio_engine;

// Public functions
bool audio_engine_init(void);
void audio_engine_deinit(void);
void audio_engine_process(void);
void audio_engine_start(void);
void audio_engine_stop(void);
bool audio_engine_is_playing(void);

// Channel control functions
void audio_set_channel_param(uint8_t channel, const channel_params_t* params);
channel_params_t audio_get_channel_param(uint8_t channel);
void audio_trigger_step(uint8_t channel, const step_data_t* step);
void audio_mute_channel(uint8_t channel, bool mute);
void audio_solo_channel(uint8_t channel, bool solo);

// Master control functions
void audio_set_master_volume(float volume);
void audio_set_bpm(uint16_t bpm);
void audio_set_master_effect(const master_effect_params_t* params);

// Utility functions
float audio_db_to_linear(float db);
float audio_linear_to_db(float linear);
float audio_clamp(float value, float min, float max);

#endif // AUDIO_ENGINE_H