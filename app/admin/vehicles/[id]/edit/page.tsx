'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Copy, X, Car } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PriceInput } from '@/components/ui/PriceInput';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ImageUpload, MultiImageUpload } from '@/components/ui/ImageUpload';
import type { Brand, Vehicle, VehicleCategory } from '@/types';

interface TrimData {
  id?: string;
  name: string;
  price: number;
  description: string;
  sortOrder: number;
  isNew?: boolean;
  colorIds?: string[];
  optionSettings?: { optionId: string; isIncluded: boolean }[];
}

interface ColorData {
  id?: string;
  type: 'EXTERIOR' | 'INTERIOR';
  name: string;
  hexCode: string;
  price: number;
  sortOrder: number;
  isNew?: boolean;
}

interface OptionData {
  id?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  sortOrder: number;
  isNew?: boolean;
}

const categories: { value: VehicleCategory; label: string }[] = [
  { value: 'SEDAN', label: '세단' },
  { value: 'SUV', label: 'SUV' },
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

const optionCategories = ['편의', '안전', '외관', '내장', '성능', '기타'];

const driveTypeOptions = [
  { value: '전륜', label: '전륜(FF)' },
  { value: '후륜', label: '후륜(FR)' },
  { value: '4륜', label: '4륜(AWD)' },
];

export default function EditVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'trims' | 'colors' | 'options'>('basic');
  const [selectedTrimIndex, setSelectedTrimIndex] = useState<number | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);

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
    // 모델 정보
    baseModelName: '',
    hasOtherModels: true,
  });

  // Vehicle options
  const [trims, setTrims] = useState<TrimData[]>([]);
  const [exteriorColors, setExteriorColors] = useState<ColorData[]>([]);
  const [interiorColors, setInteriorColors] = useState<ColorData[]>([]);
  const [options, setOptions] = useState<OptionData[]>([]);

  // Deleted items tracking
  const [deletedTrims, setDeletedTrims] = useState<string[]>([]);
  const [deletedColors, setDeletedColors] = useState<string[]>([]);
  const [deletedOptions, setDeletedOptions] = useState<string[]>([]);

  // 옵션 불러오기 모달
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState<'trims' | 'colors' | 'options' | 'all'>('all');
  const [sameBrandVehicles, setSameBrandVehicles] = useState<Vehicle[]>([]);
  const [loadingImport, setLoadingImport] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [vehicleRes, brandsRes, trimsRes, colorsRes, optionsRes] = await Promise.all([
          fetch(`/api/admin/vehicles/${id}`),
          fetch('/api/brands'),
          fetch(`/api/admin/vehicles/${id}/trims`),
          fetch(`/api/admin/vehicles/${id}/colors`),
          fetch(`/api/admin/vehicles/${id}/options`),
        ]);

        if (!vehicleRes.ok) {
          alert('차량을 찾을 수 없습니다.');
          router.push('/admin/vehicles');
          return;
        }

        const vehicle: Vehicle = await vehicleRes.json();
        const brandsData = await brandsRes.json();
        const trimsData = await trimsRes.json();
        const colorsData = await colorsRes.json();
        const optionsData = await optionsRes.json();

        setBrands(brandsData);
        setFormData({
          name: vehicle.name,
          brandId: vehicle.brandId,
          category: vehicle.category,
          fuelTypes: vehicle.fuelTypes || [],
          driveTypes: vehicle.driveTypes || [],
          seatingCapacityMin: vehicle.seatingCapacityMin?.toString() || '',
          seatingCapacityMax: vehicle.seatingCapacityMax?.toString() || '',
          thumbnail: vehicle.thumbnail || '',
          images: vehicle.images || [],
          imageSizePreset: vehicle.imageSizePreset || 'vehicle',
          imagePadding: vehicle.imagePadding || 0,
          basePrice: vehicle.basePrice?.toString() || '',
          // 보증금 0%
          rentPrice60_0: vehicle.rentPrice60_0?.toString() || '',
          rentPrice48_0: vehicle.rentPrice48_0?.toString() || '',
          rentPrice36_0: vehicle.rentPrice36_0?.toString() || '',
          rentPrice24_0: vehicle.rentPrice24_0?.toString() || '',
          // 보증금 25%
          rentPrice60_25: vehicle.rentPrice60_25?.toString() || '',
          rentPrice48_25: vehicle.rentPrice48_25?.toString() || '',
          rentPrice36_25: vehicle.rentPrice36_25?.toString() || '',
          rentPrice24_25: vehicle.rentPrice24_25?.toString() || '',
          // 보증금 50%
          rentPrice60_50: vehicle.rentPrice60_50?.toString() || '',
          rentPrice48_50: vehicle.rentPrice48_50?.toString() || '',
          rentPrice36_50: vehicle.rentPrice36_50?.toString() || '',
          rentPrice24_50: vehicle.rentPrice24_50?.toString() || '',
          isPopular: vehicle.isPopular,
          isNew: vehicle.isNew,
          isActive: vehicle.isActive,
          // 모델 정보
          baseModelName: vehicle.baseModelName || '',
          hasOtherModels: vehicle.hasOtherModels ?? true,
        });

        // 각 트림의 색상과 옵션 정보 로드
        const trimsWithDetails = await Promise.all(
          trimsData.map(async (t: TrimData) => {
            if (!t.id) return { ...t, description: t.description || '', colorIds: [], optionSettings: [] };

            try {
              const [trimColorsRes, trimOptionsRes] = await Promise.all([
                fetch(`/api/admin/vehicles/${id}/trims/${t.id}/colors`),
                fetch(`/api/admin/vehicles/${id}/trims/${t.id}/options`),
              ]);

              const trimColors = trimColorsRes.ok ? await trimColorsRes.json() : [];
              const trimOptions = trimOptionsRes.ok ? await trimOptionsRes.json() : [];

              return {
                ...t,
                description: t.description || '',
                colorIds: trimColors.map((tc: { colorId: string }) => tc.colorId),
                optionSettings: trimOptions.map((to: { optionId: string; isIncluded: boolean }) => ({
                  optionId: to.optionId,
                  isIncluded: to.isIncluded,
                })),
              };
            } catch (error) {
              console.error('Failed to fetch trim details:', error);
              return { ...t, description: t.description || '', colorIds: [], optionSettings: [] };
            }
          })
        );

        setTrims(trimsWithDetails);
        setExteriorColors(colorsData.filter((c: ColorData) => c.type === 'EXTERIOR'));
        setInteriorColors(colorsData.filter((c: ColorData) => c.type === 'INTERIOR'));
        setOptions(optionsData.map((o: OptionData) => ({ ...o, description: o.description || '', category: o.category || '기타' })));
      } catch (error) {
        console.error('Failed to fetch data:', error);
        alert('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  // Trim handlers
  const addTrim = () => {
    const newSortOrder = trims.length > 0 ? Math.max(...trims.map(t => t.sortOrder)) + 1 : 0;
    setTrims([...trims, { name: '', price: 0, description: '', sortOrder: newSortOrder, isNew: true, colorIds: [], optionSettings: [] }]);
  };

  const moveTrim = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= trims.length) return;

    const newTrims = [...trims];
    const temp = newTrims[index];
    newTrims[index] = newTrims[newIndex];
    newTrims[newIndex] = temp;

    // sortOrder 재정렬
    newTrims.forEach((trim, idx) => {
      trim.sortOrder = idx;
    });

    setTrims(newTrims);
    if (selectedTrimIndex === index) {
      setSelectedTrimIndex(newIndex);
    } else if (selectedTrimIndex === newIndex) {
      setSelectedTrimIndex(index);
    }
  };

  const updateTrim = (index: number, field: keyof TrimData, value: string | number | string[] | { optionId: string; isIncluded: boolean }[]) => {
    const updated = [...trims];
    updated[index] = { ...updated[index], [field]: value };
    setTrims(updated);
  };

  const toggleTrimColor = (trimIndex: number, colorId: string) => {
    const updated = [...trims];
    const currentColorIds = updated[trimIndex].colorIds || [];
    if (currentColorIds.includes(colorId)) {
      updated[trimIndex].colorIds = currentColorIds.filter(id => id !== colorId);
    } else {
      updated[trimIndex].colorIds = [...currentColorIds, colorId];
    }
    setTrims(updated);
  };

  const toggleTrimOption = (trimIndex: number, optionId: string, isIncluded: boolean) => {
    const updated = [...trims];
    const currentSettings = updated[trimIndex].optionSettings || [];
    const existingIndex = currentSettings.findIndex(s => s.optionId === optionId);

    if (existingIndex >= 0) {
      // 이미 있으면 제거
      updated[trimIndex].optionSettings = currentSettings.filter((_, i) => i !== existingIndex);
    } else {
      // 없으면 추가
      updated[trimIndex].optionSettings = [...currentSettings, { optionId, isIncluded }];
    }
    setTrims(updated);
  };

  const updateTrimOptionIncluded = (trimIndex: number, optionId: string, isIncluded: boolean) => {
    const updated = [...trims];
    const currentSettings = updated[trimIndex].optionSettings || [];
    const settingIndex = currentSettings.findIndex(s => s.optionId === optionId);

    if (settingIndex >= 0) {
      currentSettings[settingIndex].isIncluded = isIncluded;
      updated[trimIndex].optionSettings = currentSettings;
      setTrims(updated);
    }
  };

  const removeTrim = (index: number) => {
    const trim = trims[index];
    if (trim.id) {
      setDeletedTrims([...deletedTrims, trim.id]);
    }
    setTrims(trims.filter((_, i) => i !== index));
  };

  // Color handlers
  const addColor = (type: 'EXTERIOR' | 'INTERIOR') => {
    if (type === 'EXTERIOR') {
      const newSortOrder = exteriorColors.length > 0 ? Math.max(...exteriorColors.map(c => c.sortOrder)) + 1 : 0;
      const newColor: ColorData = { type, name: '', hexCode: '#000000', price: 0, sortOrder: newSortOrder, isNew: true };
      setExteriorColors([...exteriorColors, newColor]);
    } else {
      const newSortOrder = interiorColors.length > 0 ? Math.max(...interiorColors.map(c => c.sortOrder)) + 1 : 0;
      const newColor: ColorData = { type, name: '', hexCode: '#000000', price: 0, sortOrder: newSortOrder, isNew: true };
      setInteriorColors([...interiorColors, newColor]);
    }
  };

  const moveColor = (type: 'EXTERIOR' | 'INTERIOR', index: number, direction: 'up' | 'down') => {
    const colors = type === 'EXTERIOR' ? [...exteriorColors] : [...interiorColors];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= colors.length) return;

    const temp = colors[index];
    colors[index] = colors[newIndex];
    colors[newIndex] = temp;

    // sortOrder 재정렬
    colors.forEach((color, idx) => {
      color.sortOrder = idx;
    });

    if (type === 'EXTERIOR') {
      setExteriorColors(colors);
    } else {
      setInteriorColors(colors);
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
      const color = exteriorColors[index];
      if (color.id) {
        setDeletedColors([...deletedColors, color.id]);
      }
      setExteriorColors(exteriorColors.filter((_, i) => i !== index));
    } else {
      const color = interiorColors[index];
      if (color.id) {
        setDeletedColors([...deletedColors, color.id]);
      }
      setInteriorColors(interiorColors.filter((_, i) => i !== index));
    }
  };

  // Option handlers
  const addOption = () => {
    const newSortOrder = options.length > 0 ? Math.max(...options.map(o => o.sortOrder)) + 1 : 0;
    setOptions([...options, { name: '', price: 0, description: '', category: '편의', sortOrder: newSortOrder, isNew: true }]);
  };

  const moveOption = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= options.length) return;

    const newOptions = [...options];
    const temp = newOptions[index];
    newOptions[index] = newOptions[newIndex];
    newOptions[newIndex] = temp;

    // sortOrder 재정렬
    newOptions.forEach((option, idx) => {
      option.sortOrder = idx;
    });

    setOptions(newOptions);
  };

  const updateOption = (index: number, field: keyof OptionData, value: string | number) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    const option = options[index];
    if (option.id) {
      setDeletedOptions([...deletedOptions, option.id]);
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  // 옵션 불러오기 모달 열기
  const openImportModal = async (type: 'trims' | 'colors' | 'options' | 'all') => {
    if (!formData.brandId) {
      alert('먼저 브랜드를 선택해주세요.');
      return;
    }

    setImportType(type);
    setLoadingImport(true);
    setShowImportModal(true);

    try {
      const res = await fetch(`/api/vehicles?all=true`);
      const allVehicles: Vehicle[] = await res.json();
      // 같은 브랜드이고 현재 차량이 아닌 것만 필터
      const filtered = allVehicles.filter(v => v.brandId === formData.brandId && v.id !== id);
      setSameBrandVehicles(filtered);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoadingImport(false);
    }
  };

  // 선택한 차량에서 옵션 복사
  const importFromVehicle = async (sourceVehicleId: string) => {
    setLoadingImport(true);

    try {
      const [trimsRes, colorsRes, optionsRes] = await Promise.all([
        fetch(`/api/admin/vehicles/${sourceVehicleId}/trims`),
        fetch(`/api/admin/vehicles/${sourceVehicleId}/colors`),
        fetch(`/api/admin/vehicles/${sourceVehicleId}/options`),
      ]);

      const sourceTrims = await trimsRes.json();
      const sourceColors = await colorsRes.json();
      const sourceOptions = await optionsRes.json();

      if (importType === 'trims' || importType === 'all') {
        // 트림 복사 (ID 제거하고 isNew로 표시)
        const newTrims: TrimData[] = sourceTrims.map((t: TrimData, idx: number) => ({
          name: t.name,
          price: t.price,
          description: t.description || '',
          sortOrder: idx,
          isNew: true,
          colorIds: [],
          optionSettings: [],
        }));
        setTrims(prev => [...prev, ...newTrims]);
      }

      if (importType === 'colors' || importType === 'all') {
        // 색상 복사
        const extColors = sourceColors.filter((c: ColorData) => c.type === 'EXTERIOR');
        const intColors = sourceColors.filter((c: ColorData) => c.type === 'INTERIOR');

        const newExtColors: ColorData[] = extColors.map((c: ColorData, idx: number) => ({
          type: 'EXTERIOR' as const,
          name: c.name,
          hexCode: c.hexCode,
          price: c.price,
          sortOrder: exteriorColors.length + idx,
          isNew: true,
        }));
        const newIntColors: ColorData[] = intColors.map((c: ColorData, idx: number) => ({
          type: 'INTERIOR' as const,
          name: c.name,
          hexCode: c.hexCode,
          price: c.price,
          sortOrder: interiorColors.length + idx,
          isNew: true,
        }));

        setExteriorColors(prev => [...prev, ...newExtColors]);
        setInteriorColors(prev => [...prev, ...newIntColors]);
      }

      if (importType === 'options' || importType === 'all') {
        // 옵션 복사
        const newOptions: OptionData[] = sourceOptions.map((o: OptionData, idx: number) => ({
          name: o.name,
          price: o.price,
          description: o.description || '',
          category: o.category || '기타',
          sortOrder: options.length + idx,
          isNew: true,
        }));
        setOptions(prev => [...prev, ...newOptions]);
      }

      alert('불러오기가 완료되었습니다. 가격을 수정한 후 저장해주세요.');
      setShowImportModal(false);
    } catch (error) {
      console.error('Failed to import:', error);
      alert('불러오기에 실패했습니다.');
    } finally {
      setLoadingImport(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Update basic vehicle info
      const vehicleRes = await fetch(`/api/admin/vehicles/${id}`, {
        method: 'PUT',
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
          // 모델 정보
          baseModelName: formData.baseModelName || null,
          hasOtherModels: formData.hasOtherModels,
        }),
      });

      if (!vehicleRes.ok) throw new Error('Failed to update vehicle');

      // 2. Delete removed items
      for (const trimId of deletedTrims) {
        await fetch(`/api/admin/vehicles/${id}/trims?trimId=${trimId}`, { method: 'DELETE' });
      }
      for (const colorId of deletedColors) {
        await fetch(`/api/admin/vehicles/${id}/colors?colorId=${colorId}`, { method: 'DELETE' });
      }
      for (const optionId of deletedOptions) {
        await fetch(`/api/admin/vehicles/${id}/options?optionId=${optionId}`, { method: 'DELETE' });
      }

      // 3. Create/Update trims
      for (const trim of trims) {
        let trimId = trim.id;

        if (trim.isNew) {
          const res = await fetch(`/api/admin/vehicles/${id}/trims`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: trim.name,
              price: trim.price,
              description: trim.description,
            }),
          });
          const createdTrim = await res.json();
          trimId = createdTrim.id;
        } else if (trim.id) {
          await fetch(`/api/admin/vehicles/${id}/trims`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              trimId: trim.id,
              name: trim.name,
              price: trim.price,
              description: trim.description,
            }),
          });
        }

        // 트림별 색상 연결
        if (trimId && trim.colorIds) {
          await fetch(`/api/admin/vehicles/${id}/trims/${trimId}/colors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ colorIds: trim.colorIds }),
          });
        }

        // 트림별 옵션 연결
        if (trimId && trim.optionSettings) {
          await fetch(`/api/admin/vehicles/${id}/trims/${trimId}/options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              options: trim.optionSettings.map(s => ({
                optionId: s.optionId,
                isIncluded: s.isIncluded,
              })),
            }),
          });
        }
      }

      // 4. Create/Update colors
      const allColors = [...exteriorColors, ...interiorColors];
      for (const color of allColors) {
        if (color.isNew) {
          await fetch(`/api/admin/vehicles/${id}/colors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(color),
          });
        } else if (color.id) {
          await fetch(`/api/admin/vehicles/${id}/colors`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ colorId: color.id, ...color }),
          });
        }
      }

      // 5. Create/Update options
      for (const option of options) {
        if (option.isNew) {
          await fetch(`/api/admin/vehicles/${id}/options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(option),
          });
        } else if (option.id) {
          await fetch(`/api/admin/vehicles/${id}/options`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ optionId: option.id, ...option }),
          });
        }
      }

      alert('저장되었습니다.');
      router.push('/admin/vehicles');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
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
      <Link
        href="/admin/vehicles"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        차량 목록
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">차량 수정: {formData.name}</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <nav className="flex gap-8">
            {[
              { key: 'basic', label: '기본 정보' },
              { key: 'trims', label: `트림 (${trims.length})` },
              { key: 'colors', label: `색상 (${exteriorColors.length + interiorColors.length})` },
              { key: 'options', label: `옵션 (${options.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openImportModal('all')}
            className="mb-2"
          >
            <Copy className="w-4 h-4 mr-1" />
            다른 차량에서 불러오기
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as VehicleCategory })}
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

                {/* 모델 정보 */}
                <div className="space-y-4 pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700">기준 모델 정보</label>
                  <Input
                    id="baseModelName"
                    label="기준 모델명"
                    value={formData.baseModelName}
                    onChange={(e) => setFormData({ ...formData, baseModelName: e.target.value })}
                    placeholder="예: 가솔린 1.6"
                  />
                  <p className="text-xs text-gray-500">입력 시 디테일 페이지에 &quot;가솔린 1.6 기준&quot; 으로 표시됩니다.</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasOtherModels}
                      onChange={(e) => setFormData({ ...formData, hasOtherModels: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-700">다른 모델 있음 (체크 시 &quot;다른 모델은 상담 문의&quot; 표시)</span>
                  </label>
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

            <Card>
              <CardHeader>
                <CardTitle>기본 차량가</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PriceInput
                  id="basePrice"
                  label="기본 차량가"
                  value={formData.basePrice}
                  onChange={(value) => setFormData({ ...formData, basePrice: value })}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 트림 리스트 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>트림 목록</CardTitle>
                <Button type="button" size="sm" onClick={addTrim}>
                  <Plus className="w-4 h-4 mr-1" />
                  추가
                </Button>
              </CardHeader>
              <CardContent>
                {trims.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">등록된 트림이 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {trims.map((trim, index) => (
                      <div
                        key={trim.id || `new-${index}`}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTrimIndex === index
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedTrimIndex(index)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={index === 0}
                                className="h-5 w-5 p-0"
                                onClick={(e) => { e.stopPropagation(); moveTrim(index, 'up'); }}
                              >
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={index === trims.length - 1}
                                className="h-5 w-5 p-0"
                                onClick={(e) => { e.stopPropagation(); moveTrim(index, 'down'); }}
                              >
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                            </div>
                            <div>
                              <p className="font-semibold">{trim.name || '새 트림'}</p>
                              <p className="text-sm text-gray-500">
                                +{trim.price.toLocaleString()}원
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTrim(index);
                              if (selectedTrimIndex === index) setSelectedTrimIndex(null);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 트림 상세 편집 */}
            {selectedTrimIndex !== null && trims[selectedTrimIndex] && (
              <div className="lg:col-span-2 space-y-6">
                {/* 기본 정보 */}
                <Card>
                  <CardHeader>
                    <CardTitle>트림 기본 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      label="트림명 *"
                      value={trims[selectedTrimIndex].name}
                      onChange={(e) => updateTrim(selectedTrimIndex, 'name', e.target.value)}
                      placeholder="예: 스마트"
                    />
                    <Input
                      label="추가 금액 (원)"
                      type="number"
                      value={trims[selectedTrimIndex].price.toString()}
                      onChange={(e) => updateTrim(selectedTrimIndex, 'price', parseInt(e.target.value) || 0)}
                    />
                    <Input
                      label="설명"
                      value={trims[selectedTrimIndex].description}
                      onChange={(e) => updateTrim(selectedTrimIndex, 'description', e.target.value)}
                      placeholder="선택사항"
                    />
                  </CardContent>
                </Card>

                {/* 색상 선택 */}
                <Card>
                  <CardHeader>
                    <CardTitle>이 트림에서 선택 가능한 색상</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 외장 색상 */}
                    <div>
                      <h4 className="font-medium mb-3">외장 색상</h4>
                      {exteriorColors.length === 0 ? (
                        <p className="text-gray-500 text-sm">외장 색상을 먼저 추가해주세요.</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {exteriorColors.map((color) => {
                            const isSelected = trims[selectedTrimIndex].colorIds?.includes(color.id || '');
                            return (
                              <button
                                key={color.id}
                                type="button"
                                onClick={() => toggleTrimColor(selectedTrimIndex, color.id || '')}
                                className={`p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${
                                  isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-primary/50'
                                }`}
                              >
                                <div
                                  className="w-8 h-8 rounded-md border flex-shrink-0"
                                  style={{ backgroundColor: color.hexCode }}
                                />
                                <span className="text-sm font-medium truncate">{color.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 내장 색상 */}
                    <div>
                      <h4 className="font-medium mb-3">내장 색상</h4>
                      {interiorColors.length === 0 ? (
                        <p className="text-gray-500 text-sm">내장 색상을 먼저 추가해주세요.</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {interiorColors.map((color) => {
                            const isSelected = trims[selectedTrimIndex].colorIds?.includes(color.id || '');
                            return (
                              <button
                                key={color.id}
                                type="button"
                                onClick={() => toggleTrimColor(selectedTrimIndex, color.id || '')}
                                className={`p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${
                                  isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-primary/50'
                                }`}
                              >
                                <div
                                  className="w-8 h-8 rounded-md border flex-shrink-0"
                                  style={{ backgroundColor: color.hexCode }}
                                />
                                <span className="text-sm font-medium truncate">{color.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 옵션 선택 */}
                <Card>
                  <CardHeader>
                    <CardTitle>이 트림에서 선택 가능한 옵션</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {options.length === 0 ? (
                      <p className="text-gray-500 text-sm">옵션을 먼저 추가해주세요.</p>
                    ) : (
                      <div className="space-y-2">
                        {options.map((option) => {
                          const setting = trims[selectedTrimIndex].optionSettings?.find(
                            s => s.optionId === option.id
                          );
                          const isSelected = !!setting;
                          const isIncluded = setting?.isIncluded || false;

                          return (
                            <div
                              key={option.id}
                              className={`p-3 rounded-lg border-2 ${
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleTrimOption(selectedTrimIndex, option.id || '', false)}
                                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <div className="flex-1">
                                  <p className="font-medium">{option.name}</p>
                                  <p className="text-sm text-gray-500">+{option.price.toLocaleString()}원</p>
                                </div>
                                {isSelected && (
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isIncluded}
                                      onChange={(e) => updateTrimOptionIncluded(selectedTrimIndex, option.id || '', e.target.checked)}
                                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm text-green-600 font-medium">기본 포함</span>
                                  </label>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedTrimIndex === null && trims.length > 0 && (
              <div className="lg:col-span-2 flex items-center justify-center">
                <p className="text-gray-500">왼쪽에서 트림을 선택하여 편집하세요.</p>
              </div>
            )}
          </div>
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
                      <div key={color.id || `new-ext-${index}`} className="flex gap-2 items-start p-4 bg-gray-50 rounded-lg">
                        <div className="flex flex-col mt-6">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                            onClick={() => moveColor('EXTERIOR', index, 'up')}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={index === exteriorColors.length - 1}
                            className="h-6 w-6 p-0"
                            onClick={() => moveColor('EXTERIOR', index, 'down')}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                        </div>
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
                      <div key={color.id || `new-int-${index}`} className="flex gap-2 items-start p-4 bg-gray-50 rounded-lg">
                        <div className="flex flex-col mt-6">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                            onClick={() => moveColor('INTERIOR', index, 'up')}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={index === interiorColors.length - 1}
                            className="h-6 w-6 p-0"
                            onClick={() => moveColor('INTERIOR', index, 'down')}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                        </div>
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
                <p className="text-gray-500 text-center py-8">등록된 옵션이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {options.map((option, index) => (
                    <div key={option.id || `new-${index}`} className="flex gap-2 items-start p-4 bg-gray-50 rounded-lg">
                      <div className="flex flex-col mt-6">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                          onClick={() => moveOption(index, 'up')}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={index === options.length - 1}
                          className="h-6 w-6 p-0"
                          onClick={() => moveOption(index, 'down')}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
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
          <Button type="submit" disabled={saving}>
            {saving ? '저장 중...' : '모든 변경사항 저장'}
          </Button>
        </div>
      </form>

      {/* 옵션 불러오기 모달 */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowImportModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-bold text-lg">다른 차량에서 불러오기</h3>
                <p className="text-sm text-gray-500">같은 브랜드의 차량에서 트림/색상/옵션을 복사합니다</p>
              </div>
              <button onClick={() => setShowImportModal(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-4 border-b">
              <label className="block text-sm font-medium text-gray-700 mb-2">불러올 항목</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: '전체' },
                  { value: 'trims', label: '트림만' },
                  { value: 'colors', label: '색상만' },
                  { value: 'options', label: '옵션만' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setImportType(item.value as typeof importType)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      importType === item.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingImport ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : sameBrandVehicles.length > 0 ? (
                <div className="space-y-2">
                  {sameBrandVehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => importFromVehicle(vehicle.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Car className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{vehicle.name}</p>
                        <p className="text-sm text-gray-500">클릭하여 불러오기</p>
                      </div>
                      <Copy className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>같은 브랜드의 다른 차량이 없습니다.</p>
                  <p className="text-sm mt-1">다른 브랜드 차량을 먼저 등록해주세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
