'use client';

import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import type { Vehicle, RentPeriod } from '@/types';
import { Phone, MessageCircle } from 'lucide-react';

interface PriceDisplayProps {
  vehicle: Vehicle;
  period: RentPeriod;
}

export function PriceDisplay({ vehicle, period }: PriceDisplayProps) {
  const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || '1588-0000';
  const kakaoUrl = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || '#';

  const getPrice = (): number | null | undefined => {
    switch (period) {
      case 24:
        return vehicle.rentPrice24_0;
      case 36:
        return vehicle.rentPrice36_0;
      case 48:
        return vehicle.rentPrice48_0;
      case 60:
        return vehicle.rentPrice60_0;
      default:
        return null;
    }
  };

  const price = getPrice();

  if (!price) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-600 mb-4">
          {period}개월 렌트 가격은
          <br />
          상담을 통해 안내드립니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <a href={`tel:${phoneNumber}`} className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              전화 문의하기
            </a>
          </Button>
          <Button asChild variant="kakao">
            <a
              href={kakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              카카오톡 문의
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary/5 rounded-xl p-6">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 mb-1">월 납입금 ({period}개월)</p>
        <p className="text-3xl font-bold text-primary">
          {formatPrice(price)}
          <span className="text-lg font-normal text-gray-600">원</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild variant="default" className="flex-1">
          <a href={`tel:${phoneNumber}`} className="flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" />
            전화 상담
          </a>
        </Button>
        <Button asChild variant="kakao" className="flex-1">
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            카카오톡 상담
          </a>
        </Button>
      </div>
    </div>
  );
}
