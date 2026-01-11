#!/bin/bash

# 신차앤렌트 서버 모니터링 스크립트
# 사용법: ./scripts/monitor.sh

URL="https://www.sinchaandrent.com"
HEALTH_URL="https://www.sinchaandrent.com/api/health"
INTERVAL=30  # 체크 간격 (초)

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🚗 신차앤렌트 서버 모니터링 시작${NC}"
echo -e "${BLUE}  URL: ${URL}${NC}"
echo -e "${BLUE}  Health: ${HEALTH_URL}${NC}"
echo -e "${BLUE}  체크 간격: ${INTERVAL}초${NC}"
echo -e "${BLUE}  중지: Ctrl+C${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

check_count=0
error_count=0

while true; do
    check_count=$((check_count + 1))
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    # 메인 페이지 체크
    main_response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" --max-time 10 "$URL" 2>/dev/null)
    main_status=$(echo $main_response | cut -d'|' -f1)
    main_time=$(echo $main_response | cut -d'|' -f2)

    # 헬스체크 API 체크
    health_response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" --max-time 10 "$HEALTH_URL" 2>/dev/null)
    health_status=$(echo $health_response | cut -d'|' -f1)
    health_time=$(echo $health_response | cut -d'|' -f2)

    # 상태 판단 및 출력
    if [[ "$main_status" == "200" && "$health_status" == "200" ]]; then
        echo -e "${GREEN}✓${NC} [${timestamp}] #${check_count} | 메인: ${main_status} (${main_time}s) | Health: ${health_status} (${health_time}s)"
    elif [[ "$main_status" == "000" || "$health_status" == "000" ]]; then
        error_count=$((error_count + 1))
        echo -e "${RED}✗${NC} [${timestamp}] #${check_count} | ${RED}연결 실패!${NC} 메인: ${main_status} | Health: ${health_status}"
        echo -e "  ${YELLOW}⚠ 서버가 응답하지 않습니다. Cloudtype 대시보드를 확인하세요.${NC}"

        # 알림음 (macOS)
        afplay /System/Library/Sounds/Basso.aiff 2>/dev/null &
    elif [[ "$main_status" == "503" || "$health_status" == "503" ]]; then
        error_count=$((error_count + 1))
        echo -e "${RED}✗${NC} [${timestamp}] #${check_count} | ${RED}503 Service Unavailable${NC}"
        echo -e "  ${YELLOW}⚠ 서버 점검 중이거나 배포 중입니다.${NC}"

        afplay /System/Library/Sounds/Basso.aiff 2>/dev/null &
    else
        error_count=$((error_count + 1))
        echo -e "${YELLOW}!${NC} [${timestamp}] #${check_count} | 메인: ${main_status} (${main_time}s) | Health: ${health_status} (${health_time}s)"
    fi

    sleep $INTERVAL
done
