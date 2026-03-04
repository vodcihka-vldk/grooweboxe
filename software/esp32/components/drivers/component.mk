# Drivers component makefile
#
# This component provides the hardware drivers for the GrooveBoxe ESP32 firmware.
# It includes I2S, I2C, SPI, and other peripheral drivers.

COMPONENT_ADD_INCLUDEDIRS := include
COMPONENT_PRIV_INCLUDEDIRS := private_include

COMPONENT_SRCS := \
    i2s_driver.c \
    i2c_driver.c \
    spi_driver.c \
    gpio_driver.c \
    timer_driver.c

# Component dependencies
COMPONENT_DEPENDS :=

# Compiler flags
CFLAGS += -O3
CXXFLAGS += -O3

# Include paths
COMPONENT_ADD_INCLUDEDIRS += $(COMPONENT_PATH)/private_include