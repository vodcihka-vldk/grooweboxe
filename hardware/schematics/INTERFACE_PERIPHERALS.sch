# Interface Peripherals Schematic for GrooveBoxe
# Displays, Encoders, Buttons, and SD Card Interface

## OLED Display (SSD1306)
# 128x64 Monochrome OLED
U1 SSD1306_128x64
    1 GND
    2 VDD
    3 SCL
    4 SDA
    5 RES
    6 DC

# OLED Power
NET 3.3V_DIGITAL
    U1 2

NET GND
    U1 1

# OLED I2C Interface
NET I2C_SCL
    U1 3
    ESP32_GPIO22

NET I2C_SDA
    U1 4
    ESP32_GPIO21

# OLED Control Signals
NET OLED_RES
    U1 5
    ESP32_GPIO16

NET OLED_DC
    U1 6
    ESP32_GPIO17

# I2C Pull-up Resistors
R1 4.7k
    1 I2C_SCL
    2 3.3V_DIGITAL

R2 4.7k
    1 I2C_SDA
    2 3.3V_DIGITAL

## TFT Display (ILI9341) - Alternative
# 320x240 Color TFT
U2 ILI9341_320x240
    1 VCC
    2 GND
    3 SCK
    4 MOSI
    5 MISO
    6 CS
    7 DC
    8 RST
    9 BL

# TFT Power
NET 3.3V_DIGITAL
    U2 1

NET GND
    U2 2

# TFT SPI Interface
NET SPI_SCK
    U2 3
    ESP32_GPIO18

NET SPI_MOSI
    U2 4
    ESP32_GPIO23

NET SPI_MISO
    U2 5
    ESP32_GPIO19

NET SPI_CS_TFT
    U2 6
    ESP32_GPIO15

# TFT Control Signals
NET TFT_DC
    U2 7
    ESP32_GPIO2

NET TFT_RST
    U2 8
    ESP32_GPIO4

NET TFT_BL
    U2 9
    ESP32_GPIO5

# TFT Power Decoupling
C1 10uF
    1 3.3V_DIGITAL
    2 GND

C2 100nF
    1 3.3V_DIGITAL
    2 GND

## SD Card Interface
# MicroSD Card Slot
J1 MICROSD_SLOT
    1 VCC
    2 GND
    3 SCK
    4 MOSI
    5 MISO
    6 CS
    7 DETECT

# SD Card Power
NET 3.3V_DIGITAL
    J1 1

NET GND
    J1 2

# SD Card SPI Interface
NET SPI_SCK
    J1 3
    ESP32_GPIO18

NET SPI_MOSI
    J1 4
    ESP32_GPIO23

NET SPI_MISO
    J1 5
    ESP32_GPIO19

NET SPI_CS_SD
    J1 6
    ESP32_GPIO5

# SD Card Detection
NET SD_DETECT
    J1 7
    ESP32_GPIO2

# SD Card Power Decoupling
C3 10uF
    1 3.3V_DIGITAL
    2 GND

C4 100nF
    1 3.3V_DIGITAL
    2 GND

## Encoder Interface (8x EC11)
# Rotary Encoders with Push Button

### Encoder 1 (Channel Select)
ENC1 EC11_ENCODER
    1 +
    2 A
    3 B
    4 C

# Encoder 1 Power and Signals
NET 3.3V_DIGITAL
    ENC1 1

NET ENC1_A
    ENC1 2
    ESP32_GPIO34

NET ENC1_B
    ENC1 3
    ESP32_GPIO35

NET ENC1_SW
    ENC1 4
    ESP32_GPIO39

# Encoder 1 Pull-up Resistors
R3 10k
    1 ENC1_A
    2 3.3V_DIGITAL

R4 10k
    1 ENC1_B
    2 3.3V_DIGITAL

R5 10k
    1 ENC1_SW
    2 3.3V_DIGITAL

### Encoder 2 (Volume)
ENC2 EC11_ENCODER
    1 +
    2 A
    3 B
    4 C

NET 3.3V_DIGITAL
    ENC2 1

NET ENC2_A
    ENC2 2
    ESP32_GPIO32

NET ENC2_B
    ENC2 3
    ESP32_GPIO33

NET ENC2_SW
    ENC2 4
    ESP32_GPIO25

R6 10k
    1 ENC2_A
    2 3.3V_DIGITAL

R7 10k
    1 ENC2_B
    2 3.3V_DIGITAL

R8 10k
    1 ENC2_SW
    2 3.3V_DIGITAL

### Encoder 3 (Pitch)
ENC3 EC11_ENCODER
    1 +
    2 A
    3 B
    4 C

NET 3.3V_DIGITAL
    ENC3 1

NET ENC3_A
    ENC3 2
    ESP32_GPIO26

NET ENC3_B
    ENC3 3
    ESP32_GPIO27

NET ENC3_SW
    ENC3 4
    ESP32_GPIO14

R9 10k
    1 ENC3_A
    2 3.3V_DIGITAL

