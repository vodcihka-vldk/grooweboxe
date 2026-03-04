/**
 * @file display_manager.h
 * @brief Display manager component header
 * 
 * This file contains the display manager component interface for the
 * GrooveBoxe ESP32 firmware. The display manager handles all display
 * operations and screen management.
 */

#ifndef DISPLAY_MANAGER_H
#define DISPLAY_MANAGER_H

#include <stdint.h>
#include <stdbool.h>
#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"

// Display types
typedef enum {
    DISPLAY_TYPE_NONE = 0,
    DISPLAY_TYPE_OLED,
    DISPLAY_TYPE_TFT
} display_type_t;

// Screen types
typedef enum {
    SCREEN_MAIN = 0,
    SCREEN_SEQUENCER,
    SCREEN_CHANNEL_PARAMS,
    SCREEN_MENU,
    SCREEN_BROWSER,
    SCREEN_AUDIO_PARAMS
} screen_type_t;

// Font sizes
typedef enum {
    FONT_SMALL = 0,
    FONT_NORMAL,
    FONT_LARGE
} font_size_t;

// Display interface structure
typedef struct {
    // Initialization
    bool (*init)(display_type_t type);
    void (*deinit)(void);
    
    // Screen management
    void (*set_screen)(screen_type_t screen);
    void (*update)(void);
    void (*clear)(void);
    
    // Drawing functions
    void (*draw_text)(int x, int y, const char* text, font_size_t size);
    void (*draw_rectangle)(int x, int y, int w, int h, bool filled);
    void (*draw_line)(int x1, int y1, int x2, int y2);
    void (*draw_circle)(int x, int y, int radius, bool filled);
    void (*draw_progress_bar)(int x, int y, int width, float value);
    
    // Screen-specific functions
    void (*draw_main_screen)(void);
    void (*draw_sequencer_screen)(void);
    void (*draw_channel_params_screen)(void);
    void (*draw_menu_screen)(void);
    void (*draw_browser_screen)(void);
    void (*draw_audio_params_screen)(void);
    
    // Display properties
    int (*get_width)(void);
    int (*get_height)(void);
    int (*get_color_depth)(void);
} display_interface_t;

// Display manager interface
typedef struct {
    // Initialization
    bool (*init)(display_type_t type);
    void (*deinit)(void);
    
    // Screen management
    void (*set_screen)(screen_type_t screen);
    void (*update)(void);
    void (*clear)(void);
    
    // Drawing functions
    void (*draw_text)(int x, int y, const char* text, font_size_t size);
    void (*draw_rectangle)(int x, int y, int w, int h, bool filled);
    void (*draw_line)(int x1, int y1, int x2, int y2);
    void (*draw_circle)(int x, int y, int radius, bool filled);
    void (*draw_progress_bar)(int x, int y, int width, float value);
    
    // Screen-specific functions
    void (*draw_main_screen)(void);
    void (*draw_sequencer_screen)(void);
    void (*draw_channel_params_screen)(void);
    void (*draw_menu_screen)(void);
    void (*draw_browser_screen)(void);
    void (*draw_audio_params_screen)(void);
    
    // Properties
    screen_type_t (*get_current_screen)(void);
    int (*get_width)(void);
    int (*get_height)(void);
    int (*get_color_depth)(void);
} display_manager_t;

// Global display manager instance
extern display_manager_t display_manager;

// Public functions
bool display_manager_init(display_type_t type);
void display_manager_deinit(void);
void display_manager_set_screen(screen_type_t screen);
void display_manager_update(void);
void display_manager_clear(void);

// Drawing functions
void display_draw_text(int x, int y, const char* text, font_size_t size);
void display_draw_rectangle(int x, int y, int w, int h, bool filled);
void display_draw_line(int x1, int y1, int x2, int y2);
void display_draw_circle(int x, int y, int radius, bool filled);
void display_draw_progress_bar(int x, int y, int width, float value);

// Screen-specific functions
void display_draw_main_screen(void);
void display_draw_sequencer_screen(void);
void display_draw_channel_params_screen(void);
void display_draw_menu_screen(void);
void display_draw_browser_screen(void);
void display_draw_audio_params_screen(void);

// Properties
screen_type_t display_get_current_screen(void);
int display_get_width(void);
int display_get_height(void);
int display_get_color_depth(void);

// Utility functions
void display_format_time(char* buffer, size_t size, uint32_t milliseconds);
void display_format_bpm(char* buffer, size_t size, uint16_t bpm);
void display_format_volume(char* buffer, size_t size, float volume);

#endif // DISPLAY_MANAGER_H