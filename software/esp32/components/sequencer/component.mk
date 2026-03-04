# Sequencer component makefile
#
# This component provides the sequencer functionality for the GrooveBoxe ESP32 firmware.
# It includes pattern management, timing, and step-based sequencing.

COMPONENT_ADD_INCLUDEDIRS := include
COMPONENT_PRIV_INCLUDEDIRS := private_include

COMPONENT_SRCS := \
    sequencer.c \
    pattern_manager.c \
    timing.c

# Component dependencies
COMPONENT_DEPENDS := utils

# Compiler flags
CFLAGS += -O2
CXXFLAGS += -O2

# Include paths
COMPONENT_PRIV_INCLUDEDIRS += $(COMPONENT_PATH)/private_include
