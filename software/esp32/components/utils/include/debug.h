/**
 * @file debug.h
 * @brief Debug utilities component header
 * 
 * This file contains the debug utilities component interface for the
 * GrooveBoxe ESP32 firmware. The debug utilities provide logging,
 * performance monitoring, and debugging capabilities.
 */

#ifndef DEBUG_H
#define DEBUG_H

#include <stdint.h>
#include <stdbool.h>
#include <stdarg.h>

// Log levels
typedef enum {
    LOG_LEVEL_NONE = 0,
    LOG_LEVEL_ERROR,
    LOG_LEVEL_WARN,
    LOG_LEVEL_INFO,
    LOG_LEVEL_DEBUG,
    LOG_LEVEL_VERBOSE
} log_level_t;

// Debug callback type
typedef void (*debug_log_callback_t)(log_level_t level, const char* tag, const char* message);

// Debug utilities interface
typedef struct {
    // Logging
    void (*log)(log_level_t level, const char* tag, const char* format, ...);
    void (*log_memory_usage)(void);
    void (*log_performance_counters)(void);
    void (*set_log_level)(log_level_t level);
    void (*dump_state)(void);
    
    // Performance monitoring
    void (*start_timer)(const char* name);
    void (*stop_timer)(const char* name);
    float (*get_timer_duration)(const char* name);
    void (*reset_timers)(void);
    
    // Memory monitoring
    void (*log_heap_usage)(void);
    void (*log_stack_usage)(TaskHandle_t task);
    
    // Error handling
    void (*assert)(bool condition, const char* file, int line, const char* message);
    void (*panic)(const char* message);
    
    // Callback management
    void (*set_log_callback)(debug_log_callback_t callback);
} debug_utils_t;

// Global debug utilities instance
extern debug_utils_t debug;

// Public functions
void debug_log(log_level_t level, const char* tag, const char* format, ...);
void debug_log_memory_usage(void);
void debug_log_performance_counters(void);
void debug_set_log_level(log_level_t level);
void debug_dump_state(void);

// Performance monitoring
void debug_start_timer(const char* name);
void debug_stop_timer(const char* name);
float debug_get_timer_duration(const char* name);
void debug_reset_timers(void);

// Memory monitoring
void debug_log_heap_usage(void);
void debug_log_stack_usage(TaskHandle_t task);

// Error handling
void debug_assert(bool condition, const char* file, int line, const char* message);
void debug_panic(const char* message);

// Callback management
void debug_set_log_callback(debug_log_callback_t callback);

// Utility macros
#define DEBUG_LOG_ERROR(tag, format, ...) \
    debug_log(LOG_LEVEL_ERROR, tag, format, ##__VA_ARGS__)

#define DEBUG_LOG_WARN(tag, format, ...) \
    debug_log(LOG_LEVEL_WARN, tag, format, ##__VA_ARGS__)

#define DEBUG_LOG_INFO(tag, format, ...) \
    debug_log(LOG_LEVEL_INFO, tag, format, ##__VA_ARGS__)

#define DEBUG_LOG_DEBUG(tag, format, ...) \
    debug_log(LOG_LEVEL_DEBUG, tag, format, ##__VA_ARGS__)

#define DEBUG_LOG_VERBOSE(tag, format, ...) \
    debug_log(LOG_LEVEL_VERBOSE, tag, format, ##__VA_ARGS__)

#define DEBUG_ASSERT(condition, message) \
    debug_assert(condition, __FILE__, __LINE__, message)

#define DEBUG_PANIC(message) \
    debug_panic(message)

// Performance macros
#define DEBUG_TIMER_START(name) \
    debug_start_timer(name)

#define DEBUG_TIMER_STOP(name) \
    debug_stop_timer(name)

#define DEBUG_TIMER_DURATION(name) \
    debug_get_timer_duration(name)

// Memory macros
#define DEBUG_LOG_HEAP() \
    debug_log_heap_usage()

#define DEBUG_LOG_STACK(task) \
    debug_log_stack_usage(task)

#endif // DEBUG_H