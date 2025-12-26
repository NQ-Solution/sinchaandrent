'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Star, ArrowUp, ArrowDown } from 'lucide-react';
import { formatPrice, getCategoryLabel } from '@/lib/utils';

interface VehicleWithBrand {
  id: string;
  name: string;
  thumbnail: string | null;
  category: string;
  rentPrice60_0: number | null;
  isPopular: boolean;
  brand: {
    nameKr: string;
  };
}

export default function AdminPopularPage() {
  const [popularVehicles, setPopularVehicles] = useState<VehicleWithBrand[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<VehicleWithBrand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles?all=true');
      const vehicles: VehicleWithBrand[] = await res.json();

      const popular = vehicles
        .filter(v => v.isPopular)
        .sort((a, b) => a.name.localeCompare(b.name));
      const available = vehicles
        .filter(v => !v.isPopular)
        .sort((a, b) => a.name.localeCompare(b.name));

      setPopularVehicles(popular);
      setAvailableVehicles(available);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const togglePopular = async (vehicleId: string, isPopular: boolean) => {
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPopular }),
      });

      if (res.ok) {
        fetchVehicles();
      } else {
        alert('변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const addToPopular = (vehicleId: string) => {
    togglePopular(vehicleId, true);
  };

  const removeFromPopular = (vehicleId: string) => {
    togglePopular(vehicleId, false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">인기 차량 관리</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">메인 페이지에 노출되는 인기 차량을 관리합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* 인기 차량 목록 */}
        <Card>
          <div className="p-3 md:p-4 border-b bg-yellow-50">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
              <h2 className="font-semibold text-gray-900 text-sm md:text-base">인기 차량 ({popularVehicles.length})</h2>
            </div>
          </div>
          <div className="divide-y max-h-[400px] md:max-h-[500px] overflow-y-auto">
            {popularVehicles.length > 0 ? (
              popularVehicles.map((vehicle, index) => (
                <div key={vehicle.id} className="p-3 md:p-4 flex items-center gap-2 md:gap-4">
                  <span className="text-base md:text-lg font-bold text-gray-400 w-5 md:w-6 flex-shrink-0">{index + 1}</span>
                  <div className="w-12 h-9 md:w-16 md:h-12 bg-white border border-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                    {vehicle.thumbnail ? (
                      <Image
                        src={vehicle.thumbnail}
                        alt={vehicle.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] md:text-xs">
                        없음
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm md:text-base">{vehicle.name}</p>
                    <p className="text-xs md:text-sm text-gray-500 truncate">
                      {vehicle.brand?.nameKr} · {getCategoryLabel(vehicle.category)}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" disabled={index === 0} className="h-8 w-8 p-0 hidden md:flex">
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" disabled={index === popularVehicles.length - 1} className="h-8 w-8 p-0 hidden md:flex">
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
                      onClick={() => removeFromPopular(vehicle.id)}
                    >
                      제외
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 md:p-8 text-center text-gray-500 text-sm">
                인기 차량이 없습니다.
              </div>
            )}
          </div>
        </Card>

        {/* 추가 가능한 차량 목록 */}
        <Card>
          <div className="p-3 md:p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm md:text-base">추가 가능한 차량 ({availableVehicles.length})</h2>
          </div>
          <div className="divide-y max-h-[400px] md:max-h-[500px] overflow-y-auto">
            {availableVehicles.length > 0 ? (
              availableVehicles.map((vehicle) => (
                <div key={vehicle.id} className="p-3 md:p-4 flex items-center gap-2 md:gap-4">
                  <div className="w-12 h-9 md:w-16 md:h-12 bg-white border border-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                    {vehicle.thumbnail ? (
                      <Image
                        src={vehicle.thumbnail}
                        alt={vehicle.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] md:text-xs">
                        없음
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm md:text-base">{vehicle.name}</p>
                    <p className="text-xs md:text-sm text-gray-500 truncate">
                      {vehicle.brand?.nameKr} · {vehicle.rentPrice60_0 ? `${formatPrice(vehicle.rentPrice60_0)}원/월` : '가격 미정'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToPopular(vehicle.id)}
                    className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3 flex-shrink-0"
                  >
                    추가
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-6 md:p-8 text-center text-gray-500 text-sm">
                <p>추가할 수 있는 차량이 없습니다.</p>
                <Button asChild className="mt-4" size="sm">
                  <Link href="/admin/vehicles/new">차량 등록하기</Link>
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
