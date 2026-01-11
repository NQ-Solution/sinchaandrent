'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Copy, Check, ChevronDown, ChevronUp, Phone, Car, Fuel, Users,
  Settings2, Calendar, Percent, CheckCircle, Star, Shield, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { KakaoIcon } from '@/components/icons/KakaoIcon';
import { getCategoryLabel, getFuelTypeLabel, formatPrice, getDriveTypeLabel } from '@/lib/utils';
import type { Vehicle } from '@/types';

interface ColorOption {
  id: string;
  name: string;
  hexCode: string;
  price: number;
  type: 'EXTERIOR' | 'INTERIOR';
  trimColorId?: string;
}

interface VehicleOption {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  trimOptionId?: string;
  isIncluded?: boolean;
}

interface TrimOption {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  availableColors?: ColorOption[];
  availableOptions?: VehicleOption[];
}

interface VehicleWithOptions extends Omit<Vehicle, 'trims' | 'colors' | 'options'> {
  trims?: TrimOption[];
  colors?: ColorOption[];
  options?: VehicleOption[];
}

const CONTRACT_PERIODS = [24, 36, 48, 60];
const DEPOSIT_RATIOS = [0, 30, 40];

export default function VehicleDetailPage() {
  const params = useParams();
  const [vehicle, setVehicle] = useState<VehicleWithOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'trim' | 'color' | 'option'>('trim');

  const [availableTrims, setAvailableTrims] = useState<TrimOption[]>([]);
  const [availableExteriorColors, setAvailableExteriorColors] = useState<ColorOption[]>([]);
  const [availableInteriorColors, setAvailableInteriorColors] = useState<ColorOption[]>([]);
  const [availableOptions, setAvailableOptions] = useState<VehicleOption[]>([]);

  const [selectedTrim, setSelectedTrim] = useState<TrimOption | null>(null);
  const [selectedExterior, setSelectedExterior] = useState<ColorOption | null>(null);
  const [selectedInterior, setSelectedInterior] = useState<ColorOption | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<VehicleOption[]>([]);
  const [period, setPeriod] = useState(60);
  const [depositRatio, setDepositRatio] = useState(0);
  const [companyInfo, setCompanyInfo] = useState<{ phone?: string; kakaoUrl?: string; companyName?: string }>({});
  const [isNearFooter, setIsNearFooter] = useState(false);

  const phoneNumber = companyInfo.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || '1588-0000';
  const kakaoUrl = companyInfo.kakaoUrl || process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || '#';
  const companyName = companyInfo.companyName || '신차앤렌트';

  useEffect(() => {
    async function fetchCompanyInfo() {
      try {
        const res = await fetch('/api/company-info');
        if (res.ok) {
          const data = await res.json();
          setCompanyInfo({
            phone: data.phone,
            kakaoUrl: data.kakaoChannelUrl,
            companyName: data.companyName,
          });
        }
      } catch (error) {
        console.error('Failed to fetch company info:', error);
      }
    }
    fetchCompanyInfo();
  }, []);

  useEffect(() => {
    async function fetchVehicle() {
      try {
        const res = await fetch(`/api/vehicles/${params.id}`);
        if (!res.ok) throw new Error('Vehicle not found');
        const data: VehicleWithOptions = await res.json();
        setVehicle(data);

        if (data.trims && data.trims.length > 0) {
          setAvailableTrims(data.trims);
          setSelectedTrim(data.trims[0]);
        }

        // 사용 가능한 선납금 비율 중 첫 번째를 기본값으로 설정
        const availableDeposits = DEPOSIT_RATIOS.filter(d => {
          const fieldName = `rentPrice${period}_${d}` as keyof typeof data;
          const price = data[fieldName];
          return typeof price === 'number' && price > 0;
        });
        if (availableDeposits.length > 0 && !availableDeposits.includes(0)) {
          setDepositRatio(availableDeposits[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchVehicle();
    }
  }, [params.id]);

  // 트림 변경 시 색상과 옵션 업데이트
  useEffect(() => {
    if (!selectedTrim) return;

    // 무료 색상을 먼저 찾는 헬퍼 함수
    const findFreeOrLowestPriceColor = (colors: ColorOption[]): ColorOption | null => {
      if (colors.length === 0) return null;
      // 무료(price = 0) 색상 먼저 찾기
      const freeColor = colors.find(c => c.price === 0);
      if (freeColor) return freeColor;
      // 무료가 없으면 가장 저렴한 색상 선택
      return [...colors].sort((a, b) => a.price - b.price)[0];
    };

    // 트림의 availableColors에서 외부/내부 색상 분리
    if (selectedTrim.availableColors && selectedTrim.availableColors.length > 0) {
      const exteriorColors = selectedTrim.availableColors.filter(c => c.type === 'EXTERIOR');
      const interiorColors = selectedTrim.availableColors.filter(c => c.type === 'INTERIOR');

      setAvailableExteriorColors(exteriorColors);
      setAvailableInteriorColors(interiorColors);

      // 기존 선택이 현재 트림에서 사용 가능한지 확인
      // 사용 불가능하면 무료/최저가 색상 자동 선택
      if (!exteriorColors.find(c => c.id === selectedExterior?.id)) {
        setSelectedExterior(findFreeOrLowestPriceColor(exteriorColors));
      }
      if (!interiorColors.find(c => c.id === selectedInterior?.id)) {
        setSelectedInterior(findFreeOrLowestPriceColor(interiorColors));
      }
    } else {
      setAvailableExteriorColors([]);
      setAvailableInteriorColors([]);
      setSelectedExterior(null);
      setSelectedInterior(null);
    }

    // 트림의 availableOptions 설정
    if (selectedTrim.availableOptions && selectedTrim.availableOptions.length > 0) {
      setAvailableOptions(selectedTrim.availableOptions);

      // 기본 포함 옵션은 자동 선택
      const includedOptions = selectedTrim.availableOptions.filter(o => o.isIncluded);
      setSelectedOptions(includedOptions);
    } else {
      setAvailableOptions([]);
      setSelectedOptions([]);
    }
  }, [selectedTrim, selectedExterior?.id, selectedInterior?.id]);

  useEffect(() => {
    if (showMobileSummary) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileSummary]);

  // 푸터 근처 감지 - 하단 바 숨김 처리
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // 푸터가 화면에 보이기 시작하면 하단 바 숨김
        setIsNearFooter(footerRect.top < windowHeight);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const basePrice = vehicle?.basePrice || 0;
  const trimPrice = selectedTrim?.price || 0;
  const exteriorPrice = selectedExterior?.price || 0;
  const interiorPrice = selectedInterior?.price || 0;
  // 기본 포함 옵션은 가격 계산에서 제외
  const optionsTotal = selectedOptions.reduce((sum, opt) => sum + (opt.isIncluded ? 0 : opt.price), 0);
  const totalVehiclePrice = basePrice + trimPrice + exteriorPrice + interiorPrice + optionsTotal;
  const depositAmount = Math.floor(totalVehiclePrice * (depositRatio / 100));

  // 가장 저렴한 트림 가격 (기본 트림)
  const lowestTrimPrice = availableTrims.length > 0
    ? Math.min(...availableTrims.map(t => t.price))
    : 0;

  // 추가 비용 발생 여부 체크 (기본 대비 추가 금액이 있으면 true)
  // - 트림이 최저가 트림보다 비싸면 추가 비용
  // - 색상에 추가 비용이 있으면 추가 비용
  // - 기본 포함이 아닌 옵션을 선택하면 추가 비용
  const hasAdditionalCost =
    trimPrice > lowestTrimPrice ||
    exteriorPrice > 0 ||
    interiorPrice > 0 ||
    optionsTotal > 0;

  const getMonthlyPaymentFromDB = useMemo(() => {
    if (!vehicle) return null;
    const fieldName = `rentPrice${period}_${depositRatio}` as keyof typeof vehicle;
    const price = vehicle[fieldName];
    return typeof price === 'number' && price > 0 ? price : null;
  }, [vehicle, period, depositRatio]);

  const getAvailableDepositsForPeriod = useMemo(() => {
    if (!vehicle) return [];
    return DEPOSIT_RATIOS.filter(d => {
      const fieldName = `rentPrice${period}_${d}` as keyof typeof vehicle;
      const price = vehicle[fieldName];
      return typeof price === 'number' && price > 0;
    });
  }, [vehicle, period]);

  const hasPriceForPeriod = (p: number) => {
    if (!vehicle) return false;
    return DEPOSIT_RATIOS.some(d => {
      const fieldName = `rentPrice${p}_${d}` as keyof typeof vehicle;
      const price = vehicle[fieldName];
      return typeof price === 'number' && price > 0;
    });
  };

  const hasMonthlyPayment = getMonthlyPaymentFromDB !== null && getMonthlyPaymentFromDB > 0;

  const toggleOption = (option: VehicleOption) => {
    // 기본 포함 옵션은 선택 해제 불가
    if (option.isIncluded) return;

    setSelectedOptions((prev) =>
      prev.find((o) => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option]
    );
  };

  const handleCopyQuote = async () => {
    if (!vehicle || !hasMonthlyPayment) return;

    const includedOptions = selectedOptions.filter(o => o.isIncluded);
    const additionalOptions = selectedOptions.filter(o => !o.isIncluded);

    const includedOptionsList = includedOptions.length > 0
      ? `\n기본 포함 옵션:\n${includedOptions.map((o) => `  - ${o.name}`).join('\n')}`
      : '';

    const additionalOptionsList = additionalOptions.length > 0
      ? `\n추가 옵션:\n${additionalOptions.map((o) => `  - ${o.name}: +${formatPrice(o.price)}원`).join('\n')}`
      : '';

    const quote = `
[${companyName} 견적서]

차량: ${vehicle.brand?.nameKr} ${vehicle.name}
트림: ${selectedTrim?.name || '선택 없음'}
외장 색상: ${selectedExterior?.name || '선택 없음'}
내장 색상: ${selectedInterior?.name || '선택 없음'}${includedOptionsList}${additionalOptionsList}

■ 차량 가격 상세
- 기본 차량: ${formatPrice(basePrice)}원
- 트림: +${formatPrice(trimPrice)}원
- 외장 색상: +${formatPrice(exteriorPrice)}원
- 내장 색상: +${formatPrice(interiorPrice)}원
- 추가 옵션: +${formatPrice(optionsTotal)}원
━━━━━━━━━━━━━━━━━━━━━━
총 차량 가격: ${formatPrice(totalVehiclePrice)}원

■ 계약 조건
- 이용 형태: 장기렌트
- 계약 기간: ${period}개월
- 선납금 비율: ${depositRatio}%
- 선납금: ${formatPrice(depositAmount)}원

━━━━━━━━━━━━━━━━━━━━━━
월 납입금: ${formatPrice(getMonthlyPaymentFromDB!)}원~ (최소 기준)
━━━━━━━━━━━━━━━━━━━━━━

※ 위 금액은 최소 기준 금액입니다.
※ 추가 옵션, 보험, 정비 조건 등에 따라 월 납입금이 달라질 수 있습니다.
※ 실제 계약 시 신용등급, 금융조건에 따라 월 납입금이 변동될 수 있습니다.
※ 정비비는 미포함이며, 선택 시 추가 가능합니다.

상담 문의: ${phoneNumber}
    `.trim();

    try {
      await navigator.clipboard.writeText(quote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">차량을 찾을 수 없습니다.</p>
          <Button asChild>
            <Link href="/vehicles">차량 목록으로</Link>
          </Button>
        </div>
      </div>
    );
  }

  const allImages = [vehicle.thumbnail, ...(vehicle.images || [])].filter(Boolean) as string[];

  return (
    <div className="pt-16 pb-24 lg:pb-8 bg-gray-50">
      {/* Hero Image Gallery */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-white">
                {allImages.length > 0 ? (
                  <Image
                    src={allImages[selectedImageIndex]}
                    alt={vehicle.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-24 h-24 text-white/20" />
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex ? 'border-primary ring-2 ring-primary/30' : 'border-white/20'
                      }`}
                    >
                      <Image src={image} alt="" width={80} height={80} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="order-1 lg:order-2 text-white">
              {/* Breadcrumb */}
              <div className="text-sm text-gray-400 mb-4">
                <Link href="/" className="hover:text-white">홈</Link>
                <span className="mx-2">/</span>
                <Link href="/vehicles" className="hover:text-white">차량 검색</Link>
                <span className="mx-2">/</span>
                <span className="text-white">{vehicle.brand?.nameKr}</span>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {vehicle.isPopular && (
                  <span className="inline-flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    <Star className="w-3 h-3" /> BEST
                  </span>
                )}
                {vehicle.isNew && (
                  <span className="inline-flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    NEW
                  </span>
                )}
                <span className="bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full">
                  {getCategoryLabel(vehicle.category)}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-2">
                {vehicle.brand?.nameKr} {vehicle.name}
              </h1>
              {/* 모델 정보 */}
              {vehicle.baseModelName && (
                <div className="mb-4">
                  <span className="inline-flex items-center bg-white/10 text-white/90 text-sm font-medium px-3 py-1.5 rounded-full">
                    {vehicle.baseModelName} 기준
                  </span>
                  {vehicle.hasOtherModels && (
                    <span className="ml-2 text-sm text-gray-400">
                      · 다른 모델(디젤, 하이브리드 등)은 상담 문의
                    </span>
                  )}
                </div>
              )}
              {/* Quick Specs */}
              <div className="flex flex-wrap gap-3 mb-6">
                {vehicle.fuelTypes && vehicle.fuelTypes.length > 0 && (
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                    <Fuel className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-300">연료</p>
                      <p className="font-semibold text-sm sm:text-base text-white">{vehicle.fuelTypes.map(ft => getFuelTypeLabel(ft)).join('/')}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-300">승차인원</p>
                    <p className="font-semibold text-sm sm:text-base text-white">
                      {vehicle.seatingCapacityMin && vehicle.seatingCapacityMax
                        ? (vehicle.seatingCapacityMin === vehicle.seatingCapacityMax
                          ? `${vehicle.seatingCapacityMin}인승`
                          : `${vehicle.seatingCapacityMin}~${vehicle.seatingCapacityMax}인승`)
                        : '5인승'}
                    </p>
                  </div>
                </div>
                {vehicle.driveTypes && vehicle.driveTypes.length > 0 && (
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                    <Settings2 className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-300">구동방식</p>
                      <p className="font-semibold text-sm sm:text-base text-white">{vehicle.driveTypes.map(dt => getDriveTypeLabel(dt)).join('/')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Highlight */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 md:p-6">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">월 렌트료</p>
                    <p className="text-3xl md:text-4xl font-black">
                      {hasMonthlyPayment && !hasAdditionalCost ? (
                        <>
                          {formatPrice(getMonthlyPaymentFromDB!)}
                          <span className="text-lg font-normal text-gray-400">원~</span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-white">상담문의</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {hasAdditionalCost ? '추가 옵션 선택됨' : `${period}개월 / 선납금 ${depositRatio}% 기준`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild className="flex-1 bg-white text-gray-900 hover:bg-gray-100 rounded-full">
                    <a href={`tel:${phoneNumber}`} className="flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      전화상담
                    </a>
                  </Button>
                  <Button asChild className="flex-1 bg-yellow-400 text-gray-900 hover:bg-yellow-300 rounded-full">
                    <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      <KakaoIcon className="w-4 h-4" />
                      카카오톡
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left: Options Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm p-2 flex gap-2">
              {[
                { key: 'trim', label: '트림', count: availableTrims.length },
                { key: 'color', label: '색상', count: availableExteriorColors.length + availableInteriorColors.length },
                { key: 'option', label: '옵션', count: availableOptions.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'trim' | 'color' | 'option')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Trim Selection */}
            {activeTab === 'trim' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" />
                  트림 선택
                </h3>
                {availableTrims.length > 0 ? (
                  <div className="space-y-3">
                    {availableTrims.map((trim) => (
                      <button
                        key={trim.id}
                        onClick={() => setSelectedTrim(trim)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedTrim?.id === trim.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-100 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center ${
                            selectedTrim?.id === trim.id ? 'border-primary bg-primary' : 'border-gray-300'
                          }`}>
                            {selectedTrim?.id === trim.id && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-base sm:text-lg break-keep">{trim.name}</p>
                              {trim.description && (
                                <p className="text-sm text-gray-500 break-keep">{trim.description}</p>
                              )}
                            </div>
                            <p className={`font-bold text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${trim.price === 0 ? 'text-gray-600' : 'text-primary'}`}>
                              {trim.price === 0 ? '기본' : `+${formatPrice(trim.price)}원`}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Settings2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>등록된 트림 정보가 없습니다.</p>
                  </div>
                )}
              </div>
            )}

            {/* Color Selection */}
            {activeTab === 'color' && (
              <div className="space-y-6">
                {/* Exterior */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-lg mb-6">외장 색상</h3>
                  {availableExteriorColors.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                      {availableExteriorColors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setSelectedExterior(color)}
                          className="text-center group"
                        >
                          <div
                            className={`w-14 h-14 rounded-full mx-auto mb-2 border-4 transition-all group-hover:scale-110 ${
                              selectedExterior?.id === color.id
                                ? 'border-primary ring-4 ring-primary/20 shadow-lg'
                                : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color.hexCode }}
                          />
                          <p className="text-xs font-medium truncate">{color.name}</p>
                          <p className="text-xs text-gray-400">
                            {color.price === 0 ? '무료' : `+${formatPrice(color.price)}원`}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>등록된 외장 색상이 없습니다.</p>
                    </div>
                  )}
                </div>

                {/* Interior */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-lg mb-6">내장 색상</h3>
                  {availableInteriorColors.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                      {availableInteriorColors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setSelectedInterior(color)}
                          className="text-center group"
                        >
                          <div
                            className={`w-14 h-14 rounded-full mx-auto mb-2 border-4 transition-all group-hover:scale-110 ${
                              selectedInterior?.id === color.id
                                ? 'border-primary ring-4 ring-primary/20 shadow-lg'
                                : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color.hexCode }}
                          />
                          <p className="text-xs font-medium truncate">{color.name}</p>
                          <p className="text-xs text-gray-400">
                            {color.price === 0 ? '무료' : `+${formatPrice(color.price)}원`}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>등록된 내장 색상이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Options Selection */}
            {activeTab === 'option' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-6">추가 옵션</h3>
                {availableOptions.length > 0 ? (
                  <div className="space-y-3">
                    {availableOptions.map((option) => {
                      const isSelected = selectedOptions.find((o) => o.id === option.id);
                      const isIncluded = option.isIncluded;
                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleOption(option)}
                          disabled={isIncluded}
                          className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all ${
                            isIncluded
                              ? 'border-green-200 bg-green-50 cursor-default'
                              : isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-100 hover:border-primary/50'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                            isIncluded
                              ? 'border-green-500 bg-green-500'
                              : isSelected
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          }`}>
                            {(isSelected || isIncluded) && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold break-keep">{option.name}</p>
                              {isIncluded && (
                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                                  기본 포함
                                </span>
                              )}
                            </div>
                            {option.description && (
                              <p className="text-sm text-gray-500 break-keep line-clamp-2">{option.description}</p>
                            )}
                          </div>
                          <p className={`font-bold text-sm sm:text-base flex-shrink-0 whitespace-nowrap ${isIncluded ? 'text-green-600' : 'text-primary'}`}>
                            {isIncluded ? '포함' : `+${formatPrice(option.price)}원`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <p>등록된 추가 옵션이 없습니다.</p>
                  </div>
                )}
              </div>
            )}

            {/* Contract Conditions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                계약 조건
              </h3>

              <div className="space-y-6">
                {/* Period */}
                <div>
                  <label className="block font-medium mb-3 text-sm">계약 기간</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CONTRACT_PERIODS.map((p) => {
                      const hasPrice = hasPriceForPeriod(p);
                      return (
                        <button
                          key={p}
                          onClick={() => setPeriod(p)}
                          className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                            period === p
                              ? 'border-primary bg-primary text-white'
                              : hasPrice
                              ? 'border-gray-200 hover:border-primary'
                              : 'border-gray-100 text-gray-300 cursor-not-allowed'
                          }`}
                          disabled={!hasPrice}
                        >
                          {p}개월
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Deposit */}
                <div>
                  <label className="block font-medium mb-3 text-sm flex items-center gap-2">
                    <Percent className="w-4 h-4 text-gray-400" />
                    선납금 비율
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {DEPOSIT_RATIOS.map((d) => {
                      const hasPrice = getAvailableDepositsForPeriod.includes(d);
                      return (
                        <button
                          key={d}
                          onClick={() => setDepositRatio(d)}
                          className={`py-4 rounded-xl border-2 font-semibold transition-all ${
                            depositRatio === d
                              ? 'border-primary bg-primary text-white'
                              : hasPrice
                              ? 'border-gray-200 hover:border-primary'
                              : 'border-gray-100 text-gray-300 cursor-not-allowed'
                          }`}
                          disabled={!hasPrice}
                        >
                          <div className="text-lg">{d}%</div>
                          <div className={`text-xs mt-1 ${depositRatio === d ? 'text-white/70' : 'text-gray-400'}`}>
                            {formatPrice(Math.floor(totalVehiclePrice * (d / 100)))}원
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-primary to-primary-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4">장기렌트 혜택</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Shield, label: '보험료 포함' },
                  { icon: Settings2, label: '정비비 별도 (선택 가능)' },
                  { icon: CheckCircle, label: '세금 포함' },
                  { icon: Star, label: '신용영향 無' },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Price Summary (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-6">견적 요약</h3>

              {/* Selected Options Summary */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">기본 차량</span>
                  <span className="font-medium">{formatPrice(basePrice)}원</span>
                </div>
                {selectedTrim && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">트림: {selectedTrim.name}</span>
                    <span className="font-medium">+{formatPrice(trimPrice)}원</span>
                  </div>
                )}
                {selectedExterior && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      외장:
                      <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: selectedExterior.hexCode }} />
                      {selectedExterior.name}
                    </span>
                    <span className="font-medium">+{formatPrice(exteriorPrice)}원</span>
                  </div>
                )}
                {selectedInterior && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      내장:
                      <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: selectedInterior.hexCode }} />
                      {selectedInterior.name}
                    </span>
                    <span className="font-medium">+{formatPrice(interiorPrice)}원</span>
                  </div>
                )}
                {selectedOptions.length > 0 && selectedOptions.map((option) => (
                  <div key={option.id} className="flex justify-between text-sm">
                    <span className="text-gray-500 truncate pr-2">옵션: {option.name}</span>
                    <span className="font-medium flex-shrink-0">+{formatPrice(option.price)}원</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="text-sm text-gray-500 mb-1">총 차량 가격</div>
                <div className="text-2xl font-black">{formatPrice(totalVehiclePrice)}원</div>
              </div>

              {/* Monthly Payment */}
              {hasMonthlyPayment && !hasAdditionalCost ? (
                <div className="bg-gradient-to-r from-primary to-primary-600 text-white rounded-xl p-4 mb-4">
                  <div className="text-sm opacity-90 mb-1">월 납입금</div>
                  <div className="text-3xl font-black mb-1">{formatPrice(getMonthlyPaymentFromDB!)}원~</div>
                  <div className="text-xs opacity-80">
                    {period}개월 / 선납금 {depositRatio}% ({formatPrice(depositAmount)}원)
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 mb-4 text-center">
                  <p className="text-lg font-bold mb-1">맞춤 견적 상담</p>
                  <p className="text-sm opacity-90">
                    {hasAdditionalCost ? '선택하신 옵션에 맞는 정확한' : '해당 조건의'}
                  </p>
                  <p className="text-sm opacity-90">금액을 안내해 드립니다.</p>
                </div>
              )}

              {/* CTAs */}
              <div className="space-y-3">
                <Button asChild className="w-full rounded-full h-12">
                  <Link href="/contact" className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    상담 신청하기
                  </Link>
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="rounded-full">
                    <a href={`tel:${phoneNumber}`} className="flex items-center justify-center gap-1">
                      <Phone className="w-4 h-4" />
                      전화
                    </a>
                  </Button>
                  {hasMonthlyPayment && !hasAdditionalCost ? (
                    <Button onClick={handleCopyQuote} variant="outline" className="rounded-full">
                      {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copied ? '복사됨' : '견적복사'}
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="rounded-full bg-yellow-400 border-yellow-400 text-gray-900 hover:bg-yellow-300">
                      <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1">
                        <KakaoIcon className="w-4 h-4" />
                        카카오톡
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 pt-4 border-t text-xs text-gray-500 leading-relaxed space-y-1">
                <p>※ 실제 계약 시 신용등급, 금융조건에 따라 달라질 수 있습니다.</p>
                <p>※ 추가 옵션, 보험, 정비 조건 등에 따라 월 납입금이 달라질 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 transition-transform duration-300 ${
        isNearFooter ? 'translate-y-full' : 'translate-y-0'
      }`}>
        <div className="safe-area-bottom">
          <div className="px-4 py-3">
            {/* 가격 정보 및 상세보기 */}
            <button
              onClick={() => setShowMobileSummary(true)}
              className="w-full flex items-center justify-between mb-3 active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  hasAdditionalCost ? 'bg-orange-100' : 'bg-primary/10'
                }`}>
                  <Calendar className={`w-5 h-5 ${hasAdditionalCost ? 'text-orange-500' : 'text-primary'}`} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500">
                    {hasAdditionalCost ? '맞춤 견적' : `${period}개월 · 선납금 ${depositRatio}%`}
                  </p>
                  <p className={`text-lg font-black ${hasAdditionalCost ? 'text-orange-500' : 'text-gray-900'}`}>
                    {hasMonthlyPayment && !hasAdditionalCost ? (
                      <>월 {formatPrice(getMonthlyPaymentFromDB!)}<span className="text-sm font-normal text-gray-400">원~</span></>
                    ) : (
                      '상담 필요'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
                상세
                <ChevronUp className="w-3 h-3" />
              </div>
            </button>

            {/* 버튼 영역 */}
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1 h-11 rounded-full border-gray-300">
                <a href={`tel:${phoneNumber}`} className="flex items-center justify-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">전화</span>
                </a>
              </Button>
              <Button asChild className="flex-1 h-11 rounded-full">
                <Link href="/contact" className="flex items-center justify-center gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-medium">상담 신청</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Summary Sheet */}
      {showMobileSummary && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSummary(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg">견적 요약</h3>
              <button onClick={() => setShowMobileSummary(false)}>
                <ChevronDown className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">기본 차량</span>
                  <span>{formatPrice(basePrice)}원</span>
                </div>
                {selectedTrim && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">트림: {selectedTrim.name}</span>
                    <span>+{formatPrice(trimPrice)}원</span>
                  </div>
                )}
                {selectedExterior && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">외장: {selectedExterior.name}</span>
                    <span>+{formatPrice(exteriorPrice)}원</span>
                  </div>
                )}
                {selectedInterior && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">내장: {selectedInterior.name}</span>
                    <span>+{formatPrice(interiorPrice)}원</span>
                  </div>
                )}
                {selectedOptions.length > 0 && selectedOptions.map((option) => (
                  <div key={option.id} className="flex justify-between text-sm">
                    <span className="text-gray-500 truncate pr-2">옵션: {option.name}</span>
                    <span className="flex-shrink-0">+{formatPrice(option.price)}원</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">총 차량 가격</div>
                <div className="text-xl font-bold">{formatPrice(totalVehiclePrice)}원</div>
              </div>

              {hasMonthlyPayment && !hasAdditionalCost ? (
                <div className="bg-gradient-to-r from-primary to-primary-600 text-white rounded-xl p-4">
                  <div className="text-sm opacity-90 mb-1">월 납입금</div>
                  <div className="text-2xl font-bold">{formatPrice(getMonthlyPaymentFromDB!)}원~</div>
                  <div className="text-xs opacity-80 mt-1">
                    {period}개월 / 선납금 {depositRatio}% 기준
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4 text-center">
                  <div className="text-lg font-bold mb-1">맞춤 견적 상담</div>
                  <div className="text-sm opacity-90">
                    선택하신 옵션에 맞는 정확한 금액을 안내해 드립니다.
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t space-y-2">
              {hasMonthlyPayment && !hasAdditionalCost ? (
                <Button onClick={handleCopyQuote} variant="secondary" className="w-full rounded-full">
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? '복사 완료!' : '견적 복사하기'}
                </Button>
              ) : (
                <Button asChild variant="secondary" className="w-full rounded-full bg-yellow-400 hover:bg-yellow-300 text-gray-900">
                  <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    <KakaoIcon className="w-4 h-4" />
                    카카오톡 상담
                  </a>
                </Button>
              )}
              <Button asChild className="w-full rounded-full">
                <Link href="/contact">상담 신청하기</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
