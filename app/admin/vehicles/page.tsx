'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, X, Star, StarOff, Sparkles } from 'lucide-react';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import type { Brand, Vehicle } from '@/types';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [vehiclesRes, brandsRes] = await Promise.all([
          fetch('/api/vehicles?all=true'),
          fetch('/api/brands'),
        ]);
        const vehiclesData = await vehiclesRes.json();
        const brandsData = await brandsRes.json();
        setVehicles(vehiclesData);
        setBrands(brandsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    let result = [...vehicles];

    // Filter by brand
    if (selectedBrand !== 'all') {
      result = result.filter((v) => v.brandId === selectedBrand);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.brand?.nameKr?.toLowerCase().includes(query) ||
          v.brand?.nameEn?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [vehicles, selectedBrand, searchQuery]);

  // Group vehicles by brand for display
  const vehicleCountByBrand = useMemo(() => {
    const counts: Record<string, number> = { all: vehicles.length };
    vehicles.forEach((v) => {
      counts[v.brandId] = (counts[v.brandId] || 0) + 1;
    });
    return counts;
  }, [vehicles]);

  const handleDelete = async (vehicleId: string, vehicleName: string) => {
    if (!confirm(`"${vehicleName}" 차량을 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
        alert('삭제되었습니다.');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleTogglePopular = async (vehicleId: string, isPopular: boolean) => {
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPopular: !isPopular }),
      });

      if (res.ok) {
        const updatedVehicle = await res.json();
        setVehicles((prev) =>
          prev.map((v) => (v.id === vehicleId ? { ...v, isPopular: updatedVehicle.isPopular } : v))
        );
      } else {
        alert('인기차량 설정 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Toggle popular error:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const handleToggleNew = async (vehicleId: string, isNew: boolean) => {
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isNew: !isNew }),
      });

      if (res.ok) {
        const updatedVehicle = await res.json();
        setVehicles((prev) =>
          prev.map((v) => (v.id === vehicleId ? { ...v, isNew: updatedVehicle.isNew } : v))
        );
      } else {
        alert('신차 뱃지 설정 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Toggle new error:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const handleToggleActive = async (vehicleId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        const updatedVehicle = await res.json();
        setVehicles((prev) =>
          prev.map((v) => (v.id === vehicleId ? { ...v, isActive: updatedVehicle.isActive } : v))
        );
      } else {
        alert('공개 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      alert('오류가 발생했습니다.');
    }
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
      {/* Header */}
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">차량 관리</h1>
        <Button asChild size="sm" className="md:size-default">
          <Link href="/admin/vehicles/new" className="flex items-center gap-1 md:gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">차량 등록</span>
            <span className="sm:hidden">등록</span>
          </Link>
        </Button>
      </div>

      {/* Filter & Search Section */}
      <Card className="p-3 md:p-4 mb-4 md:mb-6">
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Search - Mobile first */}
          <div className="w-full lg:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="차량명 검색..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
            {/* Brand Filter */}
            <div className="flex-1">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">브랜드</label>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                <button
                  onClick={() => setSelectedBrand('all')}
                  className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    selectedBrand === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체 ({vehicleCountByBrand.all || 0})
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand.id)}
                    className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                      selectedBrand === brand.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {brand.nameKr} ({vehicleCountByBrand[brand.id] || 0})
                  </button>
                ))}
              </div>
            </div>

            {/* Search - Desktop */}
            <div className="hidden lg:block lg:w-80">
              <label className="block text-sm font-medium text-gray-700 mb-2">차량 검색</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="차량명 또는 브랜드로 검색..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Active filters info */}
        {(selectedBrand !== 'all' || searchQuery) && (
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t flex items-center gap-2">
            <span className="text-xs md:text-sm text-gray-500">
              검색 결과: <strong className="text-primary">{filteredVehicles.length}</strong>대
            </span>
            <button
              onClick={() => {
                setSelectedBrand('all');
                setSearchQuery('');
              }}
              className="text-xs md:text-sm text-primary hover:underline"
            >
              초기화
            </button>
          </div>
        )}
      </Card>

      {/* Vehicle List */}
      {filteredVehicles.length === 0 ? (
        <Card className="p-8 md:p-12 text-center">
          <p className="text-gray-500 mb-4 text-sm md:text-base">
            {vehicles.length === 0
              ? '등록된 차량이 없습니다.'
              : '검색 결과가 없습니다.'}
          </p>
          {vehicles.length === 0 && (
            <Button asChild>
              <Link href="/admin/vehicles/new">첫 차량 등록하기</Link>
            </Button>
          )}
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className={`p-3 ${!vehicle.isActive ? 'opacity-60' : ''}`}>
                <div className="flex gap-3">
                  <div className="w-20 h-14 bg-white border border-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                    {vehicle.thumbnail ? (
                      <Image
                        src={vehicle.thumbnail}
                        alt={vehicle.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        없음
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{vehicle.name}</p>
                        <p className="text-xs text-gray-500">{vehicle.brand?.nameKr} · {getCategoryLabel(vehicle.category)}</p>
                      </div>
                      <button
                        onClick={() => handleToggleActive(vehicle.id, vehicle.isActive)}
                        className="flex-shrink-0"
                      >
                        {vehicle.isActive ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {vehicle.isPopular && (
                        <span className="text-[10px] text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">인기</span>
                      )}
                      {vehicle.isNew && (
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">신차</span>
                      )}
                      <span className="text-xs font-medium text-primary ml-auto">
                        {vehicle.rentPrice60_30 ? `${formatPrice(vehicle.rentPrice60_30)}원` : '-'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 mt-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 ${vehicle.isPopular ? 'text-yellow-600' : 'text-gray-400'}`}
                    onClick={() => handleTogglePopular(vehicle.id, vehicle.isPopular)}
                  >
                    <Star className={`w-4 h-4 ${vehicle.isPopular ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 ${vehicle.isNew ? 'text-blue-600' : 'text-gray-400'}`}
                    onClick={() => handleToggleNew(vehicle.id, vehicle.isNew)}
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="h-8 px-2">
                    <Link href={`/admin/vehicles/${vehicle.id}/edit`}>
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-red-600"
                    onClick={() => handleDelete(vehicle.id, vehicle.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="overflow-hidden hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      차량
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      브랜드
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      차종
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      월 납입금 (선납금 30%, 60개월)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className={!vehicle.isActive ? 'bg-gray-50 opacity-60' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 bg-white border border-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                            {vehicle.thumbnail ? (
                              <Image
                                src={vehicle.thumbnail}
                                alt={vehicle.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                없음
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{vehicle.name}</p>
                            <div className="flex gap-1">
                              {vehicle.isPopular && (
                                <span className="text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                                  인기
                                </span>
                              )}
                              {vehicle.isNew && (
                                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                  신차
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vehicle.brand?.nameKr}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getCategoryLabel(vehicle.category)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {vehicle.rentPrice60_30 ? `${formatPrice(vehicle.rentPrice60_30)}원` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(vehicle.id, vehicle.isActive)}
                          className="transition-all"
                        >
                          {vehicle.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full hover:bg-green-100">
                              <Eye className="w-3 h-3" />
                              공개
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200">
                              <EyeOff className="w-3 h-3" />
                              비공개
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            title={vehicle.isPopular ? '인기차량 해제' : '인기차량 설정'}
                            className={vehicle.isPopular ? 'text-yellow-600 hover:bg-yellow-50 border-yellow-300' : 'hover:text-yellow-600'}
                            onClick={() => handleTogglePopular(vehicle.id, vehicle.isPopular)}
                          >
                            {vehicle.isPopular ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title={vehicle.isNew ? '신차 뱃지 해제' : '신차 뱃지 설정'}
                            className={vehicle.isNew ? 'text-blue-600 hover:bg-blue-50 border-blue-300' : 'hover:text-blue-600'}
                            onClick={() => handleToggleNew(vehicle.id, vehicle.isNew)}
                          >
                            <Sparkles className="w-4 h-4" />
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/vehicles/${vehicle.id}/edit`}>
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(vehicle.id, vehicle.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
