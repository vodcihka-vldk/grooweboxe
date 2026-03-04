# Audio Interface Schematic for GrooveBoxe
# ESP32-S3 I2S Audio with PCM5102A DAC and LM4871 Amplifier

## I2S DAC (PCM5102A)
# Stereo I2S DAC
U1 PCM5102A
    1 BCK (Bit Clock Input)
    2 LRCK (Left/Right Clock Input)
    3 DIN (Serial Data Input)
    4 GND
    5 VDD (Power Supply)
    6 FMT (Format Control)
    7 FILT (Filter Select)
    8 SCL (Control Clock)
    9 SDA (Control Data)
    10 DEMP (De-emphasis)
    11 MUTE (Mute Control)
    12 GND
    13 LOUT (Left Channel Analog Output)
    14 ROUT (Right Channel Analog Output)
    15 GND
    16 VSS (Analog Ground)

## Power Supply for Audio DAC
# Low Noise 3.3V Supply
NET 3.3V_ANALOG
    U1 5

NET GND
    U1 4,12,15,16

# Power Decoupling
C1 220uF_TANTALUM
    1 3.3V_ANALOG
    2 GND

C2 100nF
    1 3.3V_ANALOG
    2 GND

C3 10uF
    1 3.3V_ANALOG
    2 GND

## I2S Interface from ESP32
# I2S Clock and Data Lines
NET I2S_BCLK
    U1 1
    ESP32_GPIO27

NET I2S_LRCLK
    U1 2
    ESP32_GPIO26

NET I2S_DATA
    U1 3
    ESP32_GPIO25

## DAC Configuration
# Format Control (I2S Mode)
NET I2S_FMT
    U1 6
    3.3V_DIGITAL

# Filter Select (Standard)
NET I2S_FILT
    U1 7
    GND

# De-emphasis (Disabled)
NET I2S_DEEMP
    U1 10
    GND

# Mute Control (Active Low)
NET I2S_MUTE
    U1 11
    ESP32_GPIO24

# Control Interface (I2C)
NET I2C_SCL
    U1 8
    ESP32_GPIO22

NET I2C_SDA
    U1 9
    ESP32_GPIO21

# I2C Pull-up Resistors
R1 4.7k
    1 I2C_SCL
    2 3.3V_DIGITAL

R2 4.7k
    1 I2C_SDA
    2 3.3V_DIGITAL

## Analog Audio Output
# Left Channel Output
NET AUDIO_L
    U1 13

# Right Channel Output
NET AUDIO_R
    U1 14

# Output DC Blocking Capacitors
C4 100nF
    1 AUDIO_L
    2 AUDIO_L_OUT

C5 100nF
    1 AUDIO_R
    2 AUDIO_R_OUT

# Output Series Resistors
R3 1k
    1 AUDIO_L_OUT
    2 LOUT_JACK

R4 1k
    1 AUDIO_R_OUT
    2 ROUT_JACK

## Audio Amplifier (LM4871)
# Stereo Audio Amplifier
U2 LM4871
    1 SHUTDOWN
    2 +IN
    3 -IN
    4 GND
    5 VDD
    6 VDD
    7 -OUT
    8 +OUT

# Amplifier Power
NET 3.3V_ANALOG
    U2 5,6

NET GND
    U2 4

# Power Decoupling for Amplifier
C6 220uF_TANTALUM
    1 3.3V_ANALOG
    2 GND

C7 100nF
    1 3.3V_ANALOG
    2 GND

# Shutdown Control
NET AMP_SHUTDOWN
    U2 1
    ESP32_GPIO28

# Input Connections
NET AUDIO_L_OUT
    U2 2

NET AUDIO_R_OUT
    U2 3

# Amplifier Outputs
NET AMP_OUT_L
    U2 8

NET AMP_OUT_R
    U2 7

## Speaker Output
# Left Speaker Connection
NET SPK_L
    AMP_OUT_L

# Right Speaker Connection
NET SPK_R
    AMP_OUT_R

# Speaker DC Blocking Capacitors
C8 100uF_POLARIZED
    1 SPK_L
    2 SPK_L_OUT

C9 100uF_POLARIZED
    1 SPK_R
    2 SPK_R_OUT

# Speaker Protection Resistors
R5 10Ω
    1 SPK_L_OUT
    2 SPK_L_FINAL

R6 10Ω
    1 SPK_R_OUT
    2 SPK_R_FINAL

## Headphone Jack
# 3.5mm Stereo Jack
J1 3.5MM_JACK_STEREO
    1 TIP (Left)
    2 RING (Right)
    3 SLEEVE (Ground)

# Jack Connections
NET HP_L
    J1 1
    LOUT_JACK

NET HP_R
    J1 2
    ROUT_JACK

NET HP_GND
    J1 3
    GND

## Test Points
TP1 TP_3V3_ANALOG
    1 3.3V_ANALOG

TP2 TP_GND
    1 GND

TP3 TP_I2S_BCLK
    1 I2S_BCLK

TP4 TP_I2S_LRCLK
    1 I2S_LRCLK

TP5 TP_I2S_DATA
    1 I2S_DATA

TP6 TP_AUDIO_L
    1 AUDIO_L_OUT

TP7 TP_AUDIO_R
    1 AUDIO_R_OUT

TP8 TP_AMP_OUT_L
    1 AMP_OUT_L

TP9 TP_AMP_OUT_R
    1 AMP_OUT_R

## Component Values Summary
# Capacitors:
# C1, C6: 220μF tantalum, 6.3V
# C2, C3, C7: 100nF ceramic, 16V
# C4, C5: 100nF ceramic, 16V (DC blocking)
# C8, C9: 100μF electrolytic, 16V (speaker coupling)

# Resistors:
# R1, R2: 4.7kΩ, 0.125W (I2C pull-up)
# R3, R4: 1kΩ, 0.125W (output series)
# R5, R6: 10Ω, 0.25W (speaker protection)

# ICs:
# U1: PCM5102A (I2S DAC)
# U2: LM4871 (Stereo amplifier)

# Connectors:
# J1: 3.5mm stereo jack

## Audio Specifications
# DAC Resolution: 24-bit
# DAC Sample Rate: Up to 216kHz
# DAC SNR: 112dB
# Amplifier Power: 1W per channel @ 8Ω
# Amplifier THD: 0.1%
# Output Impedance: 32Ω minimum

## Design Notes
# Keep analog ground separate from digital ground
# Use star grounding for audio components
# Place decoupling capacitors close to power pins
# Route I2S signals away from analog audio paths
# Use ground plane under DAC and amplifier
# Add ferrite beads on power lines if needed
# Consider adding EMI filters on outputs