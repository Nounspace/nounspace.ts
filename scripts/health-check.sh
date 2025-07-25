#!/bin/bash

# Mini App Discovery - Quick Health Check
# For 24-hour job monitoring - runs in under 5 seconds

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
API_BASE="http://localhost:3000/api/miniapp-discovery"
TIMEOUT=3

echo -e "${YELLOW}🔍 Mini App Discovery - Health Check${NC}"
echo "======================================"

# Function to check API health
check_api_health() {
    echo -e "${YELLOW}📡 Checking API health...${NC}"
    
    # Quick GET request (macOS doesn't have timeout by default)
    if curl -s --max-time $TIMEOUT "$API_BASE" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API is responding${NC}"
        return 0
    else
        echo -e "${RED}❌ API is not responding${NC}"
        return 1
    fi
}

# Function to check API response structure
check_api_structure() {
    echo -e "${YELLOW}🔧 Checking API response structure...${NC}"
    
    RESPONSE=$(curl -s --max-time $TIMEOUT "$API_BASE" 2>/dev/null || echo "{}")
    
    # Check if response is valid JSON and has required fields
    if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API response structure is valid${NC}"
        
        # Extract key metrics
        SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')
        TOTAL=$(echo "$RESPONSE" | jq -r '.stats.totalDiscovered // 0')
        VALID=$(echo "$RESPONSE" | jq -r '.stats.validApps // 0')
        CRAWLING=$(echo "$RESPONSE" | jq -r '.stats.isCrawling // false')
        
        echo "  📊 Metrics:"
        echo "    - Success: $SUCCESS"
        echo "    - Total Discovered: $TOTAL"
        echo "    - Valid Apps: $VALID"
        echo "    - Is Crawling: $CRAWLING"
        
        return 0
    else
        echo -e "${RED}❌ API response structure is invalid${NC}"
        return 1
    fi
}

# Function to check discovery trigger
check_discovery_trigger() {
    echo -e "${YELLOW}🚀 Testing discovery trigger...${NC}"
    
    RESPONSE=$(curl -s --max-time $TIMEOUT -X POST "$API_BASE" \
        -H "Content-Type: application/json" \
        -d '{"action": "discover"}' 2>/dev/null || echo "{}")
    
    if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')
        if [ "$SUCCESS" = "true" ]; then
            echo -e "${GREEN}✅ Discovery trigger is working${NC}"
            return 0
        else
            echo -e "${RED}❌ Discovery trigger failed${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Discovery trigger response is invalid${NC}"
        return 1
    fi
}

# Function to check Farcaster API
check_farcaster_api() {
    echo -e "${YELLOW}📡 Checking Farcaster API...${NC}"
    
    if curl -s --max-time $TIMEOUT "https://client.farcaster.xyz/v1/top-frameapps?limit=1" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Farcaster API is accessible${NC}"
        return 0
    else
        echo -e "${RED}❌ Farcaster API is not accessible${NC}"
        return 1
    fi
}

# Function to generate health report
generate_report() {
    local api_health=$1
    local api_structure=$2
    local discovery_trigger=$3
    local farcaster_api=$4
    
    echo -e "\n${YELLOW}📊 Health Report${NC}"
    echo "=============="
    
    local overall_health=0
    
    if [ $api_health -eq 0 ]; then
        echo -e "${GREEN}✅ API Health: OK${NC}"
    else
        echo -e "${RED}❌ API Health: FAILED${NC}"
        overall_health=1
    fi
    
    if [ $api_structure -eq 0 ]; then
        echo -e "${GREEN}✅ API Structure: OK${NC}"
    else
        echo -e "${RED}❌ API Structure: FAILED${NC}"
        overall_health=1
    fi
    
    if [ $discovery_trigger -eq 0 ]; then
        echo -e "${GREEN}✅ Discovery Trigger: OK${NC}"
    else
        echo -e "${RED}❌ Discovery Trigger: FAILED${NC}"
        overall_health=1
    fi
    
    if [ $farcaster_api -eq 0 ]; then
        echo -e "${GREEN}✅ Farcaster API: OK${NC}"
    else
        echo -e "${RED}❌ Farcaster API: FAILED${NC}"
        overall_health=1
    fi
    
    echo ""
    if [ $overall_health -eq 0 ]; then
        echo -e "${GREEN}🎉 Overall Health: HEALTHY${NC}"
        exit 0
    else
        echo -e "${RED}⚠️  Overall Health: UNHEALTHY${NC}"
        exit 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}Starting health check...${NC}"
    
    # Run all checks
    check_api_health
    API_HEALTH=$?
    
    check_api_structure
    API_STRUCTURE=$?
    
    check_discovery_trigger
    DISCOVERY_TRIGGER=$?
    
    check_farcaster_api
    FARCaster_API=$?
    
    # Generate report
    generate_report $API_HEALTH $API_STRUCTURE $DISCOVERY_TRIGGER $FARCaster_API
}

# Run main function
main "$@" 