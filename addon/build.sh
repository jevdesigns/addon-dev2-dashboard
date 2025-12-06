#!/usr/bin/env bash
set -e

# Build script for Home Assistant Add-on
# This script builds the Docker image for the add-on

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
ADDON_NAME="dev2-react-dashboard"
ADDON_VERSION=$(jq -r '.version' config.json)
ARCHITECTURES=("amd64" "aarch64" "armv7" "armhf" "i386")

echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  Building Home Assistant Add-on${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""
echo -e "${YELLOW}Add-on:${NC} $ADDON_NAME"
echo -e "${YELLOW}Version:${NC} $ADDON_VERSION"
echo ""

# Build for each architecture
for arch in "${ARCHITECTURES[@]}"; do
    echo -e "${YELLOW}Building for architecture: ${arch}${NC}"
    
    docker buildx build \
        --platform linux/${arch} \
        --tag ghcr.io/your-username/${arch}-${ADDON_NAME}:${ADDON_VERSION} \
        --tag ghcr.io/your-username/${arch}-${ADDON_NAME}:latest \
        --file Dockerfile \
        ..
    
    echo -e "${GREEN}✓ Build completed for ${arch}${NC}"
    echo ""
done

echo -e "${CYAN}================================================${NC}"
echo -e "${GREEN}  ✓ All builds completed successfully!${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Test the add-on locally"
echo "  2. Push to container registry"
echo "  3. Update repository.json with new version"
echo ""
