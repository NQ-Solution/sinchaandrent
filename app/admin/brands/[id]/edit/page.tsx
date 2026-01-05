'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit2, Merge, Search, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { Brand } from '@/types';

interface MasterColorData {
  id: string;
  type: 'EXTERIOR' | 'INTERIOR';
  name: string;
  hexCode: string;
  sortOrder: number;
  isActive: boolean;
  vehicleCount: number;
  usedInVehicles: { vehicleId: string; vehicleName: string }[];
}

interface MasterOptionData {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
  vehicleCount: number;
  usedInVehicles: { vehicleId: string; vehicleName: string }[];
}

const optionCategories = ['편의', '안전', '외관', '내장', '성능', '기타'];

export default function EditBrandPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'colors' | 'options'>('basic');

  // 기본 정보
  const [formData, setFormData] = useState({
    nameKr: '',
    nameEn: '',
    isDomestic: true,
    isActive: true,
    sortOrder: 999,
  });

  // 색상 관리
  const [masterColors, setMasterColors] = useState<MasterColorData[]>([]);
  const [loadingColors, setLoadingColors] = useState(false);
  const [colorSearch, setColorSearch] = useState('');
  const [colorTypeFilter, setColorTypeFilter] = useState<'all' | 'EXTERIOR' | 'INTERIOR'>('all');
  const [editingColor, setEditingColor] = useState<MasterColorData | null>(null);
  const [newColor, setNewColor] = useState<Partial<MasterColorData> | null>(null);

  // 옵션 관리
  const [masterOptions, setMasterOptions] = useState<MasterOptionData[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionSearch, setOptionSearch] = useState('');
  const [optionCategoryFilter, setOptionCategoryFilter] = useState('all');
  const [editingOption, setEditingOption] = useState<MasterOptionData | null>(null);
  const [newOption, setNewOption] = useState<Partial<MasterOptionData> | null>(null);

  // 병합 모달
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeType, setMergeType] = useState<'color' | 'option'>('color');
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);
  const [mergeTarget, setMergeTarget] = useState<string>('');

  useEffect(() => {
    async function fetchBrand() {
      try {
        const res = await fetch(`/api/admin/brands/${id}`);

        if (!res.ok) {
          alert('브랜드를 찾을 수 없습니다.');
          router.push('/admin/brands');
          return;
        }

        const brand: Brand = await res.json();
        setFormData({
          nameKr: brand.nameKr,
          nameEn: brand.nameEn || '',
          isDomestic: brand.isDomestic ?? true,
          isActive: brand.isActive,
          sortOrder: brand.sortOrder || 999,
        });
      } catch (error) {
        console.error('Failed to fetch brand:', error);
        alert('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchBrand();
  }, [id, router]);

  // 색상 목록 로드
  const loadColors = async () => {
    setLoadingColors(true);
    try {
      const res = await fetch(`/api/admin/brands/${id}/colors`);
      if (res.ok) {
        setMasterColors(await res.json());
      }
    } catch (error) {
      console.error('Failed to load colors:', error);
    } finally {
      setLoadingColors(false);
    }
  };

  // 옵션 목록 로드
  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const res = await fetch(`/api/admin/brands/${id}/options`);
      if (res.ok) {
        setMasterOptions(await res.json());
      }
    } catch (error) {
      console.error('Failed to load options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (activeTab === 'colors' && masterColors.length === 0) {
      loadColors();
    } else if (activeTab === 'options' && masterOptions.length === 0) {
      loadOptions();
    }
  }, [activeTab]);

  // 색상 추가
  const handleAddColor = async () => {
    if (!newColor?.name || !newColor?.type) {
      alert('색상 타입과 이름을 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/brands/${id}/colors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newColor.type,
          name: newColor.name.trim(),
          hexCode: newColor.hexCode || '#000000',
        }),
      });

      if (res.ok) {
        setNewColor(null);
        loadColors();
      } else {
        const error = await res.json();
        alert(error.error || '추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to add color:', error);
      alert('추가에 실패했습니다.');
    }
  };

  // 색상 수정
  const handleUpdateColor = async () => {
    if (!editingColor) return;

    try {
      const res = await fetch(`/api/admin/brands/${id}/colors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colorId: editingColor.id,
          hexCode: editingColor.hexCode,
          sortOrder: editingColor.sortOrder,
          isActive: editingColor.isActive,
        }),
      });

      if (res.ok) {
        setEditingColor(null);
        loadColors();
      } else {
        alert('수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update color:', error);
      alert('수정에 실패했습니다.');
    }
  };

  // 색상 삭제
  const handleDeleteColor = async (colorId: string, vehicleCount: number) => {
    if (vehicleCount > 0) {
      alert(`이 색상은 ${vehicleCount}개 차량에서 사용 중입니다.\n먼저 해당 차량에서 제거해주세요.`);
      return;
    }

    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/admin/brands/${id}/colors?colorId=${colorId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadColors();
      } else {
        const error = await res.json();
        alert(error.error || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete color:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  // 옵션 추가
  const handleAddOption = async () => {
    if (!newOption?.name) {
      alert('옵션 이름을 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/brands/${id}/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOption.name.trim(),
          description: newOption.description || null,
          category: newOption.category || '기타',
        }),
      });

      if (res.ok) {
        setNewOption(null);
        loadOptions();
      } else {
        const error = await res.json();
        alert(error.error || '추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to add option:', error);
      alert('추가에 실패했습니다.');
    }
  };

  // 옵션 수정
  const handleUpdateOption = async () => {
    if (!editingOption) return;

    try {
      const res = await fetch(`/api/admin/brands/${id}/options`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionId: editingOption.id,
          description: editingOption.description,
          category: editingOption.category,
          sortOrder: editingOption.sortOrder,
          isActive: editingOption.isActive,
        }),
      });

      if (res.ok) {
        setEditingOption(null);
        loadOptions();
      } else {
        alert('수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update option:', error);
      alert('수정에 실패했습니다.');
    }
  };

  // 옵션 삭제
  const handleDeleteOption = async (optionId: string, vehicleCount: number) => {
    if (vehicleCount > 0) {
      alert(`이 옵션은 ${vehicleCount}개 차량에서 사용 중입니다.\n먼저 해당 차량에서 제거해주세요.`);
      return;
    }

    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/admin/brands/${id}/options?optionId=${optionId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadOptions();
      } else {
        const error = await res.json();
        alert(error.error || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete option:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  // 병합 실행
  const handleMerge = async () => {
    if (selectedForMerge.length < 2) {
      alert('병합할 항목을 2개 이상 선택해주세요.');
      return;
    }
    if (!mergeTarget) {
      alert('유지할 항목을 선택해주세요.');
      return;
    }

    const itemsToMerge = selectedForMerge.filter(id => id !== mergeTarget);

    if (!confirm(`${itemsToMerge.length}개 항목을 선택한 항목으로 병합합니다.\n이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/brands/${id}/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: mergeType,
          targetId: mergeTarget,
          sourceIds: itemsToMerge,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        alert(result.message || '병합이 완료되었습니다.');
        setShowMergeModal(false);
        setSelectedForMerge([]);
        setMergeTarget('');
        if (mergeType === 'color') {
          loadColors();
        } else {
          loadOptions();
        }
      } else {
        const error = await res.json();
        alert(error.error || '병합에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to merge:', error);
      alert('병합에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/brands/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sortOrder: parseInt(formData.sortOrder.toString()) || 999,
        }),
      });

      if (res.ok) {
        alert('수정되었습니다.');
        router.push('/admin/brands');
        router.refresh();
      } else {
        alert('수정에 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 필터링된 색상
  const filteredColors = masterColors.filter(color => {
    const matchSearch = color.name.toLowerCase().includes(colorSearch.toLowerCase());
    const matchType = colorTypeFilter === 'all' || color.type === colorTypeFilter;
    return matchSearch && matchType;
  });

  // 필터링된 옵션
  const filteredOptions = masterOptions.filter(option => {
    const matchSearch = option.name.toLowerCase().includes(optionSearch.toLowerCase());
    const matchCategory = optionCategoryFilter === 'all' || option.category === optionCategoryFilter;
    return matchSearch && matchCategory;
  });

  // 유사 항목 찾기 (간단한 레벤슈타인 거리 기반)
  const findSimilarItems = (items: { id: string; name: string }[], _threshold = 2) => {
    const similar: { a: string; b: string; nameA: string; nameB: string }[] = [];

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const nameA = items[i].name.toLowerCase().replace(/\s/g, '');
        const nameB = items[j].name.toLowerCase().replace(/\s/g, '');

        // 간단한 유사도 체크: 포함 관계 또는 길이 차이가 적은 경우
        if (nameA.includes(nameB) || nameB.includes(nameA) ||
            (Math.abs(nameA.length - nameB.length) <= 2 &&
             nameA.substring(0, Math.min(nameA.length, nameB.length) - 1) ===
             nameB.substring(0, Math.min(nameA.length, nameB.length) - 1))) {
          similar.push({
            a: items[i].id,
            b: items[j].id,
            nameA: items[i].name,
            nameB: items[j].name,
          });
        }
      }
    }
    return similar;
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
        href="/admin/brands"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        브랜드 목록
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">브랜드 수정: {formData.nameKr}</h1>

      {/* 탭 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {[
            { key: 'basic', label: '기본 정보' },
            { key: 'colors', label: `색상 관리 (${masterColors.length})` },
            { key: 'options', label: `옵션 관리 (${masterOptions.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'basic' | 'colors' | 'options')}
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

      {/* 기본 정보 탭 */}
      {activeTab === 'basic' && (
        <form onSubmit={handleSubmit}>
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>브랜드 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                id="nameKr"
                label="브랜드명 (한글) *"
                value={formData.nameKr}
                onChange={(e) => setFormData({ ...formData, nameKr: e.target.value })}
                placeholder="예: 현대"
                required
              />

              <Input
                id="nameEn"
                label="브랜드명 (영문)"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="예: Hyundai"
              />

              <Input
                id="sortOrder"
                label="정렬 순서"
                type="number"
                value={formData.sortOrder.toString()}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 999 })}
                placeholder="낮을수록 먼저 표시"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">브랜드 구분 *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isDomestic"
                      checked={formData.isDomestic === true}
                      onChange={() => setFormData({ ...formData, isDomestic: true })}
                      className="w-5 h-5 border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-700">국산</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isDomestic"
                      checked={formData.isDomestic === false}
                      onChange={() => setFormData({ ...formData, isDomestic: false })}
                      className="w-5 h-5 border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-700">수입</span>
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-gray-700">공개</span>
              </label>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 mt-8 max-w-xl">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              취소
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      )}

      {/* 색상 관리 탭 */}
      {activeTab === 'colors' && (
        <div className="space-y-6">
          {/* 검색 및 필터 */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="색상 검색..."
                      value={colorSearch}
                      onChange={(e) => setColorSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg w-64"
                    />
                  </div>
                  <select
                    value={colorTypeFilter}
                    onChange={(e) => setColorTypeFilter(e.target.value as 'all' | 'EXTERIOR' | 'INTERIOR')}
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="all">전체</option>
                    <option value="EXTERIOR">외장색</option>
                    <option value="INTERIOR">내장색</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMergeType('color');
                      setSelectedForMerge([]);
                      setMergeTarget('');
                      setShowMergeModal(true);
                    }}
                  >
                    <Merge className="w-4 h-4 mr-1" />
                    중복 병합
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setNewColor({ type: 'EXTERIOR', name: '', hexCode: '#000000' })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    색상 추가
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 새 색상 추가 폼 */}
          {newColor && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-base">새 색상 추가</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-end">
                  <select
                    value={newColor.type || 'EXTERIOR'}
                    onChange={(e) => setNewColor({ ...newColor, type: e.target.value as 'EXTERIOR' | 'INTERIOR' })}
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="EXTERIOR">외장색</option>
                    <option value="INTERIOR">내장색</option>
                  </select>
                  <Input
                    label="색상명"
                    value={newColor.name || ''}
                    onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                    placeholder="예: 아틀라스 화이트"
                    className="w-48"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">색상 코드</label>
                    <input
                      type="color"
                      value={newColor.hexCode || '#000000'}
                      onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                  </div>
                  <Button type="button" onClick={handleAddColor}>
                    추가
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setNewColor(null)}>
                    취소
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 색상 목록 */}
          {loadingColors ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredColors.map((color) => (
                <Card key={color.id} className={!color.isActive ? 'opacity-50' : ''}>
                  <CardContent className="py-4">
                    {editingColor?.id === color.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingColor.hexCode}
                            onChange={(e) => setEditingColor({ ...editingColor, hexCode: e.target.value })}
                            className="w-10 h-10 rounded border cursor-pointer"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{color.name}</p>
                            <p className="text-sm text-gray-500">{color.type === 'EXTERIOR' ? '외장' : '내장'}</p>
                          </div>
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingColor.isActive}
                            onChange={(e) => setEditingColor({ ...editingColor, isActive: e.target.checked })}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm">활성화</span>
                        </label>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdateColor}>저장</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingColor(null)}>취소</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded border-2 flex-shrink-0"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{color.name}</p>
                          <p className="text-sm text-gray-500">
                            {color.type === 'EXTERIOR' ? '외장' : '내장'} | {color.vehicleCount}개 차량
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingColor(color)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDeleteColor(color.id, color.vehicleCount)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredColors.length === 0 && !loadingColors && (
            <div className="text-center py-12 text-gray-500">
              등록된 색상이 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 옵션 관리 탭 */}
      {activeTab === 'options' && (
        <div className="space-y-6">
          {/* 검색 및 필터 */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="옵션 검색..."
                      value={optionSearch}
                      onChange={(e) => setOptionSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg w-64"
                    />
                  </div>
                  <select
                    value={optionCategoryFilter}
                    onChange={(e) => setOptionCategoryFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="all">전체 카테고리</option>
                    {optionCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMergeType('option');
                      setSelectedForMerge([]);
                      setMergeTarget('');
                      setShowMergeModal(true);
                    }}
                  >
                    <Merge className="w-4 h-4 mr-1" />
                    중복 병합
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setNewOption({ name: '', category: '편의' })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    옵션 추가
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 새 옵션 추가 폼 */}
          {newOption && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-base">새 옵션 추가</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-end">
                  <Input
                    label="옵션명"
                    value={newOption.name || ''}
                    onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                    placeholder="예: 파노라마 썬루프"
                    className="w-48"
                  />
                  <Select
                    id="newOptionCategory"
                    label="카테고리"
                    value={newOption.category || '편의'}
                    onChange={(e) => setNewOption({ ...newOption, category: e.target.value })}
                    options={optionCategories.map((c) => ({ value: c, label: c }))}
                  />
                  <Input
                    label="설명 (선택)"
                    value={newOption.description || ''}
                    onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
                    placeholder="선택사항"
                    className="w-48"
                  />
                  <Button type="button" onClick={handleAddOption}>
                    추가
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setNewOption(null)}>
                    취소
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 옵션 목록 */}
          {loadingOptions ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOptions.map((option) => (
                <Card key={option.id} className={!option.isActive ? 'opacity-50' : ''}>
                  <CardContent className="py-3">
                    {editingOption?.id === option.id ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-4 items-center">
                          <p className="font-medium">{option.name}</p>
                          <Select
                            id={`editCategory-${option.id}`}
                            value={editingOption.category || '기타'}
                            onChange={(e) => setEditingOption({ ...editingOption, category: e.target.value })}
                            options={optionCategories.map((c) => ({ value: c, label: c }))}
                          />
                          <Input
                            value={editingOption.description || ''}
                            onChange={(e) => setEditingOption({ ...editingOption, description: e.target.value })}
                            placeholder="설명"
                            className="w-48"
                          />
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingOption.isActive}
                              onChange={(e) => setEditingOption({ ...editingOption, isActive: e.target.checked })}
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-sm">활성화</span>
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdateOption}>저장</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingOption(null)}>취소</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                            {option.category || '기타'}
                          </span>
                          <div>
                            <p className="font-medium">{option.name}</p>
                            {option.description && (
                              <p className="text-sm text-gray-500">{option.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{option.vehicleCount}개 차량</span>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingOption(option)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDeleteOption(option.id, option.vehicleCount)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredOptions.length === 0 && !loadingOptions && (
            <div className="text-center py-12 text-gray-500">
              등록된 옵션이 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 병합 모달 */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMergeModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-bold text-lg">
                  {mergeType === 'color' ? '색상' : '옵션'} 중복 병합
                </h3>
                <p className="text-sm text-gray-500">
                  중복 항목을 선택하고, 유지할 항목을 지정해주세요
                </p>
              </div>
              <button onClick={() => setShowMergeModal(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* 유사 항목 자동 감지 */}
              {mergeType === 'color' && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">유사한 색상 감지:</h4>
                  {findSimilarItems(masterColors.map(c => ({ id: c.id, name: c.name }))).length > 0 ? (
                    <div className="space-y-2">
                      {findSimilarItems(masterColors.map(c => ({ id: c.id, name: c.name }))).map((pair, i) => (
                        <div key={i} className="p-2 bg-yellow-50 rounded text-sm">
                          <span className="font-medium">{pair.nameA}</span> ↔ <span className="font-medium">{pair.nameB}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">유사한 항목이 없습니다.</p>
                  )}
                </div>
              )}
              {mergeType === 'option' && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">유사한 옵션 감지:</h4>
                  {findSimilarItems(masterOptions.map(o => ({ id: o.id, name: o.name }))).length > 0 ? (
                    <div className="space-y-2">
                      {findSimilarItems(masterOptions.map(o => ({ id: o.id, name: o.name }))).map((pair, i) => (
                        <div key={i} className="p-2 bg-yellow-50 rounded text-sm">
                          <span className="font-medium">{pair.nameA}</span> ↔ <span className="font-medium">{pair.nameB}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">유사한 항목이 없습니다.</p>
                  )}
                </div>
              )}

              {/* 항목 선택 */}
              <h4 className="font-medium mb-2">병합할 항목 선택:</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                {(mergeType === 'color' ? masterColors : masterOptions).map((item) => {
                  const isSelected = selectedForMerge.includes(item.id);
                  const isTarget = mergeTarget === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                        isTarget ? 'bg-primary/20 border-2 border-primary' :
                        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (selectedForMerge.includes(item.id)) {
                          setSelectedForMerge(prev => prev.filter(id => id !== item.id));
                          if (mergeTarget === item.id) setMergeTarget('');
                        } else {
                          setSelectedForMerge(prev => [...prev, item.id]);
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded"
                      />
                      {mergeType === 'color' && (
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: (item as MasterColorData).hexCode }}
                        />
                      )}
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({(item as MasterColorData | MasterOptionData).vehicleCount}개 차량)
                        </span>
                      </div>
                      {isSelected && (
                        <Button
                          type="button"
                          size="sm"
                          variant={isTarget ? 'default' : 'outline'}
                          onClick={(e) => {
                            e.stopPropagation();
                            setMergeTarget(item.id);
                          }}
                        >
                          {isTarget ? <Check className="w-4 h-4 mr-1" /> : null}
                          {isTarget ? '유지됨' : '이것으로 유지'}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedForMerge.length >= 2 && mergeTarget && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm">
                    <strong>{selectedForMerge.length - 1}개</strong> 항목이{' '}
                    <strong>
                      {(mergeType === 'color'
                        ? masterColors.find(c => c.id === mergeTarget)?.name
                        : masterOptions.find(o => o.id === mergeTarget)?.name)}
                    </strong>
                    으로 병합됩니다.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMergeModal(false)}>
                취소
              </Button>
              <Button
                onClick={handleMerge}
                disabled={selectedForMerge.length < 2 || !mergeTarget}
              >
                병합 실행
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
