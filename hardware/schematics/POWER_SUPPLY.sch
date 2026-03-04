# Power Supply Schematic for GrooveBoxe
# ESP32-S3 Groovebox Sampler

## Power Input Stage
# USB-C Connector (J1)
# Pin 1: VBUS (5V)
# Pin 2: D-
# Pin 3: D+
# Pin 4: CC1
# Pin 5: CC2
# Pin 6: GND
# Pin 7: GND
# Pin 8: GND
# Pin 9: GND
# Pin 10: D+
# Pin 11: D-
# Pin 12: VBUS (5V)

J1 USB-C-12P
    1 VBUS_IN
    2 D_MINUS
    3 D_PLUS
    4 CC1
    5 CC2
    6 GND
    7 GND
    8 GND
    9 GND
    10 D_PLUS
    11 D_MINUS
    12 VBUS_IN

## ESD Protection
# TVS Diode for USB Protection
D1 PESD5V0S1BA
    1 VBUS_IN
    2 GND

## Main Power Regulation (3.3V Digital)
# LDO for ESP32 and Digital Logic
U1 AMS1117-3.3
    1 IN (5V)
    2 GND
    3 OUT (3.3V_DIGITAL)

# Input Capacitor
C1 100uF_POLARIZED
    1 VBUS_IN
    2 GND

# Input Bypass Capacitor
C2 100nF
    1 VBUS_IN
    2 GND

# Output Capacitor
C3 100uF_POLARIZED
    1 3.3V_DIGITAL
    2 GND

# Output Bypass Capacitor
C4 100nF
    1 3.3V_DIGITAL
    2 GND

## Audio Power Regulation (3.3V Analog)
# Low Noise LDO for Audio Circuitry
U2 TPS7A4700
    1 IN (5V)
    2 GND
    3 OUT (3.3V_ANALOG)
    4 BYPASS
    5 NR/SS
    6 GND
    7 EN
    8 GND

# Audio Input Capacitor
C5 100uF_POLARIZED
    1 VBUS_IN
    2 GND

# Audio Input Bypass Capacitor
C6 100nF
    1 VBUS_IN
    2 GND

# Audio Output Capacitor (Low Noise)
C7 220uF_TANTALUM
    1 3.3V_ANALOG
    2 GND

# Audio Output Bypass Capacitor
C8 100nF
    1 3.3V_ANALOG
    2 GND

# Bypass Capacitor for TPS7A4700
C9 10uF
    1 BYPASS
    2 GND

# Noise Reduction Capacitor
C10 10nF
    1 NR/SS
    2 GND

# Enable Pull-up Resistor
R1 10k
    1 EN
    2 3.3V_DIGITAL

## Power Distribution
# Digital Power Net
NET 3.3V_DIGITAL
    U1 OUT
    C3 1
    C4 1
    R1 2
    # Connected to ESP32 VDD, Digital Logic

# Analog Power Net
NET 3.3V_ANALOG
    U2 OUT
    C7 1
    C8 1
    # Connected to Audio DAC, Amplifier

# Ground Net
NET GND
    J1 6,7,8,9
    D1 2
    C1 2
    C2 2
    C3 2
    C4 2
    C5 2
    C6 2
    C7 2
    C8 2
    C9 2
    C10 2
    U1 2
    U2 2,6,8
    R1 2

## Power Sequencing
# RC Delay for ESP32 Enable
R2 10k
    1 VBUS_IN
    2 EN_DELAY

C11 100nF
    1 EN_DELAY
    2 GND

# ESP32 Enable Signal
NET ESP32_EN
    EN_DELAY
    # Connected to ESP32 EN pin

## Test Points
TP1 TP_POWER_IN
    1 VBUS_IN

TP2 TP_3V3_DIGITAL
    1 3.3V_DIGITAL

TP3 TP_3V3_ANALOG
    1 3.3V_ANALOG

TP4 TP_GND
    1 GND

## Component Values Summary
# Capacitors:
# C1, C3, C5: 100μF electrolytic, 16V
# C2, C4, C6, C8: 100nF ceramic, 16V
# C7: 220μF tantalum, 6.3V
# C9: 10μF ceramic, 16V
# C10: 10nF ceramic, 16V
# C11: 100nF ceramic, 16V

# Resistors:
# R1: 10kΩ, 0.125W
# R2: 10kΩ, 0.125W

# Diodes:
# D1: PESD5V0S1BA (TVS), SOD-323

# Regulators:
# U1: AMS1117-3.3 (LDO), SOT-223
# U2: TPS7A4700 (Low Noise LDO), SOT-223

# Connector:
# J1: USB-C 12-pin, SMT

## Power Budget
# Input: 5V @ 500mA (USB-C)
# Digital Load: ~120mA (ESP32 active)
# Analog Load: ~50mA (Audio circuitry)
# Total: ~170mA @ 3.3V
# Efficiency: ~66% (LDO losses)