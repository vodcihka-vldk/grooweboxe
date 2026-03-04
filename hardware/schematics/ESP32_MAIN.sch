# ESP32-S3 Main Controller Schematic
# GrooveBoxe ESP32-S3 WROOM-1-N8

## ESP32-S3 Module (U1)
# ESP32-S3-WROOM-1-N8
# 48-pin LGA module

U1 ESP32-S3-WROOM-1-N8
    1 VDD_3P3_RTC_IO
    2 VDD_3P3_RTC_IO
    3 VDD_3P3_RTC_IO
    4 VDD_3P3_RTC_IO
    5 VDD_3P3_RTC_IO
    6 VDD_3P3_RTC_IO
    7 VDD_3P3_RTC_IO
    8 VDD_3P3_RTC_IO
    9 VDD_3P3_RTC_IO
    10 VDD_3P3_RTC_IO
    11 VDD_3P3_RTC_IO
    12 VDD_3P3_RTC_IO
    13 VDD_3P3_RTC_IO
    14 VDD_3P3_RTC_IO
    15 VDD_3P3_RTC_IO
    16 VDD_3P3_RTC_IO
    17 VDD_3P3_RTC_IO
    18 VDD_3P3_RTC_IO
    19 VDD_3P3_RTC_IO
    20 VDD_3P3_RTC_IO
    21 VDD_3P3_RTC_IO
    22 VDD_3P3_RTC_IO
    23 VDD_3P3_RTC_IO
    24 VDD_3P3_RTC_IO
    25 VDD_3P3_RTC_IO
    26 VDD_3P3_RTC_IO
    27 VDD_3P3_RTC_IO
    28 VDD_3P3_RTC_IO
    29 VDD_3P3_RTC_IO
    30 VDD_3P3_RTC_IO
    31 VDD_3P3_RTC_IO
    32 VDD_3P3_RTC_IO
    33 VDD_3P3_RTC_IO
    34 VDD_3P3_RTC_IO
    35 VDD_3P3_RTC_IO
    36 VDD_3P3_RTC_IO
    37 VDD_3P3_RTC_IO
    38 VDD_3P3_RTC_IO
    39 VDD_3P3_RTC_IO
    40 VDD_3P3_RTC_IO
    41 VDD_3P3_RTC_IO
    42 VDD_3P3_RTC_IO
    43 VDD_3P3_RTC_IO
    44 VDD_3P3_RTC_IO
    45 VDD_3P3_RTC_IO
    46 VDD_3P3_RTC_IO
    47 VDD_3P3_RTC_IO
    48 VDD_3P3_RTC_IO

## Power Connections
# Digital Power (3.3V)
NET 3.3V_DIGITAL
    U1 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48

# Ground
NET GND
    U1 GND_pins

## Crystal Oscillator
# 40MHz Main Crystal
Y1 40MHz_CRYSTAL
    1 GPIO_45
    2 GPIO_44

# Load Capacitors
C1 22pF
    1 GPIO_45
    2 GND

C2 22pF
    1 GPIO_44
    2 GND

## Flash Memory (W25Q64)
# 8MB SPI Flash
U2 W25Q64JVSSIQ
    1 /CS
    2 DO (IO1)
    3 /WP (IO2)
    4 GND
    5 DI (IO0)
    6 CLK
    7 /HOLD (IO3)
    8 VCC

# Flash Power
NET 3.3V_DIGITAL
    U2 8

NET GND
    U2 4

# Flash SPI Signals
NET FLASH_CS
    U1 SPI_CS0
    U2 1

NET FLASH_DO
    U1 SPI_Q
    U2 2

NET FLASH_WP
    U1 SPI_WP
    U2 3

NET FLASH_DI
    U1 SPI_D
    U2 5

NET FLASH_CLK
    U1 SPI_CLK
    U2 6

NET FLASH_HOLD
    U1 SPI_HD
    U2 7

# Flash Pull-up Resistors
R1 10k
    1 FLASH_CS
    2 3.3V_DIGITAL

R2 10k
    1 FLASH_DO
    2 3.3V_DIGITAL

R3 10k
    1 FLASH_WP
    2 3.3V_DIGITAL

R4 10k
    1 FLASH_DI
    2 3.3V_DIGITAL

R5 10k
    1 FLASH_HOLD
    2 3.3V_DIGITAL

