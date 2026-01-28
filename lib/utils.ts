import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price);
}

export function formatPriceWithUnit(price: number): string {
  if (price >= 10000) {
    const man = Math.floor(price / 10000);
    const remainder = price % 10000;
    if (remainder === 0) {
      return `${man}만`;
    }
    return `${man}만 ${formatPrice(remainder)}`;
  }
  return formatPrice(price);
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    SEDAN: '세단',
    SUV: 'SUV',
    TRUCK: '트럭',
    VAN: '밴',
    EV: '전기차',
    COMPACT: '소형',
    HATCHBACK: '해치백',
    COUPE: '쿠페',
    CONVERTIBLE: '컨버터블/오픈카',
  };
  return labels[category] || category;
}

export function getFuelTypeLabel(fuelType: string): string {
  const labels: Record<string, string> = {
    GASOLINE: '가솔린',
    DIESEL: '디젤',
    HYBRID: '하이브리드',
    EV: '전기',
    LPG: 'LPG',
  };
  return labels[fuelType] || fuelType;
}

export function getDriveTypeLabel(driveType: string): string {
  const labels: Record<string, string> = {
    '전륜구동': '2WD',
    '후륜구동': 'RWD',
    '사륜구동': 'AWD',
    'FWD': '2WD',
    'RWD': 'RWD',
    'AWD': 'AWD',
    '4WD': '4WD',
  };
  return labels[driveType] || driveType;
}

/**
 * 모바일/태블릿 기기인지 확인
 * @returns true if mobile or tablet device
 */
export function isMobileOrTablet(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;

  // User-Agent 체크
  if (mobileRegex.test(userAgent)) {
    return true;
  }

  // 터치 지원 + 작은 화면 (태블릿 포함)
  if (navigator.maxTouchPoints && navigator.maxTouchPoints > 0 && window.innerWidth <= 1024) {
    return true;
  }

  return false;
}

/**
 * 전화 연결 클릭 핸들러
 * 컴퓨터에서는 알림을 표시하고, 모바일/태블릿에서는 바로 전화 연결
 * @param e - Click event
 * @param phoneNumber - Phone number to call
 */
export function handlePhoneClick(e: React.MouseEvent, phoneNumber: string): void {
  if (!isMobileOrTablet()) {
    // 컴퓨터에서는 알림 표시
    const confirmed = window.confirm(
      `전화번호: ${phoneNumber}\n\n전화로 연결됩니다.\n핸드폰이나 전화 가능 태블릿에서는 바로 연결되지만, 컴퓨터에서는 제한될 수 있습니다.\n\n연결을 시도하시겠습니까?`
    );

    if (!confirmed) {
      e.preventDefault();
    }
  }
  // 모바일/태블릿에서는 그냥 tel: 링크가 작동하도록 함
}
