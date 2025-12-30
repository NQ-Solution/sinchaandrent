'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PriceInput } from '@/components/ui/PriceInput';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ImageUpload, MultiImageUpload } from '@/components/ui/ImageUpload';
import type { Brand, VehicleCategory } from '@/types';

interface TrimData {
  name: string;
  price: number;
  description: string;
}

interface ColorData {
  type: 'EXTERIOR' | 'INTERIOR';
  name: string;
  hexCode: string;
  price: number;
}

interface OptionData {
  name: string;
  price: number;
  description: string;
  category: string;
}

const categories: { value: VehicleCategory; label: string }[] = [
  { value: 'SEDAN', label: '세단' },
  { value: 'SUV', label: 'SUV' },
  { value: 'COMPACT', label: '소형' },
  { value: 'HATCHBACK', label: '해치백' },
  { value: 'COUPE', label: '쿠페' },
  { value: 'CONVERTIBLE', label: '컨버터블/오픈카' },
  { value: 'TRUCK', label: '트럭' },
  { value: 'VAN', label: '밴' },
  { value: 'EV', label: '전기차' },
];

const fuelTypeOptions = [
  { value: 'GASOLINE', label: '가솔린' },
  { value: 'DIESEL', label: '디젤' },
  { value: 'HYBRID', label: '하이브리드' },
  { value: 'EV', label: '전기' },
  { value: 'LPG', label: 'LPG' },
];

const driveTypeOptions = [
  { value: '전륜', label: '전륜(FF)' },
  { value: '후륜', label: '후륜(FR)' },
  { value: '4륜', label: '4륜(AWD)' },
];

const optionCategories = ['편의', '안전', '외관', '내장', '성능', '기타'];

