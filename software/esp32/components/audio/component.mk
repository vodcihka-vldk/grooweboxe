# Audio component makefile
#
# This component provides the audio engine for the GrooveBoxe ESP32 firmware.
# It includes audio processing, effects, and channel management.

COMPONENT_ADD_INCLUDEDIRS := include
COMPONENT_PRIV_INCLUDEDIRS := private_include

COMPONENT_SRCS := \
    audio_engine.c \
    sample_player.c \
    effects/compressor.c \
    effects/delay.c \
    effects/reverb.c \
    effects/bitcrusher.c \
    mixer.c

COMPONENT_ADD_LDFLAGS += -lm

# Component dependencies
COMPONENT_DEPENDS := drivers utils

# Compiler flags
CFLAGS += -O3 -ffast-math
CXXFLAGS += -O3 -ffast-math

# Include paths
COMPONENT_PRIV_INCLUDEDIRS += $(COMPONENT_PATH)/effects
