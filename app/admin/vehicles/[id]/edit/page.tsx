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
  optionSettings?: { optionId: string; isIncluded: boolean; price?: number | null }[];
}

interface ColorData {
  id?: string;
  type: 'EXTERIOR' | 'INTERIOR';
  name: string;
  hexCode: string;
  price: number;
  sortOrder: number;
  isNew?: boolean;
  masterColorId?: string;
}

interface OptionData {
  id?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  sortOrder: number;
  isNew?: boolean;
  masterOptionId?: string;
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
    // 선납금 0%
    rentPrice60_0: '',
    rentPrice48_0: '',
    rentPrice36_0: '',
    rentPrice24_0: '',
    // 선납금 30%
    rentPrice60_30: '',
    rentPrice48_30: '',
    rentPrice36_30: '',
    rentPrice24_30: '',
    // 선납금 40%
    rentPrice60_40: '',
    rentPrice48_40: '',
    rentPrice36_40: '',
    rentPrice24_40: '',
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
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]); // 다중 선택
  const [loadingImport, setLoadingImport] = useState(false);

  // 브랜드 마스터 색상/옵션 모달
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterColors, setMasterColors] = useState<{ id: string; type: string; name: string; hexCode: string; vehicleCount: number }[]>([]);
  const [masterOptions, setMasterOptions] = useState<{ id: string; name: string; category: string; vehicleCount: number }[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [selectedMasterColors, setSelectedMasterColors] = useState<string[]>([]);
  const [selectedMasterOptions, setSelectedMasterOptions] = useState<string[]>([]);
  const [masterTab, setMasterTab] = useState<'colors' | 'options'>('colors');
  const [masterSearch, setMasterSearch] = useState('');

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
          // 선납금 0%
          rentPrice60_0: vehicle.rentPrice60_0?.toString() || '',
          rentPrice48_0: vehicle.rentPrice48_0?.toString() || '',
          rentPrice36_0: vehicle.rentPrice36_0?.toString() || '',
          rentPrice24_0: vehicle.rentPrice24_0?.toString() || '',
          // 선납금 30%
          rentPrice60_30: vehicle.rentPrice60_30?.toString() || '',
          rentPrice48_30: vehicle.rentPrice48_30?.toString() || '',
          rentPrice36_30: vehicle.rentPrice36_30?.toString() || '',
          rentPrice24_30: vehicle.rentPrice24_30?.toString() || '',
          // 선납금 40%
          rentPrice60_40: vehicle.rentPrice60_40?.toString() || '',
          rentPrice48_40: vehicle.rentPrice48_40?.toString() || '',
          rentPrice36_40: vehicle.rentPrice36_40?.toString() || '',
          rentPrice24_40: vehicle.rentPrice24_40?.toString() || '',
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
                // vehicleColorId는 VehicleColor.id이며 color.id와 동일
                colorIds: trimColors.map((tc: { vehicleColorId?: string; colorId?: string; color?: { id: string } }) =>
                  tc.vehicleColorId || tc.color?.id || tc.colorId || ''
                ),
                // vehicleOptionId는 VehicleOption.id이며 option.id와 동일
                optionSettings: trimOptions.map((to: { vehicleOptionId?: string; optionId?: string; option?: { id: string }; isIncluded: boolean; price?: number | null }) => ({
                  optionId: to.vehicleOptionId || to.option?.id || to.optionId || '',
                  isIncluded: to.isIncluded,
                  price: to.price ?? null,
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
      // 없으면 추가 (price는 null로 시작 - 기본 가격 사용)
      updated[trimIndex].optionSettings = [...currentSettings, { optionId, isIncluded, price: null }];
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

  const updateTrimOptionPrice = (trimIndex: number, optionId: string, price: number | null) => {
    const updated = [...trims];
    const currentSettings = updated[trimIndex].optionSettings || [];
    const settingIndex = currentSettings.findIndex(s => s.optionId === optionId);

    if (settingIndex >= 0) {
      currentSettings[settingIndex].price = price;
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
    setSelectedVehicleIds([]); // 선택 초기화

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

  // 차량 선택 토글
  const toggleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicleIds(prev =>
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  // 선택한 차량들에서 옵션 복사 (서버 API 사용 - 중복 자동 필터링)
  const importFromSelectedVehicles = async () => {
    if (selectedVehicleIds.length === 0) {
      alert('차량을 선택해주세요.');
      return;
    }

    setLoadingImport(true);

    try {
      // 새 Import API 호출 (중복 자동 필터링)
      const res = await fetch(`/api/admin/vehicles/${id}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceVehicleIds: selectedVehicleIds,
          importColors: importType === 'colors' || importType === 'all',
          importOptions: importType === 'options' || importType === 'all',
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Import failed');
      }

      // 트림은 별도 처리 (서버 API에 없음)
      if (importType === 'trims' || importType === 'all') {
        for (const sourceVehicleId of selectedVehicleIds) {
          const trimsRes = await fetch(`/api/admin/vehicles/${sourceVehicleId}/trims`);
          const sourceTrims = await trimsRes.json();

          // 중복 체크: 이름이 같은 트림 제외
          const existingNames = new Set(trims.map(t => t.name.toLowerCase()));
          const newTrims: TrimData[] = sourceTrims
            .filter((t: TrimData) => !existingNames.has(t.name.toLowerCase()))
            .map((t: TrimData, idx: number) => {
              existingNames.add(t.name.toLowerCase()); // 방금 추가한 것도 중복 체크에 포함
              return {
                name: t.name,
                price: t.price,
                description: t.description || '',
                sortOrder: trims.length + idx,
                isNew: true,
                colorIds: [],
                optionSettings: [],
              };
            });

          if (newTrims.length > 0) {
            setTrims(prev => [...prev, ...newTrims]);
          }
        }
      }

      // 데이터 새로고침 (색상/옵션)
      if (importType === 'colors' || importType === 'all' || importType === 'options') {
        const [colorsRes, optionsRes] = await Promise.all([
          fetch(`/api/admin/vehicles/${id}/colors`),
          fetch(`/api/admin/vehicles/${id}/options`),
        ]);

        const colorsData = await colorsRes.json();
        const optionsData = await optionsRes.json();

        setExteriorColors(colorsData.filter((c: ColorData) => c.type === 'EXTERIOR'));
        setInteriorColors(colorsData.filter((c: ColorData) => c.type === 'INTERIOR'));
        setOptions(optionsData.map((o: OptionData) => ({ ...o, description: o.description || '', category: o.category || '기타' })));
      }

      // 결과 메시지
      const msg = result.message || '불러오기가 완료되었습니다.';
      const details: string[] = [];
      if (result.result?.colors?.skippedItems?.length > 0) {
        details.push(`중복 색상 건너뜀: ${result.result.colors.skippedItems.slice(0, 3).join(', ')}${result.result.colors.skippedItems.length > 3 ? ' 외 ' + (result.result.colors.skippedItems.length - 3) + '개' : ''}`);
      }
      if (result.result?.options?.skippedItems?.length > 0) {
        details.push(`중복 옵션 건너뜀: ${result.result.options.skippedItems.slice(0, 3).join(', ')}${result.result.options.skippedItems.length > 3 ? ' 외 ' + (result.result.options.skippedItems.length - 3) + '개' : ''}`);
      }

      alert(msg + (details.length > 0 ? '\n\n' + details.join('\n') : ''));
      setShowImportModal(false);
    } catch (error) {
      console.error('Failed to import:', error);
      alert('불러오기에 실패했습니다.');
    } finally {
      setLoadingImport(false);
    }
  };

  // 브랜드 마스터 목록 모달 열기
  const openMasterModal = async () => {
    if (!formData.brandId) {
      alert('먼저 브랜드를 선택해주세요.');
      return;
    }

    setLoadingMaster(true);
    setShowMasterModal(true);
    setSelectedMasterColors([]);
    setSelectedMasterOptions([]);
    setMasterSearch('');

    try {
      const [colorsRes, optionsRes] = await Promise.all([
        fetch(`/api/admin/brands/${formData.brandId}/colors`),
        fetch(`/api/admin/brands/${formData.brandId}/options`),
      ]);

      if (colorsRes.ok) {
        setMasterColors(await colorsRes.json());
      }
      if (optionsRes.ok) {
        setMasterOptions(await optionsRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch master data:', error);
    } finally {
      setLoadingMaster(false);
    }
  };

  // 마스터 색상 선택 토글
  const toggleMasterColor = (colorId: string) => {
    setSelectedMasterColors(prev =>
      prev.includes(colorId)
        ? prev.filter(id => id !== colorId)
        : [...prev, colorId]
    );
  };

  // 마스터 옵션 선택 토글
  const toggleMasterOption = (optionId: string) => {
    setSelectedMasterOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  // 선택한 마스터 항목 추가
  const addSelectedMasterItems = async () => {
    if (selectedMasterColors.length === 0 && selectedMasterOptions.length === 0) {
      alert('추가할 항목을 선택해주세요.');
      return;
    }

    setLoadingMaster(true);

    try {
      let addedColors = 0;
      let addedOptions = 0;
      let skippedColors = 0;
      let skippedOptions = 0;

      // 현재 차량에 있는 색상/옵션 확인 (중복 체크용)
      const existingExtColorNames = new Set(exteriorColors.map(c => c.name.toLowerCase()));
      const existingIntColorNames = new Set(interiorColors.map(c => c.name.toLowerCase()));
      const existingOptionNames = new Set(options.map(o => o.name.toLowerCase()));

      // 선택한 마스터 색상 추가
      for (const colorId of selectedMasterColors) {
        const masterColor = masterColors.find(c => c.id === colorId);
        if (!masterColor) continue;

        const isExterior = masterColor.type === 'EXTERIOR';
        const existingSet = isExterior ? existingExtColorNames : existingIntColorNames;

        if (existingSet.has(masterColor.name.toLowerCase())) {
          skippedColors++;
          continue;
        }

        const newColor: ColorData = {
          type: masterColor.type as 'EXTERIOR' | 'INTERIOR',
          name: masterColor.name,
          hexCode: masterColor.hexCode,
          price: 0,
          sortOrder: isExterior ? exteriorColors.length : interiorColors.length,
          isNew: true,
          masterColorId: masterColor.id,
        };

        if (isExterior) {
          setExteriorColors(prev => [...prev, newColor]);
          existingExtColorNames.add(masterColor.name.toLowerCase());
        } else {
          setInteriorColors(prev => [...prev, newColor]);
          existingIntColorNames.add(masterColor.name.toLowerCase());
        }
        addedColors++;
      }

      // 선택한 마스터 옵션 추가
      for (const optionId of selectedMasterOptions) {
        const masterOption = masterOptions.find(o => o.id === optionId);
        if (!masterOption) continue;

        if (existingOptionNames.has(masterOption.name.toLowerCase())) {
          skippedOptions++;
          continue;
        }

        const newOption: OptionData = {
          name: masterOption.name,
          price: 0,
          description: '',
          category: masterOption.category || '기타',
          sortOrder: options.length,
          isNew: true,
          masterOptionId: masterOption.id,
        };

        setOptions(prev => [...prev, newOption]);
        existingOptionNames.add(masterOption.name.toLowerCase());
        addedOptions++;
      }

      // 결과 메시지
      const messages: string[] = [];
      if (addedColors > 0) messages.push(`색상 ${addedColors}개 추가`);
      if (addedOptions > 0) messages.push(`옵션 ${addedOptions}개 추가`);
      if (skippedColors > 0) messages.push(`색상 ${skippedColors}개 중복 건너뜀`);
      if (skippedOptions > 0) messages.push(`옵션 ${skippedOptions}개 중복 건너뜀`);

      alert(messages.join(', ') + '\n\n가격을 설정한 후 저장해주세요.');
      setShowMasterModal(false);
    } catch (error) {
      console.error('Failed to add master items:', error);
      alert('추가에 실패했습니다.');
    } finally {
      setLoadingMaster(false);
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
          // 선납금 0%
          rentPrice60_0: formData.rentPrice60_0 ? parseInt(formData.rentPrice60_0) : null,
          rentPrice48_0: formData.rentPrice48_0 ? parseInt(formData.rentPrice48_0) : null,
          rentPrice36_0: formData.rentPrice36_0 ? parseInt(formData.rentPrice36_0) : null,
          rentPrice24_0: formData.rentPrice24_0 ? parseInt(formData.rentPrice24_0) : null,
          // 선납금 30%
          rentPrice60_30: formData.rentPrice60_30 ? parseInt(formData.rentPrice60_30) : null,
          rentPrice48_30: formData.rentPrice48_30 ? parseInt(formData.rentPrice48_30) : null,
          rentPrice36_30: formData.rentPrice36_30 ? parseInt(formData.rentPrice36_30) : null,
          rentPrice24_30: formData.rentPrice24_30 ? parseInt(formData.rentPrice24_30) : null,
          // 선납금 40%
          rentPrice60_40: formData.rentPrice60_40 ? parseInt(formData.rentPrice60_40) : null,
          rentPrice48_40: formData.rentPrice48_40 ? parseInt(formData.rentPrice48_40) : null,
          rentPrice36_40: formData.rentPrice36_40 ? parseInt(formData.rentPrice36_40) : null,
          rentPrice24_40: formData.rentPrice24_40 ? parseInt(formData.rentPrice24_40) : null,
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
          trimId = trim.id; // 기존 트림의 ID 설정
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
                price: s.price, // 트림별 개별 가격
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
          <div className="flex gap-2 mb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openMasterModal}
            >
              브랜드 색상/옵션 목록
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openImportModal('all')}
            >
              <Copy className="w-4 h-4 mr-1" />
              다른 차량에서 불러오기
            </Button>
          </div>
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

            {/* 선납금별 렌트 가격 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>선납금 비율별 렌트 가격 (월 납입금)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 선납금 0% */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-3">선납금 0%</h4>
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

                  {/* 선납금 30% */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-3">선납금 30%</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <PriceInput
                        label="60개월"
                        value={formData.rentPrice60_30}
                        onChange={(value) => setFormData({ ...formData, rentPrice60_30: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="48개월"
                        value={formData.rentPrice48_30}
                        onChange={(value) => setFormData({ ...formData, rentPrice48_30: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="36개월"
                        value={formData.rentPrice36_30}
                        onChange={(value) => setFormData({ ...formData, rentPrice36_30: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="24개월"
                        value={formData.rentPrice24_30}
                        onChange={(value) => setFormData({ ...formData, rentPrice24_30: value })}
                        placeholder="월 납입금"
                      />
                    </div>
                  </div>

                  {/* 선납금 40% */}
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-3">선납금 40%</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <PriceInput
                        label="60개월"
                        value={formData.rentPrice60_40}
                        onChange={(value) => setFormData({ ...formData, rentPrice60_40: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="48개월"
                        value={formData.rentPrice48_40}
                        onChange={(value) => setFormData({ ...formData, rentPrice48_40: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="36개월"
                        value={formData.rentPrice36_40}
                        onChange={(value) => setFormData({ ...formData, rentPrice36_40: value })}
                        placeholder="월 납입금"
                      />
                      <PriceInput
                        label="24개월"
                        value={formData.rentPrice24_40}
                        onChange={(value) => setFormData({ ...formData, rentPrice24_40: value })}
                        placeholder="월 납입금"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 text-center">
                    * 미입력 시 해당 옵션은 &quot;상담 문의&quot;로 표시됩니다. 세부 선납금 비율 조정은 상담을 통해 안내됩니다.
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

                          const trimPrice = setting?.price;

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
                                  <p className="text-sm text-gray-500">기본 가격: +{option.price.toLocaleString()}원</p>
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
                              {isSelected && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <label className="text-sm text-gray-600 whitespace-nowrap">트림별 가격:</label>
                                    <input
                                      type="number"
                                      value={trimPrice ?? ''}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        updateTrimOptionPrice(
                                          selectedTrimIndex,
                                          option.id || '',
                                          value === '' ? null : parseInt(value, 10)
                                        );
                                      }}
                                      placeholder={`기본값 ${option.price.toLocaleString()}원`}
                                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    />
                                    <span className="text-sm text-gray-500">원</span>
                                    {trimPrice !== null && trimPrice !== undefined && (
                                      <button
                                        type="button"
                                        onClick={() => updateTrimOptionPrice(selectedTrimIndex, option.id || '', null)}
                                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                                      >
                                        기본값 사용
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1">
                                    비워두면 기본 가격({option.price.toLocaleString()}원)이 적용됩니다.
                                  </p>
                                </div>
                              )}
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
                <p className="text-sm text-gray-500">같은 브랜드의 차량에서 복사 (중복 자동 필터링)</p>
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
                  <p className="text-sm text-gray-500 mb-3">
                    여러 차량 선택 가능 (예: G80, G70 동시 선택)
                  </p>
                  {sameBrandVehicles.map((vehicle) => {
                    const isSelected = selectedVehicleIds.includes(vehicle.id);
                    return (
                      <button
                        key={vehicle.id}
                        type="button"
                        onClick={() => toggleVehicleSelection(vehicle.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Car className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{vehicle.name}</p>
                          <p className="text-sm text-gray-500">클릭하여 선택</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>같은 브랜드의 다른 차량이 없습니다.</p>
                  <p className="text-sm mt-1">다른 브랜드 차량을 먼저 등록해주세요.</p>
                </div>
              )}
            </div>

            {/* 선택된 차량이 있을 때 불러오기 버튼 표시 */}
            {selectedVehicleIds.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <Button
                  type="button"
                  className="w-full"
                  onClick={importFromSelectedVehicles}
                  disabled={loadingImport}
                >
                  {loadingImport ? (
                    '불러오는 중...'
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      {selectedVehicleIds.length}개 차량에서 불러오기 (중복 자동 제외)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 브랜드 마스터 목록 모달 - 개별 선택 가능 */}
      {showMasterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMasterModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-bold text-lg">브랜드 색상/옵션에서 선택하여 추가</h3>
                <p className="text-sm text-gray-500">필요한 항목을 선택하고 추가 버튼을 눌러주세요</p>
              </div>
              <button onClick={() => setShowMasterModal(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* 탭 */}
            <div className="flex border-b px-4">
              <button
                type="button"
                onClick={() => setMasterTab('colors')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  masterTab === 'colors'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500'
                }`}
              >
                색상 ({masterColors.length}개)
                {selectedMasterColors.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                    {selectedMasterColors.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setMasterTab('options')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  masterTab === 'options'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500'
                }`}
              >
                옵션 ({masterOptions.length}개)
                {selectedMasterOptions.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                    {selectedMasterOptions.length}
                  </span>
                )}
              </button>
            </div>

            {/* 검색 */}
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder={masterTab === 'colors' ? '색상 검색...' : '옵션 검색...'}
                value={masterSearch}
                onChange={(e) => setMasterSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingMaster ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : masterTab === 'colors' ? (
                /* 색상 탭 */
                <div className="space-y-4">
                  {/* 외장색 */}
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">외장색</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {masterColors
                        .filter(c => c.type === 'EXTERIOR')
                        .filter(c => c.name.toLowerCase().includes(masterSearch.toLowerCase()))
                        .map((color) => {
                          const isSelected = selectedMasterColors.includes(color.id);
                          const isExisting = exteriorColors.some(
                            ec => ec.name.toLowerCase() === color.name.toLowerCase()
                          );
                          return (
                            <button
                              key={color.id}
                              type="button"
                              onClick={() => !isExisting && toggleMasterColor(color.id)}
                              disabled={isExisting}
                              className={`flex items-center gap-2 p-2 rounded-lg border-2 text-left transition-all ${
                                isExisting
                                  ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                                  : isSelected
                                  ? 'border-primary bg-primary/10'
                                  : 'border-gray-200 hover:border-primary/50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isExisting}
                                onChange={() => {}}
                                className="w-4 h-4 rounded"
                              />
                              <div
                                className="w-6 h-6 rounded border flex-shrink-0"
                                style={{ backgroundColor: color.hexCode }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{color.name}</p>
                                {isExisting && (
                                  <p className="text-xs text-green-600">이미 추가됨</p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* 내장색 */}
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">내장색</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {masterColors
                        .filter(c => c.type === 'INTERIOR')
                        .filter(c => c.name.toLowerCase().includes(masterSearch.toLowerCase()))
                        .map((color) => {
                          const isSelected = selectedMasterColors.includes(color.id);
                          const isExisting = interiorColors.some(
                            ic => ic.name.toLowerCase() === color.name.toLowerCase()
                          );
                          return (
                            <button
                              key={color.id}
                              type="button"
                              onClick={() => !isExisting && toggleMasterColor(color.id)}
                              disabled={isExisting}
                              className={`flex items-center gap-2 p-2 rounded-lg border-2 text-left transition-all ${
                                isExisting
                                  ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                                  : isSelected
                                  ? 'border-primary bg-primary/10'
                                  : 'border-gray-200 hover:border-primary/50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isExisting}
                                onChange={() => {}}
                                className="w-4 h-4 rounded"
                              />
                              <div
                                className="w-6 h-6 rounded border flex-shrink-0"
                                style={{ backgroundColor: color.hexCode }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{color.name}</p>
                                {isExisting && (
                                  <p className="text-xs text-green-600">이미 추가됨</p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {masterColors.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-8">등록된 색상이 없습니다.</p>
                  )}
                </div>
              ) : (
                /* 옵션 탭 */
                <div className="space-y-2">
                  {masterOptions
                    .filter(o => o.name.toLowerCase().includes(masterSearch.toLowerCase()))
                    .map((option) => {
                      const isSelected = selectedMasterOptions.includes(option.id);
                      const isExisting = options.some(
                        eo => eo.name.toLowerCase() === option.name.toLowerCase()
                      );
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => !isExisting && toggleMasterOption(option.id)}
                          disabled={isExisting}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                            isExisting
                              ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                              : isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-200 hover:border-primary/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isExisting}
                            onChange={() => {}}
                            className="w-4 h-4 rounded"
                          />
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium flex-shrink-0">
                            {option.category || '기타'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{option.name}</p>
                          </div>
                          {isExisting && (
                            <span className="text-xs text-green-600 flex-shrink-0">이미 추가됨</span>
                          )}
                        </button>
                      );
                    })}

                  {masterOptions.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-8">등록된 옵션이 없습니다.</p>
                  )}
                </div>
              )}
            </div>

            {/* 하단 추가 버튼 */}
            {(selectedMasterColors.length > 0 || selectedMasterOptions.length > 0) && (
              <div className="p-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {selectedMasterColors.length > 0 && (
                      <span className="mr-3">색상 {selectedMasterColors.length}개</span>
                    )}
                    {selectedMasterOptions.length > 0 && (
                      <span>옵션 {selectedMasterOptions.length}개</span>
                    )}
                    <span className="ml-1">선택됨</span>
                  </div>
                  <Button
                    type="button"
                    onClick={addSelectedMasterItems}
                    disabled={loadingMaster}
                  >
                    {loadingMaster ? '추가 중...' : '선택한 항목 추가'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
