# Utils component makefile
#
# This component provides utility functions for the GrooveBoxe ESP32 firmware.
# It includes math utilities, debug functions, and common helper functions.

COMPONENT_ADD_INCLUDEDIRS := include
COMPONENT_PRIV_INCLUDEDIRS := private_include

COMPONENT_SRCS := \
    math_utils.c \
    debug.c \
    crc_utils.c \
    string_utils.c

# Component dependencies
COMPONENT_DEPENDS :=

# Compiler flags
CFLAGS += -O2
CXXFLAGS += -O2

# Include paths
COMPONENT_ADD_INCLUDEDIRS += $(COMPONENT_PATH)/private_include