R10 10k
    1 ENC3_B
    2 3.3V_DIGITAL

R11 10k
    1 ENC3_SW
    2 3.3V_DIGITAL

### Encoder 4 (Drive)
ENC4 EC11_ENCODER
    1 +
    2 A
    3 B
    4 C

NET 3.3V_DIGITAL
    ENC4 1

NET ENC4_A
    ENC4 2
    ESP32_GPIO12

NET ENC4_B
    ENC4 3
    ESP32_GPIO13

NET ENC4_SW
    ENC4 4
    ESP32_GPIO15

R12 10k
    1 ENC4_A
    2 3.3V_DIGITAL

R13 10k
    1 ENC4_B
    2 3.3V_DIGITAL

R14 10k
    1 ENC4_SW
    2 3.3V_DIGITAL

### Encoder 5 (Start)
ENC5 EC11_ENCODER
    1 +
    2 A
    3 B
    4 C

NET 3.3V_DIGITAL
    ENC5 1

NET ENC5_A
    ENC5 2
    ESP32_GPIO2

NET ENC5_B
    ENC5 3
    ESP32_GPIO4

NET ENC5_SW
    ENC5 4
    ESP32_GPIO16

R15 10k
    1 ENC5_A
    2 3.3V_DIGITAL

R16 10k
    1 ENC5_B
    2 3.3V_DIGITAL

R17 10k
    1 ENC5_SW
    2 3.3V_DIGITAL

### Encoder 6 (Length)
ENC6 EC11_ENCODER
    1 +
    2 A
    3 B
    4 C

NET 3.3V_DIGITAL
    ENC6 1

NET ENC6_A
    ENC6 2
    ESP32_GPIO17

NET ENC6_B
    ENC6 3
    ESP32_GPIO5

NET ENC6_SW
    ENC6 4
    ESP32_GPIO18

R18 10k
    1 ENC6_A
    2 3.3V_DIGITAL

R19 10k
    1 ENC6_B
    2 3.3V_DIGITAL

R20 10k
    1 ENC6_SW
    2 3.3V_DIGITAL

### Encoder 7 (Attack)
ENC7 EC11_ENCODER
    1 +
    2 A
    3 B
    4 C

NET 3.3V_DIGITAL
    ENC7 1

NET ENC7_A
    ENC7 2
    ESP32_GPIO19

NET ENC7_B
    ENC7 3
    ESP32_GPIO21

NET ENC7_SW
    ENC7 4
    ESP32_GPIO22

R21 10k
    1 ENC7_A
    2 3.3V_DIGITAL

R22 10k
    1 ENC7_B
    2 3.3V_DIGITAL

R23 10k
    1 ENC7_SW
    2 3.3V_DIGITAL

### Encoder 8 (Decay)
ENC8 EC11_ENCODER
    1 +
    2 A
    3 B
    4 C

NET 3.3V_DIGITAL
    ENC8 1

NET ENC8_A
    ENC8 2
    ESP32_GPIO23

NET ENC8_B
    ENC8 3
    ESP32_GPIO36

NET ENC8_SW
    ENC8 4
    ESP32_GPIO39

R24 10k
    1 ENC8_A
    2 3.3V_DIGITAL

R25 10k
    1 ENC8_B
    2 3.3V_DIGITAL

R26 10k
    1 ENC8_SW
    2 3.3V_DIGITAL

## Button Matrix (24x Tactile Switches)

### Sequencer Buttons (16)
SEQ0 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ0_OUT

SEQ1 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ1_OUT

SEQ2 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ2_OUT

SEQ3 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ3_OUT

SEQ4 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ4_OUT

SEQ5 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ5_OUT

SEQ6 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ6_OUT

SEQ7 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ7_OUT

SEQ8 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ8_OUT

SEQ9 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ9_OUT

SEQ10 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ10_OUT

SEQ11 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ11_OUT

SEQ12 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ12_OUT

SEQ13 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ13_OUT

SEQ14 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ14_OUT

SEQ15 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 SEQ15_OUT

# Sequencer Button Pull-down Resistors
R27 10k
    1 SEQ0_OUT
    2 GND

R28 10k
    1 SEQ1_OUT
    2 GND

R29 10k
    1 SEQ2_OUT
    2 GND

R30 10k
    1 SEQ3_OUT
    2 GND

R31 10k
    1 SEQ4_OUT
    2 GND

R32 10k
    1 SEQ5_OUT
    2 GND

R33 10k
    1 SEQ6_OUT
    2 GND

R34 10k
    1 SEQ7_OUT
    2 GND

R35 10k
    1 SEQ8_OUT
    2 GND

R36 10k
    1 SEQ9_OUT
    2 GND

R37 10k
    1 SEQ10_OUT
    2 GND

R38 10k
    1 SEQ11_OUT
    2 GND

R39 10k
    1 SEQ12_OUT
    2 GND

R40 10k
    1 SEQ13_OUT
    2 GND

R41 10k
    1 SEQ14_OUT
    2 GND

R42 10k
    1 SEQ15_OUT
    2 GND