## PSRAM (ESP-PSRAM64H)
# 8MB PSRAM
U3 ESP-PSRAM64H
    1 VDDQ
    2 SIO_3
    3 SIO_2
    4 SIO_1
    5 SIO_0
    6 GND
    7 CS
    8 SCK
    9 GND
    10 VDD

# PSRAM Power
NET 3.3V_DIGITAL
    U3 1,10

NET GND
    U3 6,9

# PSRAM QSPI Signals
NET PSRAM_CS
    U1 QSPI_CS0
    U3 7

NET PSRAM_SCK
    U1 QSPI_CLK
    U3 8

NET PSRAM_SIO0
    U1 QSPI_D
    U3 5

NET PSRAM_SIO1
    U1 QSPI_Q
    U3 4

NET PSRAM_SIO2
    U1 QSPI_WP
    U3 3

NET PSRAM_SIO3
    U1 QSPI_HD
    U3 2

# PSRAM Pull-up Resistors
R6 10k
    1 PSRAM_CS
    2 3.3V_DIGITAL

R7 10k
    1 PSRAM_SIO0
    2 3.3V_DIGITAL

R8 10k
    1 PSRAM_SIO1
    2 3.3V_DIGITAL

R9 10k
    1 PSRAM_SIO2
    2 3.3V_DIGITAL

R10 10k
    1 PSRAM_SIO3
    2 3.3V_DIGITAL

## Enable and Reset
# Enable Pin with RC Delay
R11 10k
    1 VBUS_IN
    2 EN_DELAY

C3 100nF
    1 EN_DELAY
    2 GND

NET ESP32_EN
    EN_DELAY
    U1 EN

# Reset Button
SW1 TACTILE_SWITCH
    1 3.3V_DIGITAL
    2 RESET_BTN

R12 10k
    1 RESET_BTN
    2 GND

NET ESP32_RESET
    RESET_BTN
    U1 RESET

## USB Interface
# USB D+ and D-
NET USB_D_PLUS
    U1 USB_D+
    J1 D_PLUS

NET USB_D_MINUS
    U1 USB_D-
    J1 D_MINUS

# USB Pull-up Resistors
R13 1.5k
    1 USB_D_PLUS
    2 3.3V_DIGITAL

## I2S Audio Interface
# I2S Signals to PCM5102A
NET I2S_BCLK
    U1 GPIO27
    U4 BCK

NET I2S_LRCLK
    U1 GPIO26
    U4 LRCK

NET I2S_DATA
    U1 GPIO25
    U4 DIN

## I2C Interface
# I2C for Display and Peripherals
NET I2C_SCL
    U1 GPIO22
    U5 SCL

NET I2C_SDA
    U1 GPIO21
    U5 SDA

# I2C Pull-up Resistors
R14 4.7k
    1 I2C_SCL
    2 3.3V_DIGITAL

R15 4.7k
    1 I2C_SDA
    2 3.3V_DIGITAL

## SPI Interface
# SPI for TFT Display and SD Card
NET SPI_SCK
    U1 GPIO18
    U6 SCK
    U7 SCK

NET SPI_MOSI
    U1 GPIO23
    U6 MOSI
    U7 MOSI

NET SPI_MISO
    U1 GPIO19
    U6 MISO
    U7 MISO

NET SPI_CS_TFT
    U1 GPIO15
    U6 CS

NET SPI_CS_SD
    U1 GPIO5
    U7 CS

## GPIO Assignments for Encoders and Buttons
# Encoder 1 (Channel Select)
NET ENC1_A
    U1 GPIO34
    ENC1_A

NET ENC1_B
    U1 GPIO35
    ENC1_B

NET ENC1_SW
    U1 GPIO39
    ENC1_SW

# Encoder 2 (Volume)
NET ENC2_A
    U1 GPIO32
    ENC2_A

NET ENC2_B
    U1 GPIO33
    ENC2_B

NET ENC2_SW
    U1 GPIO25
    ENC2_SW

# Encoder 3 (Pitch)
NET ENC3_A
    U1 GPIO26
    ENC3_A

NET ENC3_B
    U1 GPIO27
    ENC3_B

NET ENC3_SW
    U1 GPIO14
    ENC3_SW

# Encoder 4 (Drive)
NET ENC4_A
    U1 GPIO12
    ENC4_A

NET ENC4_B
    U1 GPIO13
    ENC4_B

NET ENC4_SW
    U1 GPIO15
    ENC4_SW

# Encoder 5 (Start)
NET ENC5_A
    U1 GPIO2
    ENC5_A

