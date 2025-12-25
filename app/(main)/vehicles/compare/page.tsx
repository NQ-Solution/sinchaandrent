'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Car, ArrowLeft, Plus, X, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { KakaoIcon } from '@/components/icons/KakaoIcon';
import { formatPrice, getCategoryLabel, getFuelTypeLabel, getDriveTypeLabel } from '@/lib/utils';
import type { Vehicle } from '@/types';

function CompareContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids');

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || '1588-0000';
  const kakaoUrl = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || '#';

  useEffect(() => {
    async function fetchVehicles() {
      const ids = idsParam?.split(',') || [];
      try {
        // 선택된 차량들 가져오기
        const vehiclePromises = ids.map(id =>
          fetch(`/api/vehicles/${id}`).then(res => res.json())
        );
        const vehicleData = await Promise.all(vehiclePromises);
        setVehicles(vehicleData.filter(v => v && v.id));

        // 전체 차량 목록 가져오기 (추가용)
        const allRes = await fetch('/api/vehicles');
        const allData = await allRes.json();
        setAllVehicles(allData);
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, [idsParam]);

  const removeVehicle = (vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    // URL 업데이트
    const newIds = vehicles.filter(v => v.id !== vehicleId).map(v => v.id).join(',');
    if (newIds) {
      window.history.replaceState({}, '', `/vehicles/compare?ids=${newIds}`);
    } else {
      window.history.replaceState({}, '', '/vehicles/compare');
    }
  };

  const addVehicle = (vehicle: Vehicle) => {
    if (vehicles.length >= 3) return;
    if (vehicles.find(v => v.id === vehicle.id)) return;

    setVehicles(prev => [...prev, vehicle]);
    const newIds = [...vehicles, vehicle].map(v => v.id).join(',');
    window.history.replaceState({}, '', `/vehicles/compare?ids=${newIds}`);
    setShowAddModal(false);
    setSearchQuery('');
  };

  const filteredVehicles = allVehicles.filter(v =>
    !vehicles.find(existing => existing.id === v.id) &&
    (v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     v.brand?.nameKr?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const CompareRow = ({ label, values, highlight = false }: { label: string; values: (string | number | null)[]; highlight?: boolean }) => (
    <div className={`grid grid-cols-${vehicles.length + 1} border-b ${highlight ? 'bg-primary/5' : ''}`}>
      <div className="p-4 font-medium text-gray-700 bg-gray-50 border-r">
        {label}
      </div>
      {values.map((value, index) => (
        <div key={index} className="p-4 text-center border-r last:border-r-0">
          {value !== null && value !== undefined ? (
            <span className={highlight ? 'font-bold text-primary' : ''}>{value}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ))}
      {/* 빈 슬롯 */}
      {Array.from({ length: 3 - vehicles.length }).map((_, i) => (
        <div key={`empty-${i}`} className="p-4 text-center border-r last:border-r-0 bg-gray-50">
          <span className="text-gray-300">-</span>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20 pb-24 bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/vehicles" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">차량 비교</h1>
                <p className="text-sm text-gray-500">{vehicles.length}개 차량 비교 중</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <a href={`tel:${phoneNumber}`}>
                  <Phone className="w-4 h-4 mr-1" />
                  전화상담
                </a>
              </Button>
              <Button asChild size="sm" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 rounded-full">
                <a href={kakaoUrl} target="_blank" rel="noopener noreferrer">
                  <KakaoIcon className="w-4 h-4 mr-1" />
                  카카오톡
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Cards */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-2xl shadow-sm overflow-hidden relative group">
              <button
                onClick={() => removeVehicle(vehicle.id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="aspect-[16/10] bg-gray-100 relative">
                {vehicle.thumbnail ? (
                  <Image
                    src={vehicle.thumbnail}
                    alt={vehicle.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="text-xs text-gray-400 mb-1">{vehicle.brand?.nameKr}</p>
                <h3 className="font-bold text-lg mb-2">{vehicle.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-primary">
                    {vehicle.rentPrice60_0 ? formatPrice(vehicle.rentPrice60_0) : '상담'}
                  </span>
                  {vehicle.rentPrice60_0 && <span className="text-sm text-gray-400">원~/월</span>}
                </div>
                <Link
                  href={`/vehicle/${vehicle.id}`}
                  className="mt-3 flex items-center justify-center gap-1 text-sm text-primary font-medium hover:underline"
                >
                  상세보기 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}

          {/* 차량 추가 슬롯 */}
          {vehicles.length < 3 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center py-16"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">차량 추가</p>
              <p className="text-sm text-gray-400">최대 3대 비교 가능</p>
            </button>
          )}

          {/* 빈 슬롯 */}
          {Array.from({ length: Math.max(0, 2 - vehicles.length) }).map((_, i) => (
            <div key={`empty-slot-${i}`} className="hidden md:block" />
          ))}
        </div>

        {vehicles.length >= 2 ? (
          /* Comparison Table */
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* 기본 정보 */}
                <div className="bg-gray-900 text-white p-4">
                  <h3 className="font-bold">기본 정보</h3>
                </div>
                <CompareRow
                  label="차종"
                  values={vehicles.map(v => getCategoryLabel(v.category))}
                />
                <CompareRow
                  label="연료"
                  values={vehicles.map(v =>
                    v.fuelTypes?.map(ft => getFuelTypeLabel(ft)).join('/') || null
                  )}
                />
                <CompareRow
                  label="구동방식"
                  values={vehicles.map(v =>
                    v.driveTypes?.map(dt => getDriveTypeLabel(dt)).join('/') || null
                  )}
                />
                <CompareRow
                  label="승차인원"
                  values={vehicles.map(v =>
                    v.seatingCapacityMin && v.seatingCapacityMax
                      ? (v.seatingCapacityMin === v.seatingCapacityMax
                        ? `${v.seatingCapacityMin}인승`
                        : `${v.seatingCapacityMin}~${v.seatingCapacityMax}인승`)
                      : null
                  )}
                />

                {/* 가격 정보 */}
                <div className="bg-gray-900 text-white p-4 mt-4">
                  <h3 className="font-bold">가격 정보</h3>
                </div>
                <CompareRow
                  label="차량 가격"
                  values={vehicles.map(v =>
                    v.basePrice ? `${formatPrice(v.basePrice)}원` : null
                  )}
                />
                <CompareRow
                  label="월 렌트료 (60개월/0%)"
                  values={vehicles.map(v =>
                    v.rentPrice60_0 ? `${formatPrice(v.rentPrice60_0)}원~` : '상담'
                  )}
                  highlight
                />
                <CompareRow
                  label="월 렌트료 (48개월/0%)"
                  values={vehicles.map(v =>
                    v.rentPrice48_0 ? `${formatPrice(v.rentPrice48_0)}원~` : '상담'
                  )}
                />
                <CompareRow
                  label="월 렌트료 (36개월/0%)"
                  values={vehicles.map(v =>
                    v.rentPrice36_0 ? `${formatPrice(v.rentPrice36_0)}원~` : '상담'
                  )}
                />

                {/* 비교 결론 */}
                <div className="bg-primary/5 p-6 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="text-center">
                        <p className="text-sm text-gray-500 mb-2">{vehicle.brand?.nameKr} {vehicle.name}</p>
                        <Button asChild className="w-full rounded-full">
                          <Link href={`/vehicle/${vehicle.id}`}>
                            견적 확인하기
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              비교할 차량을 선택해주세요
            </h3>
            <p className="text-gray-500 mb-6">
              최소 2대 이상의 차량을 선택하면 비교표가 표시됩니다.
            </p>
            <Button asChild className="rounded-full">
              <Link href="/vehicles">차량 목록에서 선택하기</Link>
            </Button>
          </div>
        )}
      </section>

      {/* 차량 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg">차량 추가</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="차량명 또는 브랜드 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filteredVehicles.length > 0 ? (
                <div className="space-y-2">
                  {filteredVehicles.slice(0, 20).map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => addVehicle(vehicle)}
                      className="w-full flex items-center gap-4 p-3 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {vehicle.thumbnail ? (
                          <Image
                            src={vehicle.thumbnail}
                            alt={vehicle.name}
                            width={64}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400">{vehicle.brand?.nameKr}</p>
                        <p className="font-medium truncate">{vehicle.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-primary">
                          {vehicle.rentPrice60_0 ? `${formatPrice(vehicle.rentPrice60_0)}원~` : '상담'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 md:p-10 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">어떤 차량이 좋을지 고민되시나요?</h3>
          <p className="text-gray-300 mb-6">전문 상담원이 고객님께 딱 맞는 차량을 추천해드립니다.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8">
              <a href={`tel:${phoneNumber}`}>
                <Phone className="w-4 h-4 mr-2" />
                전화상담
              </a>
            </Button>
            <Button asChild className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 rounded-full px-8">
              <a href={kakaoUrl} target="_blank" rel="noopener noreferrer">
                <KakaoIcon className="w-4 h-4 mr-2" />
                카카오톡 상담
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