# Sequencer Button Connections to ESP32
NET SEQ_BTN_0
    SEQ0_OUT
    ESP32_GPIO32

NET SEQ_BTN_1
    SEQ1_OUT
    ESP32_GPIO33

NET SEQ_BTN_2
    SEQ2_OUT
    ESP32_GPIO25

NET SEQ_BTN_3
    SEQ3_OUT
    ESP32_GPIO26

NET SEQ_BTN_4
    SEQ4_OUT
    ESP32_GPIO27

NET SEQ_BTN_5
    SEQ5_OUT
    ESP32_GPIO14

NET SEQ_BTN_6
    SEQ6_OUT
    ESP32_GPIO12

NET SEQ_BTN_7
    SEQ7_OUT
    ESP32_GPIO13

NET SEQ_BTN_8
    SEQ8_OUT
    ESP32_GPIO15

NET SEQ_BTN_9
    SEQ9_OUT
    ESP32_GPIO2

NET SEQ_BTN_10
    SEQ10_OUT
    ESP32_GPIO4

NET SEQ_BTN_11
    SEQ11_OUT
    ESP32_GPIO16

NET SEQ_BTN_12
    SEQ12_OUT
    ESP32_GPIO17

NET SEQ_BTN_13
    SEQ13_OUT
    ESP32_GPIO5

NET SEQ_BTN_14
    SEQ14_OUT
    ESP32_GPIO18

NET SEQ_BTN_15
    SEQ15_OUT
    ESP32_GPIO19

### Channel Buttons (8)
CH0 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 CH0_OUT

CH1 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 CH1_OUT

CH2 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 CH2_OUT

CH3 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 CH3_OUT

CH4 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 CH4_OUT

CH5 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 CH5_OUT

CH6 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 CH6_OUT

CH7 TACTILE_SWITCH_6x6
    1 3.3V_DIGITAL
    2 CH7_OUT

# Channel Button Pull-down Resistors
R43 10k
    1 CH0_OUT
    2 GND

R44 10k
    1 CH1_OUT
    2 GND

R45 10k
    1 CH2_OUT
    2 GND

R46 10k
    1 CH3_OUT
    2 GND

R47 10k
    1 CH4_OUT
    2 GND

R48 10k
    1 CH5_OUT
    2 GND

R49 10k
    1 CH6_OUT
    2 GND

R50 10k
    1 CH7_OUT
    2 GND

# Channel Button Connections to ESP32
NET CH_BTN_0
    CH0_OUT
    ESP32_GPIO21

NET CH_BTN_1
    CH1_OUT
    ESP32_GPIO22

NET CH_BTN_2
    CH2_OUT
    ESP32_GPIO23

NET CH_BTN_3
    CH3_OUT
    ESP32_GPIO36

NET CH_BTN_4
    CH4_OUT
    ESP32_GPIO39

NET CH_BTN_5
    CH5_OUT
    ESP32_GPIO34

NET CH_BTN_6
    CH6_OUT
    ESP32_GPIO35

NET CH_BTN_7
    CH7_OUT
    ESP32_GPIO32

## Test Points
TP1 TP_3V3_DIGITAL
    1 3.3V_DIGITAL

TP2 TP_GND
    1 GND

TP3 TP_I2C_SCL
    1 I2C_SCL

TP4 TP_I2C_SDA
    1 I2C_SDA

TP5 TP_SPI_SCK
    1 SPI_SCK

TP6 TP_SPI_MOSI
    1 SPI_MOSI

TP7 TP_SPI_MISO
    1 SPI_MISO

TP8 TP_ENC1_A
    1 ENC1_A

TP9 TP_ENC1_B
    1 ENC1_B

TP10 TP_ENC1_SW
    1 ENC1_SW

## Component Values Summary
# Capacitors:
# C1, C3: 10μF ceramic, 16V
# C2, C4: 100nF ceramic, 16V

# Resistors:
# R1, R2: 4.7kΩ, 0.125W (I2C pull-up)
# R3-R50: 10kΩ, 0.125W (encoder and button pull-up/pull-down)

# Displays:
# U1: SSD1306 128x64 OLED (I2C)
# U2: ILI9341 320x240 TFT (SPI) - Alternative

# Connectors:
# J1: MicroSD card slot

# Switches:
# ENC1-ENC8: EC11 rotary encoders with push button
# SEQ0-SEQ15: 6x6mm tactile switches (sequencer)
# CH0-CH7: 6x6mm tactile switches (channels)

## Interface Specifications
# OLED: 128x64, I2C, 3.3V
# TFT: 320x240, SPI, 3.3V
# Encoders: EC11, 24 pulses/revolution
# Buttons: 6x6mm tactile, 0.1A rating
# SD Card: MicroSD, SPI mode, 3.3V

## Design Notes
# Use appropriate current limiting for display backlights
# Add ESD protection on external connectors
# Consider adding RC filters for encoder signals if needed
# Route high-speed SPI signals away from sensitive analog paths
# Use proper grounding for all peripherals