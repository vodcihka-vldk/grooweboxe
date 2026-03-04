# ESP-IDF Project Configuration
cmake_minimum_required(VERSION 3.16)

# Set the minimum required version of CMake
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

# Set the project name
project(grooweboxe)

# Set the path to the ESP-IDF
set(IDF_PATH $ENV{IDF_PATH})

# Include the main component
set(EXTRA_COMPONENT_DIRS ${CMAKE_CURRENT_SOURCE_DIR}/components)

# Set build configuration
set(COMPONENTS main)

# Include the main component
idf_component_register(SRCS "main.c"
                       INCLUDE_DIRS "."
                       PRIV_REQUIRES audio sequencer ui storage drivers utils)