export default function NewVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'trims' | 'colors' | 'options'>('basic');

  // Basic info
  const [formData, setFormData] = useState({
    name: '',
    brandId: '',
    category: 'SEDAN' as VehicleCategory,
    fuelTypes: [] as string[],
    driveTypes: [] as string[],
    seatingCapacityMin: '',
    seatingCapacityMax: '',
    thumbnail: '',
    images: [] as string[],
    imageSizePreset: 'vehicle',
    imagePadding: 0,
    basePrice: '',
    // 보증금 0%
    rentPrice60_0: '',
    rentPrice48_0: '',
    rentPrice36_0: '',
    rentPrice24_0: '',
    // 보증금 25%
    rentPrice60_25: '',
    rentPrice48_25: '',
    rentPrice36_25: '',
    rentPrice24_25: '',
    // 보증금 50%
    rentPrice60_50: '',
    rentPrice48_50: '',
    rentPrice36_50: '',
    rentPrice24_50: '',
    isPopular: false,
    isNew: false,
    isActive: true,
  });

  // Vehicle options
  const [trims, setTrims] = useState<TrimData[]>([]);
  const [exteriorColors, setExteriorColors] = useState<ColorData[]>([]);
  const [interiorColors, setInteriorColors] = useState<ColorData[]>([]);
  const [options, setOptions] = useState<OptionData[]>([]);

  useEffect(() => {
    async function fetchBrands() {
      const res = await fetch('/api/brands');
      const data = await res.json();
      setBrands(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, brandId: data[0].id }));
      }
    }
    fetchBrands();
  }, []);

  // Trim handlers
  const addTrim = () => {
    setTrims([...trims, { name: '', price: 0, description: '' }]);
  };

  const updateTrim = (index: number, field: keyof TrimData, value: string | number) => {
    const updated = [...trims];
    updated[index] = { ...updated[index], [field]: value };
    setTrims(updated);
  };

  const removeTrim = (index: number) => {
    setTrims(trims.filter((_, i) => i !== index));
  };

  // Color handlers
  const addColor = (type: 'EXTERIOR' | 'INTERIOR') => {
    const newColor: ColorData = { type, name: '', hexCode: '#000000', price: 0 };
    if (type === 'EXTERIOR') {
      setExteriorColors([...exteriorColors, newColor]);
    } else {
      setInteriorColors([...interiorColors, newColor]);
    }
  };

  const updateColor = (type: 'EXTERIOR' | 'INTERIOR', index: number, field: keyof ColorData, value: string | number) => {
    if (type === 'EXTERIOR') {
      const updated = [...exteriorColors];
      updated[index] = { ...updated[index], [field]: value };
      setExteriorColors(updated);
    } else {
      const updated = [...interiorColors];
      updated[index] = { ...updated[index], [field]: value };
      setInteriorColors(updated);
    }
  };

  const removeColor = (type: 'EXTERIOR' | 'INTERIOR', index: number) => {
    if (type === 'EXTERIOR') {
      setExteriorColors(exteriorColors.filter((_, i) => i !== index));
    } else {
      setInteriorColors(interiorColors.filter((_, i) => i !== index));
    }
  };

  // Option handlers
  const addOption = () => {
    setOptions([...options, { name: '', price: 0, description: '', category: '편의' }]);
  };

  const updateOption = (index: number, field: keyof OptionData, value: string | number) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create vehicle
      const vehicleRes = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          seatingCapacityMin: formData.seatingCapacityMin ? parseInt(formData.seatingCapacityMin) : null,
          seatingCapacityMax: formData.seatingCapacityMax ? parseInt(formData.seatingCapacityMax) : null,
          thumbnail: formData.thumbnail || null,
          images: formData.images.length > 0 ? formData.images : [],
          basePrice: parseInt(formData.basePrice) || 0,
          // 보증금 0%
          rentPrice60_0: formData.rentPrice60_0 ? parseInt(formData.rentPrice60_0) : null,
          rentPrice48_0: formData.rentPrice48_0 ? parseInt(formData.rentPrice48_0) : null,
          rentPrice36_0: formData.rentPrice36_0 ? parseInt(formData.rentPrice36_0) : null,
          rentPrice24_0: formData.rentPrice24_0 ? parseInt(formData.rentPrice24_0) : null,
          // 보증금 25%
          rentPrice60_25: formData.rentPrice60_25 ? parseInt(formData.rentPrice60_25) : null,
          rentPrice48_25: formData.rentPrice48_25 ? parseInt(formData.rentPrice48_25) : null,
          rentPrice36_25: formData.rentPrice36_25 ? parseInt(formData.rentPrice36_25) : null,
          rentPrice24_25: formData.rentPrice24_25 ? parseInt(formData.rentPrice24_25) : null,
          // 보증금 50%
          rentPrice60_50: formData.rentPrice60_50 ? parseInt(formData.rentPrice60_50) : null,
          rentPrice48_50: formData.rentPrice48_50 ? parseInt(formData.rentPrice48_50) : null,
          rentPrice36_50: formData.rentPrice36_50 ? parseInt(formData.rentPrice36_50) : null,
          rentPrice24_50: formData.rentPrice24_50 ? parseInt(formData.rentPrice24_50) : null,
        }),
      });

      if (!vehicleRes.ok) {
        throw new Error('Failed to create vehicle');
      }

      const vehicle = await vehicleRes.json();
      const vehicleId = vehicle.id;

      // 2. Create trims
      for (const trim of trims) {
        if (trim.name) {
          await fetch(`/api/admin/vehicles/${vehicleId}/trims`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trim),
          });
        }
      }

      // 3. Create colors
      const allColors = [...exteriorColors, ...interiorColors];
      for (const color of allColors) {
        if (color.name) {
          await fetch(`/api/admin/vehicles/${vehicleId}/colors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(color),
          });
        }
      }

      // 4. Create options
      for (const option of options) {
        if (option.name) {
          await fetch(`/api/admin/vehicles/${vehicleId}/options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(option),
          });
        }
      }

      alert('차량이 등록되었습니다.');
      router.push('/admin/vehicles');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('차량 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link
        href="/admin/vehicles"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        차량 목록
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">차량 등록</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {[
            { key: 'basic', label: '기본 정보' },
            { key: 'trims', label: `트림 (${trims.length})` },
            { key: 'colors', label: `색상 (${exteriorColors.length + interiorColors.length})` },
            { key: 'options', label: `옵션 (${options.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as 'basic' | 'trims' | 'colors' | 'options')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  id="name"
                  label="차량명 *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 아반떼"
                  required
                />

                <Select
                  id="brandId"
                  label="브랜드 *"
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  options={brands.map((b) => ({ value: b.id, label: b.nameKr }))}
                />

                <Select
                  id="category"
                  label="차종 *"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as VehicleCategory })
                  }
                  options={categories}
                />

                {/* 연료 타입 - 복수 선택 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">연료 타입 (복수 선택 가능)</label>
                  <div className="flex flex-wrap gap-4">
                    {fuelTypeOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.fuelTypes.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, fuelTypes: [...formData.fuelTypes, option.value] });
                            } else {
                              setFormData({ ...formData, fuelTypes: formData.fuelTypes.filter(f => f !== option.value) });
                            }
                          }}
                          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 구동 방식 - 복수 선택 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">구동 방식 (복수 선택 가능)</label>
                  <div className="flex flex-wrap gap-4">
                    {driveTypeOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.driveTypes.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, driveTypes: [...formData.driveTypes, option.value] });
                            } else {
                              setFormData({ ...formData, driveTypes: formData.driveTypes.filter(d => d !== option.value) });
                            }
                          }}
                          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 승차 인원 범위 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">승차 인원</label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="seatingCapacityMin"
                      type="number"
                      value={formData.seatingCapacityMin}
                      onChange={(e) => setFormData({ ...formData, seatingCapacityMin: e.target.value })}
                      placeholder="최소 (예: 5)"
                      className="w-32"
                    />
                    <span className="text-gray-500">~</span>
                    <Input
                      id="seatingCapacityMax"
                      type="number"
                      value={formData.seatingCapacityMax}
                      onChange={(e) => setFormData({ ...formData, seatingCapacityMax: e.target.value })}
                      placeholder="최대 (예: 7)"
                      className="w-32"
                    />
                    <span className="text-gray-500 text-sm">인승</span>
                  </div>
                  <p className="text-xs text-gray-500">동일하면 최소만 입력</p>
                </div>
              </CardContent>
            </Card>

            {/* 차량 이미지 */}
            <Card>
              <CardHeader>
                <CardTitle>차량 이미지</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ImageUpload
                  label="대표 이미지"
                  value={formData.thumbnail}
                  onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                  type="image"
                  showSizeSelector={true}
                  sizePreset={formData.imageSizePreset as 'vehicle' | 'vehicleHD' | 'banner' | 'original'}
                  padding={formData.imagePadding}
                  onSettingsChange={(settings) => setFormData({
                    ...formData,
                    imageSizePreset: settings.sizePreset,
                    imagePadding: settings.padding,
                  })}
                  hint="권장: 800x500 (16:10 비율) / 투명 배경 PNG는 흰색 배경으로 변환됩니다"
                />
                <MultiImageUpload
                  label="추가 이미지"
                  values={formData.images}
                  onChange={(urls) => setFormData({ ...formData, images: urls })}
                  maxImages={10}
                  showSizeSelector={true}
                  sizePreset={formData.imageSizePreset as 'vehicle' | 'vehicleHD' | 'banner' | 'original'}
                  padding={formData.imagePadding}
                  onSettingsChange={(settings) => setFormData({
                    ...formData,
                    imageSizePreset: settings.sizePreset,
                    imagePadding: settings.padding,
                  })}
                  hint="상세 페이지에 표시될 추가 이미지 (최대 10장) / 투명 배경은 흰색으로 변환됩니다"
                />
              </CardContent>
            </Card>

            {/* 가격 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>가격 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PriceInput
                  id="basePrice"
                  label="기본 차량가"
                  value={formData.basePrice}
                  onChange={(value) => setFormData({ ...formData, basePrice: value })}
                  placeholder="참고용 차량가"
                />
              </CardContent>
            </Card>

            {/* 보증금별 렌트 가격 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>보증금 비율별 렌트 가격 (월 납입금)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 보증금 0% */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-3">보증금 0%</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <PriceInput
                        label="60개월"
                        value={formData.rentPrice60_0}
                        onChange={(value) => setFormData({ ...formData, rentPrice60_0: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="48개월"
                        value={formData.rentPrice48_0}
                        onChange={(value) => setFormData({ ...formData, rentPrice48_0: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="36개월"
                        value={formData.rentPrice36_0}
                        onChange={(value) => setFormData({ ...formData, rentPrice36_0: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="24개월"
                        value={formData.rentPrice24_0}
                        onChange={(value) => setFormData({ ...formData, rentPrice24_0: value })}
                        placeholder="월 납입금"
                      />
                    </div>
                  </div>

                  {/* 보증금 25% */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-3">보증금 25%</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <PriceInput
                        label="60개월"
                        value={formData.rentPrice60_25}
                        onChange={(value) => setFormData({ ...formData, rentPrice60_25: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="48개월"
                        value={formData.rentPrice48_25}
                        onChange={(value) => setFormData({ ...formData, rentPrice48_25: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="36개월"
                        value={formData.rentPrice36_25}
                        onChange={(value) => setFormData({ ...formData, rentPrice36_25: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="24개월"
                        value={formData.rentPrice24_25}
                        onChange={(value) => setFormData({ ...formData, rentPrice24_25: value })}
                        placeholder="월 납입금"
                      />
                    </div>
                  </div>

                  {/* 보증금 50% */}
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-3">보증금 50%</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <PriceInput
                        label="60개월"
                        value={formData.rentPrice60_50}
                        onChange={(value) => setFormData({ ...formData, rentPrice60_50: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="48개월"
                        value={formData.rentPrice48_50}
                        onChange={(value) => setFormData({ ...formData, rentPrice48_50: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="36개월"
                        value={formData.rentPrice36_50}
                        onChange={(value) => setFormData({ ...formData, rentPrice36_50: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="24개월"
                        value={formData.rentPrice24_50}
                        onChange={(value) => setFormData({ ...formData, rentPrice24_50: value })}
                        placeholder="월 납입금"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 text-center">
                    * 미입력 시 해당 옵션은 &quot;상담 문의&quot;로 표시됩니다. 세부 보증금 비율 조정은 상담을 통해 안내됩니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 노출 설정 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>노출 설정</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-700">공개</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-700">인기 차량</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-700">신차 뱃지</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trims Tab */}
        {activeTab === 'trims' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>트림 관리</CardTitle>
              <Button type="button" size="sm" onClick={addTrim}>
                <Plus className="w-4 h-4 mr-1" />
                트림 추가
              </Button>
            </CardHeader>
            <CardContent>
              {trims.length === 0 ? (
                <p className="text-gray-500 text-center py-8">등록된 트림이 없습니다. 트림 추가 버튼을 눌러 추가하세요.</p>
              ) : (
                <div className="space-y-4">
                  {trims.map((trim, index) => (
                    <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="트림명"
                          value={trim.name}
                          onChange={(e) => updateTrim(index, 'name', e.target.value)}
                          placeholder="예: 스마트"
                        />
                        <Input
                          label="추가 금액 (원)"
                          type="number"
                          value={trim.price.toString()}
                          onChange={(e) => updateTrim(index, 'price', parseInt(e.target.value) || 0)}
                        />
                        <Input
                          label="설명"
                          value={trim.description}
                          onChange={(e) => updateTrim(index, 'description', e.target.value)}
                          placeholder="선택사항"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 mt-6"
                        onClick={() => removeTrim(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            {/* Exterior Colors */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>외장색상</CardTitle>
                <Button type="button" size="sm" onClick={() => addColor('EXTERIOR')}>
                  <Plus className="w-4 h-4 mr-1" />
                  외장색 추가
                </Button>
              </CardHeader>
              <CardContent>
                {exteriorColors.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">등록된 외장색이 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {exteriorColors.map((color, index) => (
                      <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                        <div
                          className="w-10 h-10 rounded-lg border-2 border-gray-200 mt-6 flex-shrink-0"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            label="색상명"
                            value={color.name}
                            onChange={(e) => updateColor('EXTERIOR', index, 'name', e.target.value)}
                            placeholder="예: 아틀라스 화이트"
                          />
                          <Input
                            label="색상 코드"
                            type="color"
                            value={color.hexCode}
                            onChange={(e) => updateColor('EXTERIOR', index, 'hexCode', e.target.value)}
                          />
                          <Input
                            label="추가 금액 (원)"
                            type="number"
                            value={color.price.toString()}
                            onChange={(e) => updateColor('EXTERIOR', index, 'price', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 mt-6"
                          onClick={() => removeColor('EXTERIOR', index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interior Colors */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>내장색상</CardTitle>
                <Button type="button" size="sm" onClick={() => addColor('INTERIOR')}>
                  <Plus className="w-4 h-4 mr-1" />
                  내장색 추가
                </Button>
              </CardHeader>
              <CardContent>
                {interiorColors.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">등록된 내장색이 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {interiorColors.map((color, index) => (
                      <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                        <div
                          className="w-10 h-10 rounded-lg border-2 border-gray-200 mt-6 flex-shrink-0"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            label="색상명"
                            value={color.name}
                            onChange={(e) => updateColor('INTERIOR', index, 'name', e.target.value)}
                            placeholder="예: 블랙"
                          />
                          <Input
                            label="색상 코드"
                            type="color"
                            value={color.hexCode}
                            onChange={(e) => updateColor('INTERIOR', index, 'hexCode', e.target.value)}
                          />
                          <Input
                            label="추가 금액 (원)"
                            type="number"
                            value={color.price.toString()}
                            onChange={(e) => updateColor('INTERIOR', index, 'price', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 mt-6"
                          onClick={() => removeColor('INTERIOR', index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Options Tab */}
        {activeTab === 'options' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>추가 옵션 관리</CardTitle>
              <Button type="button" size="sm" onClick={addOption}>
                <Plus className="w-4 h-4 mr-1" />
                옵션 추가
              </Button>
            </CardHeader>
            <CardContent>
              {options.length === 0 ? (
                <p className="text-gray-500 text-center py-8">등록된 옵션이 없습니다. 옵션 추가 버튼을 눌러 추가하세요.</p>
              ) : (
                <div className="space-y-4">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                          label="옵션명"
                          value={option.name}
                          onChange={(e) => updateOption(index, 'name', e.target.value)}
                          placeholder="예: 썬루프"
                        />
                        <Input
                          label="추가 금액 (원)"
                          type="number"
                          value={option.price.toString()}
                          onChange={(e) => updateOption(index, 'price', parseInt(e.target.value) || 0)}
                        />
                        <Select
                          id={`option-category-${index}`}
                          label="카테고리"
                          value={option.category}
                          onChange={(e) => updateOption(index, 'category', e.target.value)}
                          options={optionCategories.map((c) => ({ value: c, label: c }))}
                        />
                        <Input
                          label="설명"
                          value={option.description}
                          onChange={(e) => updateOption(index, 'description', e.target.value)}
                          placeholder="선택사항"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 mt-6"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4 mt-8">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '등록 중...' : '차량 등록'}
          </Button>
        </div>
      </form>
    </div>
  );
}
