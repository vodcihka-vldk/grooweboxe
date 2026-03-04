/**
 * @file file_manager.h
 * @brief File manager component header
 * 
 * This file contains the file manager component interface for the
 * GrooveBoxe ESP32 firmware. The file manager handles all file
 * system operations and project management.
 */

#ifndef FILE_MANAGER_H
#define FILE_MANAGER_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

// File modes
typedef enum {
    FILE_MODE_READ = 0,
    FILE_MODE_WRITE,
    FILE_MODE_APPEND
} file_mode_t;

// File information structure
typedef struct {
    char name[64];
    size_t size;
    bool is_directory;
    uint32_t last_modified;
} file_info_t;

// Project structure
typedef struct {
    uint32_t version;
    uint8_t current_pattern;
    uint16_t bpm;
    char name[64];
    char author[64];
    char description[256];
    uint32_t creation_date;
    uint32_t last_modified;
} project_info_t;

// Pattern structure
typedef struct {
    uint8_t steps[8][64];           // 8 channels × 64 steps
    uint8_t channel_max_bars[8];    // Max bars per channel (1-4)
    char label[32];                 // Pattern name
    uint16_t bpm;                   // Pattern BPM
} pattern_data_t;

// File manager interface
typedef struct {
    // Initialization
    bool (*mount_sd_card)(void);
    void (*unmount_sd_card)(void);
    
    // File operations
    void* (*open_file)(const char* path, file_mode_t mode);
    void (*close_file)(void* file);
    size_t (*read_file)(void* file, uint8_t* buffer, size_t size);
    size_t (*write_file)(void* file, const uint8_t* buffer, size_t size);
    bool (*delete_file)(const char* path);
    bool (*file_exists)(const char* path);
    
    // Directory operations
    bool (*create_directory)(const char* path);
    bool (*remove_directory)(const char* path);
    bool (*list_directory)(const char* path, file_info_t* files, size_t* count);
    
    // Project operations
    bool (*save_project)(const project_info_t* project, const char* filename);
    bool (*load_project)(const char* filename, project_info_t* project);
    bool (*save_pattern)(const pattern_data_t* pattern, const char* filename);
    bool (*load_pattern)(const char* filename, pattern_data_t* pattern);
    
    // Utility functions
    bool (*get_free_space)(const char* path, size_t* free_bytes);
    bool (*get_total_space)(const char* path, size_t* total_bytes);
    bool (*format_sd_card)(void);
} file_manager_t;

// Global file manager instance
extern file_manager_t file_manager;

// Public functions
bool file_manager_mount_sd_card(void);
void file_manager_unmount_sd_card(void);

// File operations
void* file_manager_open_file(const char* path, file_mode_t mode);
void file_manager_close_file(void* file);
size_t file_manager_read_file(void* file, uint8_t* buffer, size_t size);
size_t file_manager_write_file(void* file, const uint8_t* buffer, size_t size);
bool file_manager_delete_file(const char* path);
bool file_manager_file_exists(const char* path);

// Directory operations
bool file_manager_create_directory(const char* path);
bool file_manager_remove_directory(const char* path);
bool file_manager_list_directory(const char* path, file_info_t* files, size_t* count);

// Project operations
bool file_manager_save_project(const project_info_t* project, const char* filename);
bool file_manager_load_project(const char* filename, project_info_t* project);
bool file_manager_save_pattern(const pattern_data_t* pattern, const char* filename);
bool file_manager_load_pattern(const char* filename, pattern_data_t* pattern);

// Utility functions
bool file_manager_get_free_space(const char* path, size_t* free_bytes);
bool file_manager_get_total_space(const char* path, size_t* total_bytes);
bool file_manager_format_sd_card(void);

// File path utilities
bool file_manager_is_valid_filename(const char* filename);
bool file_manager_is_project_file(const char* filename);
bool file_manager_is_pattern_file(const char* filename);
void file_manager_get_project_path(char* buffer, size_t size, const char* filename);
void file_manager_get_pattern_path(char* buffer, size_t size, const char* filename);

// Project validation
bool file_manager_validate_project(const project_info_t* project);
bool file_manager_validate_pattern(const pattern_data_t* pattern);

#endif // FILE_MANAGER_H