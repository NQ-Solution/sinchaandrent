'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone, MessageCircle, Car, SlidersHorizontal, X, ChevronDown, ChevronUp,
  LayoutGrid, List, Check, ArrowRight, Fuel, Users, Scale
} from 'lucide-react';
import BannerSlider from '@/components/BannerSlider';
import { VehicleCard } from '@/components/vehicle';
import { Button } from '@/components/ui/Button';
import { KakaoIcon } from '@/components/icons/KakaoIcon';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import type { Brand, Vehicle } from '@/types';

const CATEGORIES = [
  { value: 'SEDAN', label: '세단', icon: '🚗' },
  { value: 'SUV', label: 'SUV', icon: '🚙' },
  { value: 'VAN', label: 'RV/미니밴', icon: '🚐' },
  { value: 'EV', label: '전기차', icon: '⚡' },
  { value: 'TRUCK', label: '픽업/트럭', icon: '🛻' },
];
const FUEL_TYPES = [
  { value: 'GASOLINE', label: '휘발유' },
  { value: 'DIESEL', label: '경유' },
  { value: 'LPG', label: 'LPG' },
  { value: 'HYBRID', label: '하이브리드' },
  { value: 'EV', label: '전기(EV)' },
];
const PRICE_RANGES = [
  { value: '0-300000', label: '30만원 이하', min: 0, max: 300000 },
  { value: '300000-500000', label: '30~50만원', min: 300000, max: 500000 },
  { value: '500000-700000', label: '50~70만원', min: 500000, max: 700000 },
  { value: '700000-1000000', label: '70~100만원', min: 700000, max: 1000000 },
  { value: '1000000-', label: '100만원 이상', min: 1000000, max: Infinity },
];
const SEATING_OPTIONS = [
  { value: '5', label: '5인승' },
  { value: '7', label: '7인승' },
  { value: '9', label: '9인승 이상' },
];
const DRIVE_TYPES = [
  { value: '전륜', label: '전륜(FF)' },
  { value: '후륜', label: '후륜(FR)' },
  { value: '4륜', label: '4륜(AWD)' },
];
const SORT_OPTIONS = [
  { value: 'price-low', label: '낮은가격순' },
  { value: 'price-high', label: '높은가격순' },
  { value: 'popular', label: '인기순' },
  { value: 'newest', label: '최신순' },
];

