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

interface TrimOption {
  id: string;
  name: string;
  description?: string | null;
  price: number;
}

interface ColorOption {
  id: string;
  name: string;
  hexCode: string;
  price: number;
  type: 'EXTERIOR' | 'INTERIOR';
}

interface VehicleOption {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
}

interface VehicleWithOptions extends Omit<Vehicle, 'trims' | 'colors' | 'options'> {
  trims?: TrimOption[];
  colors?: ColorOption[];
  options?: VehicleOption[];
}

const CONTRACT_PERIODS = [24, 36, 48, 60];
const DEPOSIT_RATIOS = [0, 25, 50];

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
          const trims = data.trims.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            price: t.price,
          }));
          setAvailableTrims(trims);
          setSelectedTrim(trims[0]);
        }

        if (data.colors && data.colors.length > 0) {
          const exteriorColors = data.colors
            .filter(c => c.type === 'EXTERIOR')
            .map(c => ({
              id: c.id,
              name: c.name,
              hexCode: c.hexCode || '#888888',
              price: c.price,
              type: 'EXTERIOR' as const,
            }));

          const interiorColors = data.colors
            .filter(c => c.type === 'INTERIOR')
            .map(c => ({
              id: c.id,
              name: c.name,
              hexCode: c.hexCode || '#888888',
              price: c.price,
              type: 'INTERIOR' as const,
            }));

          if (exteriorColors.length > 0) {
            setAvailableExteriorColors(exteriorColors);
            setSelectedExterior(exteriorColors[0]);
          }

          if (interiorColors.length > 0) {
            setAvailableInteriorColors(interiorColors);
            setSelectedInterior(interiorColors[0]);
          }
        }

        if (data.options && data.options.length > 0) {
          const options = data.options.map(o => ({
            id: o.id,
            name: o.name,
            description: o.description,
            price: o.price,
            category: o.category,
          }));
          setAvailableOptions(options);
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

  const basePrice = vehicle?.basePrice || 0;
  const trimPrice = selectedTrim?.price || 0;
  const exteriorPrice = selectedExterior?.price || 0;
  const interiorPrice = selectedInterior?.price || 0;
  const optionsTotal = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  const totalVehiclePrice = basePrice + trimPrice + exteriorPrice + interiorPrice + optionsTotal;
  const depositAmount = Math.floor(totalVehiclePrice * (depositRatio / 100));

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
    setSelectedOptions((prev) =>
      prev.find((o) => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option]
    );
  };

  const handleCopyQuote = async () => {
    if (!vehicle || !hasMonthlyPayment) return;

    const optionsList = selectedOptions.length > 0
      ? `\n추가 옵션:\n${selectedOptions.map((o) => `  - ${o.name}: +${formatPrice(o.price)}원`).join('\n')}`
      : '';

    const quote = `
[${companyName} 견적서]

차량: ${vehicle.brand?.nameKr} ${vehicle.name}
트림: ${selectedTrim?.name || '선택 없음'}
외장 색상: ${selectedExterior?.name || '선택 없음'}
내장 색상: ${selectedInterior?.name || '선택 없음'}${optionsList}

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
- 보증금 비율: ${depositRatio}%
- 보증금: ${formatPrice(depositAmount)}원

━━━━━━━━━━━━━━━━━━━━━━
월 납입금: ${formatPrice(getMonthlyPaymentFromDB!)}원~ (최소 기준)
━━━━━━━━━━━━━━━━━━━━━━

※ 위 금액은 최소 기준 금액입니다.
※ 추가 옵션, 보험, 정비 조건 등에 따라 월 납입금이 달라질 수 있습니다.
※ 실제 계약 시 신용등급, 금융조건에 따라 월 납입금이 변동될 수 있습니다.
※ 장기렌트의 경우 보험료, 정비비용, 세금이 포함된 금액입니다.

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
              {/* Quick Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {vehicle.fuelTypes && vehicle.fuelTypes.length > 0 && (
                  <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                    <Fuel className="w-5 h-5 text-white mb-1" />
                    <p className="text-xs text-gray-300">연료</p>
                    <p className="font-medium text-sm text-white">{vehicle.fuelTypes.map(ft => getFuelTypeLabel(ft)).join('/')}</p>
                  </div>
                )}
                <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                  <Users className="w-5 h-5 text-white mb-1" />
                  <p className="text-xs text-gray-300">승차인원</p>
                  <p className="font-medium text-sm text-white">
                    {vehicle.seatingCapacityMin && vehicle.seatingCapacityMax
                      ? (vehicle.seatingCapacityMin === vehicle.seatingCapacityMax
                        ? `${vehicle.seatingCapacityMin}인승`
                        : `${vehicle.seatingCapacityMin}~${vehicle.seatingCapacityMax}인승`)
                      : '5인승'}
                  </p>
                </div>
                {vehicle.driveTypes && vehicle.driveTypes.length > 0 && (
                  <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                    <Settings2 className="w-5 h-5 text-white mb-1" />
                    <p className="text-xs text-gray-300">구동방식</p>
                    <p className="font-medium text-sm text-white">{vehicle.driveTypes.map(dt => getDriveTypeLabel(dt)).join('/')}</p>
                  </div>
                )}
              </div>

              {/* Price Highlight */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 md:p-6">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">월 렌트료</p>
                    <p className="text-3xl md:text-4xl font-black">
                      {hasMonthlyPayment ? (
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
                    <p className="text-xs text-gray-400">{period}개월 / 보증금 {depositRatio}% 기준</p>
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedTrim?.id === trim.id ? 'border-primary bg-primary' : 'border-gray-300'
                            }`}>
                              {selectedTrim?.id === trim.id && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                              <p className="font-bold text-lg">{trim.name}</p>
                              {trim.description && (
                                <p className="text-sm text-gray-500">{trim.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${trim.price === 0 ? 'text-gray-600' : 'text-primary'}`}>
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
                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleOption(option)}
                          className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-100 hover:border-primary/50'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold">{option.name}</p>
                            {option.description && (
                              <p className="text-sm text-gray-500 truncate">{option.description}</p>
                            )}
                          </div>
                          <p className="text-primary font-bold flex-shrink-0">
                            +{formatPrice(option.price)}원
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
                    보증금 비율
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
                  { icon: Settings2, label: '정비비 포함' },
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
              {hasMonthlyPayment ? (
                <div className="bg-gradient-to-r from-primary to-primary-600 text-white rounded-xl p-4 mb-4">
                  <div className="text-sm opacity-90 mb-1">월 납입금</div>
                  <div className="text-3xl font-black mb-1">{formatPrice(getMonthlyPaymentFromDB!)}원~</div>
                  <div className="text-xs opacity-80">
                    {period}개월 / 보증금 {depositRatio}% ({formatPrice(depositAmount)}원)
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl p-6 mb-4 text-center">
                  <p className="text-gray-600">해당 조건의 가격은</p>
                  <p className="text-gray-600">상담을 통해 안내드립니다.</p>
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
                  {hasMonthlyPayment ? (
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-40">
        <div className="p-4">
          <button
            onClick={() => setShowMobileSummary(true)}
            className="w-full flex items-center justify-between mb-3"
          >
            <div>
              <p className="text-xs text-gray-500">예상 월 납입금</p>
              <p className="text-xl font-black text-primary">
                {hasMonthlyPayment ? `${formatPrice(getMonthlyPaymentFromDB!)}원~` : '상담 필요'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              상세보기
              <ChevronUp className="w-4 h-4" />
            </div>
          </button>

          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 rounded-full">
              <a href={`tel:${phoneNumber}`} className="flex items-center justify-center gap-1">
                <Phone className="w-4 h-4" />
                전화
              </a>
            </Button>
            <Button asChild className="flex-1 rounded-full">
              <Link href="/contact">상담 신청</Link>
            </Button>
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

              {hasMonthlyPayment && (
                <div className="bg-gradient-to-r from-primary to-primary-600 text-white rounded-xl p-4">
                  <div className="text-sm opacity-90 mb-1">월 납입금</div>
                  <div className="text-2xl font-bold">{formatPrice(getMonthlyPaymentFromDB!)}원~</div>
                  <div className="text-xs opacity-80 mt-1">
                    {period}개월 / 보증금 {depositRatio}% 기준
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t space-y-2">
              {hasMonthlyPayment && (
                <Button onClick={handleCopyQuote} variant="secondary" className="w-full rounded-full">
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? '복사 완료!' : '견적 복사하기'}
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
