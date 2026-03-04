/**
 * @file main.c
 * @brief Main application entry point for GrooveBoxe ESP32 firmware
 * 
 * This file contains the main application logic for the GrooveBoxe
 * hardware groovebox sampler based on ESP32-S3.
 */

#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "esp_log.h"
#include "esp_system.h"
#include "nvs_flash.h"

// Component includes
#include "audio_engine.h"
#include "sequencer.h"
#include "display_manager.h"
#include "input_manager.h"
#include "file_manager.h"
#include "debug.h"

// Configuration
#define MAIN_TAG "MAIN"

// Task handles
static TaskHandle_t audio_task_handle = NULL;
static TaskHandle_t sequencer_task_handle = NULL;
static TaskHandle_t ui_task_handle = NULL;

// Function prototypes
static void audio_task(void *pvParameters);
static void sequencer_task(void *pvParameters);
static void ui_task(void *pvParameters);
static esp_err_t initialize_system(void);

/**
 * @brief Main application entry point
 */
void app_main(void)
{
    ESP_LOGI(MAIN_TAG, "Starting GrooveBoxe ESP32 firmware...");
    
    // Initialize system components
    esp_err_t ret = initialize_system();
    if (ret != ESP_OK) {
        ESP_LOGE(MAIN_TAG, "Failed to initialize system: %s", esp_err_to_name(ret));
        return;
    }
    
    ESP_LOGI(MAIN_TAG, "System initialized successfully");
    
    // Create tasks
    xTaskCreatePinnedToCore(
        audio_task,
        "audio_task",
        8192,
        NULL,
        tskIDLE_PRIORITY + 5,
        &audio_task_handle,
        0  // Run on core 0
    );
    
    xTaskCreatePinnedToCore(
        sequencer_task,
        "sequencer_task", 
        4096,
        NULL,
        tskIDLE_PRIORITY + 3,
        &sequencer_task_handle,
        1  // Run on core 1
    );
    
    xTaskCreatePinnedToCore(
        ui_task,
        "ui_task",
        4096,
        NULL,
        tskIDLE_PRIORITY + 1,
        &ui_task_handle,
        1  // Run on core 1
    );
    
    ESP_LOGI(MAIN_TAG, "All tasks created successfully");
}

/**
 * @brief Audio processing task
 * @param pvParameters Task parameters
 */
static void audio_task(void *pvParameters)
{
    ESP_LOGI(MAIN_TAG, "Starting audio task");
    
    // Initialize audio engine
    if (!audio_engine_init()) {
        ESP_LOGE(MAIN_TAG, "Failed to initialize audio engine");
        vTaskDelete(NULL);
        return;
    }
    
    audio_engine_start();
    
    while (1) {
        // Process audio in real-time
        audio_engine_process();
        
        // Small delay to prevent 100% CPU usage
        vTaskDelay(pdMS_TO_TICKS(1));
    }
}

/**
 * @brief Sequencer task
 * @param pvParameters Task parameters
 */
static void sequencer_task(void *pvParameters)
{
    ESP_LOGI(MAIN_TAG, "Starting sequencer task");
    
    // Initialize sequencer
    if (!sequencer_init()) {
        ESP_LOGE(MAIN_TAG, "Failed to initialize sequencer");
        vTaskDelete(NULL);
        return;
    }
    
    sequencer_start();
    
    while (1) {
        // Process sequencer logic
        sequencer_process();
        
        // Check for pattern changes, BPM changes, etc.
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}

/**
 * @brief User interface task
 * @param pvParameters Task parameters
 */
static void ui_task(void *pvParameters)
{
    ESP_LOGI(MAIN_TAG, "Starting UI task");
    
    // Initialize UI components
    if (!display_manager_init(DISPLAY_TYPE_OLED)) {
        ESP_LOGE(MAIN_TAG, "Failed to initialize display manager");
        vTaskDelete(NULL);
        return;
    }
    
    if (!input_manager_init()) {
        ESP_LOGE(MAIN_TAG, "Failed to initialize input manager");
        vTaskDelete(NULL);
        return;
    }
    
    // Main UI loop
    while (1) {
        // Update display
        display_manager_update();
        
        // Process input events
        input_manager_scan();
        
        // Handle menu navigation, parameter changes, etc.
        vTaskDelay(pdMS_TO_TICKS(16));  // ~60 FPS
    }
}

/**
 * @brief Initialize system components
 * @return ESP_OK on success, error code otherwise
 */
static esp_err_t initialize_system(void)
{
    esp_err_t ret = ESP_OK;
    
    // Initialize NVS
    ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NEW_VERSION_DETECTED) {
        ESP_LOGI(MAIN_TAG, "NVS partition was truncated, retrying...");
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    if (ret != ESP_OK) {
        ESP_LOGE(MAIN_TAG, "Failed to initialize NVS");
        return ret;
    }
    
    // Initialize file system
    if (!file_manager_mount_sd_card()) {
        ESP_LOGE(MAIN_TAG, "Failed to mount SD card");
        return ESP_FAIL;
    }
    
    // Initialize debug system
    debug_set_log_level(LOG_LEVEL_INFO);
    
    ESP_LOGI(MAIN_TAG, "System initialization complete");
    return ESP_OK;
}