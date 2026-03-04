/**
 * @file sequencer.h
 * @brief Sequencer component header
 * 
 * This file contains the sequencer component interface for the
 * GrooveBoxe ESP32 firmware. The sequencer manages pattern playback,
 * timing, and step-based sequencing.
 */

#ifndef SEQUENCER_H
#define SEQUENCER_H

#include <stdint.h>
#include <stdbool.h>
#include "freertos/FreeRTOS.h"
#include "freertos/timers.h"

// Sequencer configuration
#define SEQUENCER_PATTERNS 8
#define SEQUENCER_STEPS 64
#define SEQUENCER_CHANNELS 8
#define MAX_BARS 4

// Step structure
typedef struct {
    bool active;
    float param_locks[8];  // Parameter locks for this step
} step_t;

// Channel configuration
typedef struct {
    uint8_t max_bars;      // 1-4 bars
    uint8_t current_bar;   // Current bar in pattern
    uint8_t steps_per_bar; // Steps per bar (16 for 4/4 time)
    bool muted;            // Channel mute state
    bool soloed;           // Channel solo state
} channel_config_t;

// Pattern structure
typedef struct {
    step_t steps[SEQUENCER_CHANNELS][SEQUENCER_STEPS];
    channel_config_t channel_config[SEQUENCER_CHANNELS];
    char label[32];        // Pattern name
    uint16_t bpm;          // Pattern BPM
} pattern_t;

// Sequencer state
typedef enum {
    SEQ_STOPPED = 0,
    SEQ_PLAYING,
    SEQ_PAUSED
} sequencer_state_t;

// Sequencer interface
typedef struct {
    // Initialization
    bool (*init)(void);
    void (*deinit)(void);
    
    // Pattern management
    void (*set_pattern)(uint8_t pattern_index);
    uint8_t (*get_current_pattern)(void);
    void (*set_step)(uint8_t channel, uint8_t step, bool active);
    void (*set_step_params)(uint8_t channel, uint8_t step, float* params);
    bool (*get_step)(uint8_t channel, uint8_t step);
    
    // Timing
    void (*set_bpm)(uint16_t bpm);
    void (*set_bar_length)(uint8_t channel, uint8_t bars);
    uint8_t (*get_bar_length)(uint8_t channel);
    
    // Playback control
    void (*start)(void);
    void (*stop)(void);
    void (*pause)(void);
    void (*resume)(void);
    bool (*is_playing)(void);
    
    // Pattern operations
    void (*copy_pattern)(uint8_t source, uint8_t destination);
    void (*clear_pattern)(uint8_t pattern);
    void (*set_pattern_label)(uint8_t pattern, const char* label);
    
    // Current position
    uint8_t (*get_current_step)(void);
    uint8_t (*get_current_channel)(void);
    uint16_t (*get_current_bpm)(void);
} sequencer_t;

// Global sequencer instance
extern sequencer_t sequencer;

// Public functions
bool sequencer_init(void);
void sequencer_deinit(void);
void sequencer_process(void);
void sequencer_start(void);
void sequencer_stop(void);
void sequencer_pause(void);
void sequencer_resume(void);
bool sequencer_is_playing(void);

// Pattern management
void sequencer_set_pattern(uint8_t pattern_index);
uint8_t sequencer_get_current_pattern(void);
void sequencer_set_step(uint8_t channel, uint8_t step, bool active);
void sequencer_set_step_params(uint8_t channel, uint8_t step, float* params);
bool sequencer_get_step(uint8_t channel, uint8_t step);

// Timing control
void sequencer_set_bpm(uint16_t bpm);
void sequencer_set_bar_length(uint8_t channel, uint8_t bars);
uint8_t sequencer_get_bar_length(uint8_t channel);

// Pattern operations
void sequencer_copy_pattern(uint8_t source, uint8_t destination);
void sequencer_clear_pattern(uint8_t pattern);
void sequencer_set_pattern_label(uint8_t pattern, const char* label);

// Position queries
uint8_t sequencer_get_current_step(void);
uint8_t sequencer_get_current_channel(void);
uint16_t sequencer_get_current_bpm(void);

// Internal functions (for audio engine)
bool sequencer_check_step_trigger(uint8_t channel, uint8_t step);
void sequencer_advance_step(void);

#endif // SEQUENCER_H