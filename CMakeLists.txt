cmake_minimum_required(VERSION 3.16)

# Include other Cmake files
include(cmake/CPM.cmake)

# Project
project(lesma-playground)

# C++ Flags and settings
if (CMAKE_BUILD_TYPE MATCHES Debug)
  message(STATUS "Debug mode")
elseif (CMAKE_BUILD_TYPE MATCHES Release)
  message(STATUS "Release mode")
endif ()

set(CMAKE_CXX_STANDARD 17)
add_definitions(${CMAKE_CXX_FLAGS} -Wall -Wextra -Wpedantic -frtti)
set(CMAKE_CXX_FLAGS_RELEASE "-O3")

# External dependencies
find_package(Boost CONFIG)

# LLVM configuration
find_package(LLVM 14 CONFIG REQUIRED)
message(STATUS "Found LLVM ${LLVM_PACKAGE_VERSION}")
message(STATUS "Using LLVMConfig.cmake from ${LLVM_DIR}")

include_directories(SYSTEM ${LLVM_INCLUDE_DIRS})
add_definitions(${LLVM_DEFINITIONS})

llvm_map_components_to_libnames(LLVM_LIBS core support demangle mcjit native orcjit)

# Clang configuration
find_package(Clang REQUIRED)

include_directories(SYSTEM ${CLANG_INCLUDE_DIRS})
add_definitions(${CLANG_DEFINITIONS})

set(CLANG_LIBS clangTooling)

# Other dependencies
CPMAddPackage(
  NAME Crow
  VERSION 1.0+5
  GITHUB_REPOSITORY "CrowCpp/Crow"
  GIT_TAG "v1.0+5"
)
CPMAddPackage(
        NAME fmt
        GIT_TAG 9.0.0
        GITHUB_REPOSITORY fmtlib/fmt
)
CPMAddPackage("gh:alinalihassan/Lesma#a13bf75edd2d6bc452b4a5f7ad7a3808bf84ef23")

# Directories
get_filename_component(ROOT_DIR ${CMAKE_SOURCE_DIR} ABSOLUTE)
get_filename_component(SRC_DIR ${ROOT_DIR}/src ABSOLUTE)
get_filename_component(BUILD_DIR ${CMAKE_BINARY_DIR} ABSOLUTE)

# Include directories
include_directories(${SRC_DIR})

# Executable configuration
set(CLI_NAME lesma-playground)

set(COMMON_SOURCES

)
set(CLI_SOURCES src/main.cpp)

add_executable(${CLI_NAME} ${COMMON_SOURCES} ${CLI_SOURCES})

target_link_libraries(${CLI_NAME} PRIVATE fmt lesma_lib Crow::Crow)