# UI component makefile
#
# This component provides the user interface functionality for the GrooveBoxe ESP32 firmware.
# It includes display management, input handling, and menu system.

COMPONENT_ADD_INCLUDEDIRS := include
COMPONENT_PRIV_INCLUDEDIRS := private_include

COMPONENT_SRCS := \
    display_manager.c \
    input_manager.c \
    menu_system.c \
    screens/main_screen.c \
    screens/sequencer_screen.c \
    screens/channel_params_screen.c \
    screens/menu_screen.c \
    screens/browser_screen.c \
    screens/audio_params_screen.c

# Component dependencies
COMPONENT_DEPENDS := drivers utils

# Compiler flags
CFLAGS += -O2
CXXFLAGS += -O2

# Include paths
COMPONENT_PRIV_INCLUDEDIRS += $(COMPONENT_PATH)/screens
