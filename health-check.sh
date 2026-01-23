#!/bin/bash

# Health check script for ESG Horizon Frontend
# Run this on your VPS to diagnose deployment issues

echo "🔍 ESG Horizon Frontend Health Check"
echo "====================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
APP_DIR="/var/www/staging.esghorizon.africa"
PORT=3001

check_service() {
    local service=$1
    local command=$2
    local expected=$3

    echo -n "Checking $service... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC}"
        return 1
    fi
}

# Check if application directory exists
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Application directory $APP_DIR does not exist${NC}"
    exit 1
fi

cd "$APP_DIR"

echo "📁 Application Directory: $APP_DIR"
echo "🌐 Port: $PORT"
echo ""

# Check file structure
echo "📂 File Structure Check:"
check_service "package.json" "test -f package.json"
check_service ".next directory" "test -d .next"
check_service ".next/standalone" "test -d .next/standalone"
check_service ".next/static" "test -d .next/static"
check_service "server.js" "test -f .next/standalone/server.js"
echo ""

# Check PM2 process
echo "⚙️  PM2 Process Check:"
if command -v pm2 &> /dev/null; then
    if pm2 describe esg-frontend-prod > /dev/null 2>&1; then
        echo -e "PM2 process: ${GREEN}Running${NC}"
        pm2 status esg-frontend-prod
    else
        echo -e "PM2 process: ${RED}Not running${NC}"
    fi
else
    echo -e "PM2: ${RED}Not installed${NC}"
fi
echo ""

# Check port availability
echo "🔌 Network Check:"
if command -v netstat &> /dev/null; then
    if netstat -tuln | grep ":$PORT " > /dev/null; then
        echo -e "Port $PORT: ${GREEN}In use${NC}"
    else
        echo -e "Port $PORT: ${RED}Not in use${NC}"
    fi
elif command -v ss &> /dev/null; then
    if ss -tuln | grep ":$PORT " > /dev/null; then
        echo -e "Port $PORT: ${GREEN}In use${NC}"
    else
        echo -e "Port $PORT: ${RED}Not in use${NC}"
    fi
fi

# Test HTTP connectivity
echo "🌐 HTTP Connectivity:"
if command -v curl &> /dev/null; then
    echo -n "Direct app access (localhost:$PORT): "
    if curl -s --max-time 5 http://localhost:$PORT > /dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi

    echo -n "Static asset access: "
    if curl -s --max-time 5 http://localhost:$PORT/_next/static/chunks/main.js > /dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
else
    echo "curl not available - skipping HTTP checks"
fi
echo ""

# Check Nginx
echo "🌐 Nginx Check:"
if command -v nginx &> /dev/null; then
    if sudo systemctl is-active --quiet nginx; then
        echo -e "Nginx service: ${GREEN}Running${NC}"
    else
        echo -e "Nginx service: ${RED}Not running${NC}"
    fi

    if sudo nginx -t 2>/dev/null; then
        echo -e "Nginx configuration: ${GREEN}Valid${NC}"
    else
        echo -e "Nginx configuration: ${RED}Invalid${NC}"
    fi
else
    echo -e "Nginx: ${RED}Not installed${NC}"
fi
echo ""

# Check disk space
echo "💾 Disk Space:"
df -h "$APP_DIR" | tail -1
echo ""

# Recent logs
echo "📜 Recent PM2 Logs:"
if command -v pm2 &> /dev/null; then
    pm2 logs esg-frontend-prod --lines 5 --nostream 2>/dev/null || echo "No recent logs available"
else
    echo "PM2 not available"
fi
echo ""

echo "🔧 Quick Fixes:"
echo "1. If PM2 is not running: pm2 start ecosystem.config.js --env production"
echo "2. If port is not in use: Check PM2 logs for errors"
echo "3. If static assets fail: Check nginx configuration for /_next/static/ proxy"
echo "4. If nginx config is invalid: sudo nginx -t to see errors"
echo ""
echo "📖 For detailed troubleshooting, see DEPLOYMENT_README.md"