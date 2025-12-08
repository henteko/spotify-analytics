#!/bin/bash
set -e

echo "Setting up whisper.cpp..."

# Check for required tools
if ! command -v cmake &> /dev/null; then
    echo "Error: cmake is not installed"
    echo "Please install cmake:"
    echo "  - macOS: brew install cmake"
    echo "  - Ubuntu/Debian: sudo apt-get install cmake"
    echo "  - Other: https://cmake.org/download/"
    exit 1
fi

# Initialize submodule if not already done
if [ ! -f "whisper.cpp/Makefile" ]; then
    echo "Initializing whisper.cpp submodule..."
    git submodule update --init --recursive
fi

# Build whisper.cpp
cd whisper.cpp

if [ ! -f "build/bin/main" ] && [ ! -f "main" ]; then
    echo "Building whisper.cpp..."
    cmake -B build
    cmake --build build --config Release
else
    echo "whisper.cpp already built."
fi

# Download model if not exists
MODEL=${1:-base}
MODEL_FILE="models/ggml-${MODEL}.bin"

if [ ! -f "$MODEL_FILE" ]; then
    echo "Downloading ${MODEL} model..."
    bash ./models/download-ggml-model.sh "$MODEL"
else
    echo "Model ${MODEL} already exists."
fi

cd ..

echo "✓ whisper.cpp setup complete!"
echo ""
echo "Available models:"
echo "  - tiny   (75MB)   - Fastest, lowest accuracy"
echo "  - base   (142MB)  - Recommended, good balance"
echo "  - small  (466MB)  - Higher accuracy"
echo "  - medium (1.5GB)  - Very high accuracy"
echo "  - large  (2.9GB)  - Highest accuracy"
echo ""
echo "To download a different model:"
echo "  bash scripts/setup-whisper.sh <model-name>"