NET ENC5_B
    U1 GPIO4
    ENC5_B

NET ENC5_SW
    U1 GPIO16
    ENC5_SW

# Encoder 6 (Length)
NET ENC6_A
    U1 GPIO17
    ENC6_A

NET ENC6_B
    U1 GPIO5
    ENC6_B

NET ENC6_SW
    U1 GPIO18
    ENC6_SW

# Encoder 7 (Attack)
NET ENC7_A
    U1 GPIO19
    ENC7_A

NET ENC7_B
    U1 GPIO21
    ENC7_B

NET ENC7_SW
    U1 GPIO22
    ENC7_SW

# Encoder 8 (Decay)
NET ENC8_A
    U1 GPIO23
    ENC8_A

NET ENC8_B
    U1 GPIO36
    ENC8_B

NET ENC8_SW
    U1 GPIO39
    ENC8_SW

## Button Matrix
# Sequencer Buttons (16)
NET SEQ_BTN_0
    U1 GPIO32
    SEQ0

NET SEQ_BTN_1
    U1 GPIO33
    SEQ1

NET SEQ_BTN_2
    U1 GPIO25
    SEQ2

NET SEQ_BTN_3
    U1 GPIO26
    SEQ3

NET SEQ_BTN_4
    U1 GPIO27
    SEQ4

NET SEQ_BTN_5
    U1 GPIO14
    SEQ5

NET SEQ_BTN_6
    U1 GPIO12
    SEQ6

NET SEQ_BTN_7
    U1 GPIO13
    SEQ7

NET SEQ_BTN_8
    U1 GPIO15
    SEQ8

NET SEQ_BTN_9
    U1 GPIO2
    SEQ9

NET SEQ_BTN_10
    U1 GPIO4
    SEQ10

NET SEQ_BTN_11
    U1 GPIO16
    SEQ11

NET SEQ_BTN_12
    U1 GPIO17
    SEQ12

NET SEQ_BTN_13
    U1 GPIO5
    SEQ13

NET SEQ_BTN_14
    U1 GPIO18
    SEQ14

NET SEQ_BTN_15
    U1 GPIO19
    SEQ15

# Channel Buttons (8)
NET CH_BTN_0
    U1 GPIO21
    CH0

NET CH_BTN_1
    U1 GPIO22
    CH1

NET CH_BTN_2
    U1 GPIO23
    CH2

NET CH_BTN_3
    U1 GPIO36
    CH3

NET CH_BTN_4
    U1 GPIO39
    CH4

NET CH_BTN_5
    U1 GPIO34
    CH5

NET CH_BTN_6
    U1 GPIO35
    CH6

NET CH_BTN_7
    U1 GPIO32
    CH7

## Test Points
TP1 TP_3V3_DIGITAL
    1 3.3V_DIGITAL

TP2 TP_GND
    1 GND

TP3 TP_ESP32_EN
    1 ESP32_EN

TP4 TP_ESP32_RESET
    1 ESP32_RESET

TP5 TP_I2S_BCLK
    1 I2S_BCLK

TP6 TP_I2S_LRCLK
    1 I2S_LRCLK

TP7 TP_I2S_DATA
    1 I2S_DATA

TP8 TP_I2C_SCL
    1 I2C_SCL

TP9 TP_I2C_SDA
    1 I2C_SDA

## Component Values Summary
# Capacitors:
# C1, C2: 22pF ceramic, 50V
# C3: 100nF ceramic, 16V

# Resistors:
# R1-R10: 10kΩ, 0.125W
# R11: 10kΩ, 0.125W (Enable pull-up)
# R12: 10kΩ, 0.125W (Reset pull-down)
# R13: 1.5kΩ, 0.125W (USB pull-up)
# R14, R15: 4.7kΩ, 0.125W (I2C pull-up)

# Switches:
# SW1: Tactile switch 6x6mm

# Crystals:
# Y1: 40MHz fundamental mode crystal

# Modules:
# U1: ESP32-S3-WROOM-1-N8
# U2: W25Q64JVSSIQ (8MB SPI Flash)
# U3: ESP-PSRAM64H (8MB PSRAM)

## Notes
# All unused GPIOs should be left unconnected or pulled to GND
# GPIOs 34-39 are input-only and don't have internal pull-ups
# Use appropriate decoupling capacitors near power pins
# Keep high-speed signals (I2S, SPI) away from analog audio paths