import Image from 'next/image';
import Link from 'next/link';
import { Car, Star, Zap } from 'lucide-react';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import type { Vehicle } from '@/types';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Link href={`/vehicle/${vehicle.id}`} className="group block">
      <div className="relative bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
        {/* 이미지 영역 */}
        <div className="relative aspect-[16/10] bg-white overflow-hidden">
          {vehicle.thumbnail ? (
            <Image
              src={vehicle.thumbnail}
              alt={vehicle.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Car className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
            </div>
          )}

          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* 뱃지 */}
          {(vehicle.isNew || vehicle.isPopular) && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1 sm:gap-1.5">
              {vehicle.isPopular && (
                <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-primary text-white text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  BEST
                </span>
              )}
              {vehicle.isNew && (
                <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-blue-500 text-white text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                  <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  NEW
                </span>
              )}
            </div>
          )}

          {/* 차종 뱃지 */}
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
            <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
              {getCategoryLabel(vehicle.category)}
            </span>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="p-3 sm:p-4">
          {/* 차량명 */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-1 break-keep">
            {vehicle.name}
          </h3>

          {/* 가격 영역 */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5">월 렌트료</p>
              <p className="text-lg sm:text-xl font-black text-gray-900">
                {vehicle.rentPrice60_0 ? (
                  <>
                    {formatPrice(vehicle.rentPrice60_0)}
                    <span className="text-xs sm:text-sm font-normal text-gray-400">원~</span>
                  </>
                ) : (
                  <span className="text-sm sm:text-base font-semibold text-primary">상담문의</span>
                )}
              </p>
            </div>

            {/* 상세보기 버튼 */}
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 group-hover:bg-primary group-hover:text-white transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
