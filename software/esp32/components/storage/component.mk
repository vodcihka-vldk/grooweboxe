# Storage component makefile
#
# This component provides the file system and storage functionality for the GrooveBoxe ESP32 firmware.
# It includes SD card management, file operations, and project management.

COMPONENT_ADD_INCLUDEDIRS := include
COMPONENT_PRIV_INCLUDEDIRS := private_include

COMPONENT_SRCS := \
    file_manager.c \
    project_manager.c \
    pattern_manager.c \
    sd_card_driver.c

# Component dependencies
COMPONENT_DEPENDS := drivers utils

# Compiler flags
CFLAGS += -O2
CXXFLAGS += -O2

# Include paths
COMPONENT_ADD_INCLUDEDIRS += $(COMPONENT_PATH)/private_include