function FilterSection({
  title,
  children,
  defaultOpen = true
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2"
      >
        <h4 className="font-semibold text-gray-900">{title}</h4>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}

// 리스트 뷰용 차량 카드
function VehicleListCard({ vehicle, isCompareSelected, onToggleCompare }: {
  vehicle: Vehicle;
  isCompareSelected: boolean;
  onToggleCompare: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* 이미지 */}
        <Link href={`/vehicle/${vehicle.id}`} className="sm:w-72 flex-shrink-0">
          <div className="relative aspect-[16/10] sm:aspect-[4/3] bg-gray-100">
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
            {vehicle.isPopular && (
              <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                BEST
              </span>
            )}
          </div>
        </Link>

        {/* 정보 */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-xs text-gray-400 mb-1 block">
                  {getCategoryLabel(vehicle.category)}
                </span>
                <Link href={`/vehicle/${vehicle.id}`}>
                  <h3 className="text-lg font-bold text-gray-900 hover:text-primary transition-colors">
                    {vehicle.name}
                  </h3>
                </Link>
              </div>
              <button
                onClick={() => onToggleCompare(vehicle.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isCompareSelected
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isCompareSelected ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                비교
              </button>
            </div>

            {/* 스펙 */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              {vehicle.fuelTypes && vehicle.fuelTypes.length > 0 && (
                <div className="flex items-center gap-1">
                  <Fuel className="w-4 h-4" />
                  <span>{vehicle.fuelTypes.map(f => FUEL_TYPES.find(ft => ft.value === f)?.label || f).join('/')}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{vehicle.seatingCapacityMin || 5}인승</span>
              </div>
            </div>
          </div>

          {/* 가격 & CTA */}
          <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">월 렌트료 (60개월 기준)</p>
              <p className="text-2xl font-black text-gray-900">
                {vehicle.rentPrice60_0 ? (
                  <>
                    {formatPrice(vehicle.rentPrice60_0)}
                    <span className="text-sm font-normal text-gray-400">원~</span>
                  </>
                ) : (
                  <span className="text-lg font-semibold text-primary">상담문의</span>
                )}
              </p>
            </div>
            <Button asChild size="sm" className="rounded-full">
              <Link href={`/vehicle/${vehicle.id}`} className="flex items-center gap-1">
                상세보기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 차량 비교 플로팅 바
function CompareBar({ vehicles, onRemove, onClear }: {
  vehicles: Vehicle[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  if (vehicles.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Scale className="w-5 h-5 text-primary" />
            비교 ({vehicles.length}/3)
          </div>

          <div className="flex-1 flex gap-3 overflow-x-auto pb-1">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center gap-2 bg-gray-100 rounded-full pl-1 pr-3 py-1 flex-shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                  {vehicle.thumbnail ? (
                    <Image src={vehicle.thumbnail} alt="" width={32} height={32} className="object-cover w-full h-full" />
                  ) : (
                    <Car className="w-4 h-4 m-2 text-gray-400" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                  {vehicle.name}
                </span>
                <button onClick={() => onRemove(vehicle.id)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={onClear} className="rounded-full">
              초기화
            </Button>
            <Button
              size="sm"
              className="rounded-full"
              disabled={vehicles.length < 2}
              onClick={() => {
                const ids = vehicles.map(v => v.id).join(',');
                window.location.href = `/vehicles/compare?ids=${ids}`;
              }}
            >
              비교하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CompanyInfo {
  phone?: string;
  kakaoChannelUrl?: string;
}

function VehiclesContent() {
  const searchParams = useSearchParams();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandTab, setBrandTab] = useState<'domestic' | 'import'>('domestic');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(searchParams.get('brand'));
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedSeating, setSelectedSeating] = useState<string[]>([]);
  const [selectedDriveTypes, setSelectedDriveTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('price-low');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});

  const phoneNumber = companyInfo.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || '1588-0000';
  const kakaoUrl = companyInfo.kakaoChannelUrl || process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || '#';

  useEffect(() => {
    async function fetchData() {
      try {
        const [brandsRes, vehiclesRes, companyRes] = await Promise.all([
          fetch('/api/brands'),
          fetch('/api/vehicles'),
          fetch('/api/company-info'),
        ]);
        const brandsData = await brandsRes.json();
        const vehiclesData = await vehiclesRes.json();
        setBrands(brandsData);
        setVehicles(vehiclesData);
        if (companyRes.ok) {
          const companyData = await companyRes.json();
          setCompanyInfo(companyData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...vehicles];

    const domesticBrandIds = brands.filter(b => b.isDomestic === true).map(b => b.id);
    const importBrandIds = brands.filter(b => b.isDomestic === false).map(b => b.id);
    const currentTabBrandIds = brandTab === 'domestic' ? domesticBrandIds : importBrandIds;
    result = result.filter((v) => currentTabBrandIds.includes(v.brandId));

    if (selectedBrand) {
      result = result.filter((v) => v.brandId === selectedBrand);
    }

    if (selectedCategories.length > 0) {
      result = result.filter((v) => selectedCategories.includes(v.category));
    }

    if (selectedFuelTypes.length > 0) {
      result = result.filter((v) => {
        if (!v.fuelTypes || v.fuelTypes.length === 0) return false;
        return selectedFuelTypes.some((ft) => v.fuelTypes.includes(ft));
      });
    }

    if (selectedPriceRanges.length > 0) {
      result = result.filter((v) => {
        const price = v.rentPrice60_0 || 0;
        return selectedPriceRanges.some((rangeValue) => {
          const range = PRICE_RANGES.find((r) => r.value === rangeValue);
          if (!range) return false;
          return price >= range.min && price < range.max;
        });
      });
    }

    if (selectedSeating.length > 0) {
      result = result.filter((v) => {
        const minCapacity = v.seatingCapacityMin || 5;
        const maxCapacity = v.seatingCapacityMax || minCapacity;
        return selectedSeating.some((seat) => {
          const seatNum = parseInt(seat);
          if (seat === '9') return maxCapacity >= 9;
          return minCapacity <= seatNum && seatNum <= maxCapacity;
        });
      });
    }

    if (selectedDriveTypes.length > 0) {
      result = result.filter((v) => {
        if (!v.driveTypes || v.driveTypes.length === 0) return false;
        return selectedDriveTypes.some((dt) => v.driveTypes.includes(dt));
      });
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.rentPrice60_0 || 0) - (b.rentPrice60_0 || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.rentPrice60_0 || 0) - (a.rentPrice60_0 || 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    setFilteredVehicles(result);
  }, [vehicles, brands, brandTab, selectedBrand, selectedCategories, selectedFuelTypes, selectedPriceRanges, selectedSeating, selectedDriveTypes, sortBy]);

  useEffect(() => {
    if (showMobileFilter) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileFilter]);

  const handleBrandSelect = (brandId: string | null) => {
    setSelectedBrand(brandId);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleFuelType = (fuelType: string) => {
    setSelectedFuelTypes((prev) =>
      prev.includes(fuelType) ? prev.filter((f) => f !== fuelType) : [...prev, fuelType]
    );
  };

  const togglePriceRange = (range: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const toggleSeating = (seating: string) => {
    setSelectedSeating((prev) =>
      prev.includes(seating) ? prev.filter((s) => s !== seating) : [...prev, seating]
    );
  };

  const toggleDriveType = (driveType: string) => {
    setSelectedDriveTypes((prev) =>
      prev.includes(driveType) ? prev.filter((d) => d !== driveType) : [...prev, driveType]
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedFuelTypes([]);
    setSelectedPriceRanges([]);
    setSelectedSeating([]);
    setSelectedDriveTypes([]);
  };

  const toggleCompare = useCallback((vehicleId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, vehicleId];
    });
  }, []);

  const compareVehicles = vehicles.filter(v => compareIds.includes(v.id));

  const activeFilterCount =
    selectedCategories.length +
    selectedFuelTypes.length +
    selectedPriceRanges.length +
    selectedSeating.length +
    selectedDriveTypes.length;

  const hasActiveFilters = activeFilterCount > 0;

  const domesticBrands = brands.filter((b) => b.isDomestic === true);
  const importBrands = brands.filter((b) => b.isDomestic === false);
  const selectedBrandName = brands.find((b) => b.id === selectedBrand)?.nameKr || '전체';

  const handleBrandTabChange = (tab: 'domestic' | 'import') => {
    setBrandTab(tab);
    setSelectedBrand(null);
  };

  const FilterContent = () => (
    <>
      <FilterSection title="월 렌트비">
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <label key={range.value} className="flex items-center gap-3 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={selectedPriceRanges.includes(range.value)}
                onChange={() => togglePriceRange(range.value)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="차종">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => toggleCategory(category.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategories.includes(category.value)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="연료">
        <div className="flex flex-wrap gap-2">
          {FUEL_TYPES.map((fuel) => (
            <button
              key={fuel.value}
              onClick={() => toggleFuelType(fuel.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedFuelTypes.includes(fuel.value)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {fuel.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="승차 인원" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {SEATING_OPTIONS.map((seat) => (
            <button
              key={seat.value}
              onClick={() => toggleSeating(seat.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedSeating.includes(seat.value)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {seat.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="구동방식" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {DRIVE_TYPES.map((drive) => (
            <button
              key={drive.value}
              onClick={() => toggleDriveType(drive.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedDriveTypes.includes(drive.value)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {drive.label}
            </button>
          ))}
        </div>
      </FilterSection>
    </>
  );

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20">
      {/* 히어로 섹션 - 모던 디자인 */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary py-8 sm:py-10 md:py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 sm:mb-4 break-keep">
              어떤 차량을 찾으시나요?
            </h1>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg">
              <span className="text-primary-300 font-bold">{filteredVehicles.length}</span>개 차량 중에서 나에게 딱 맞는 차를 찾아보세요
            </p>
          </div>

          {/* 브랜드 탭 */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="inline-flex bg-white/10 backdrop-blur rounded-full p-1">
              <button
                onClick={() => handleBrandTabChange('domestic')}
                className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm font-bold transition-all ${
                  brandTab === 'domestic'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                국산차
              </button>
              <button
                onClick={() => handleBrandTabChange('import')}
                className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm font-bold transition-all ${
                  brandTab === 'import'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                수입차
              </button>
            </div>
          </div>

          {/* 브랜드 선택 */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => handleBrandSelect(null)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  !selectedBrand
                    ? 'bg-primary text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                전체
              </button>
              {(brandTab === 'domestic' ? domesticBrands : importBrands).map((brand) => brand && (
                <button
                  key={brand.id}
                  onClick={() => handleBrandSelect(brand.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedBrand === brand.id
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {brand.nameKr || brand.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 배너 */}
      <BannerSlider />

      {/* 필터 & 정렬 바 */}
      <section className="bg-white py-3 px-4 border-b sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            {/* 모바일 필터 버튼 */}
            <button
              onClick={() => setShowMobileFilter(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">필터</span>
              {activeFilterCount > 0 && (
                <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="text-sm md:text-base text-gray-900">
              <span className="font-medium">{selectedBrandName}</span>{' '}
              <span className="text-primary font-bold">{filteredVehicles.length}</span>대
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 뷰 모드 전환 */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* 정렬 */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm transition-colors"
              >
                <span className="text-gray-600 hidden sm:inline">정렬:</span>
                <span className="font-medium">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border py-2 z-50 min-w-[160px]">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                          sortBy === option.value ? 'text-primary font-medium bg-primary/5' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 활성 필터 태그 */}
        {hasActiveFilters && (
          <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2 flex-wrap">
            <button onClick={resetFilters} className="text-xs text-gray-500 hover:text-primary underline">
              전체 해제
            </button>
            {selectedCategories.map(c => (
              <span key={c} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                {CATEGORIES.find(cat => cat.value === c)?.label}
                <button onClick={() => toggleCategory(c)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {selectedFuelTypes.map(f => (
              <span key={f} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                {FUEL_TYPES.find(fuel => fuel.value === f)?.label}
                <button onClick={() => toggleFuelType(f)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {selectedPriceRanges.map(p => (
              <span key={p} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                {PRICE_RANGES.find(pr => pr.value === p)?.label}
                <button onClick={() => togglePriceRange(p)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 모바일 필터 바텀시트 */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilter(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-3xl">
              <h3 className="font-bold text-lg">필터</h3>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button onClick={resetFilters} className="text-sm text-primary hover:underline">
                    초기화
                  </button>
                )}
                <button onClick={() => setShowMobileFilter(false)}>
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <FilterContent />
            </div>

            <div className="p-4 border-t bg-white">
              <Button onClick={() => setShowMobileFilter(false)} className="w-full rounded-full" size="lg">
                {filteredVehicles.length}개 차량 보기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <section className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex gap-8">
          {/* 데스크톱 필터 사이드바 */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-32">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">필터</h3>
                {hasActiveFilters && (
                  <button onClick={resetFilters} className="text-sm text-primary hover:underline">
                    초기화
                  </button>
                )}
              </div>
              <FilterContent />

              {/* 상담 CTA */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3">원하는 차량이 없으신가요?</p>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full rounded-full" size="sm">
                    <a href={`tel:${phoneNumber}`} className="flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      전화 상담
                    </a>
                  </Button>
                  <Button asChild className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-300 rounded-full" size="sm">
                    <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      <KakaoIcon className="w-4 h-4" />
                      카카오톡
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* 차량 목록 */}
          <div className="flex-1">
            {filteredVehicles.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 md:p-16">
                <div className="text-center max-w-lg mx-auto">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Car className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {selectedBrand ? `${selectedBrandName} 차량을 찾고 계시나요?` : '원하시는 차량을 찾고 계시나요?'}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    현재 조건에 맞는 차량이 없습니다.<br />
                    <strong className="text-primary">전화 상담</strong>을 통해 특별 주문이 가능합니다.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                    <Button asChild className="gap-2 rounded-full">
                      <a href={`tel:${phoneNumber}`}>
                        <Phone className="w-4 h-4" />
                        전화 상담
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="gap-2 rounded-full">
                      <Link href="/contact">
                        <MessageCircle className="w-4 h-4" />
                        온라인 문의
                      </Link>
                    </Button>
                  </div>

                  {hasActiveFilters && (
                    <button onClick={resetFilters} className="text-sm text-gray-500 hover:text-primary underline">
                      필터 초기화
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="relative">
                    <VehicleCard vehicle={vehicle} />
                    {/* 비교 체크박스 */}
                    <button
                      onClick={() => toggleCompare(vehicle.id)}
                      className={`absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        compareIds.includes(vehicle.id)
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-white/90 backdrop-blur text-gray-600 hover:bg-white shadow'
                      }`}
                    >
                      {compareIds.includes(vehicle.id) ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
                      비교
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVehicles.map((vehicle) => (
                  <VehicleListCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    isCompareSelected={compareIds.includes(vehicle.id)}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 비교 바 */}
      <CompareBar
        vehicles={compareVehicles}
        onRemove={(id) => setCompareIds(prev => prev.filter(i => i !== id))}
        onClear={() => setCompareIds([])}
      />

      {/* 비교 바가 있을 때 하단 여백 */}
      {compareIds.length > 0 && <div className="h-24" />}
    </div>
  );
}

function VehiclesLoading() {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={<VehiclesLoading />}>
      <VehiclesContent />
    </Suspense>
  );
}
