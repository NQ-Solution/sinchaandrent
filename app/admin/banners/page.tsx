'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Calendar, Link as LinkIcon, ExternalLink, Maximize2, Info, ImageIcon, Type } from 'lucide-react';
import type { Banner } from '@/types';

// 권장 이미지 사이즈
const IMAGE_SIZES = {
  desktop: { width: 1200, height: 400, ratio: '3:1' },
  mobile: { width: 800, height: 400, ratio: '2:1' },
};

// 기본 색상 프리셋
const COLOR_PRESETS = [
  { name: '기본 파랑', bg: '#1e3a5f', text: '#ffffff' },
  { name: '그린', bg: '#059669', text: '#ffffff' },
  { name: '퍼플', bg: '#7c3aed', text: '#ffffff' },
  { name: '레드', bg: '#dc2626', text: '#ffffff' },
  { name: '오렌지', bg: '#ea580c', text: '#ffffff' },
  { name: '다크', bg: '#1f2937', text: '#ffffff' },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerType, setBannerType] = useState<'image' | 'text'>('text');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    mobileImage: '',
    link: '',
    linkText: '',
    description: '',
    backgroundColor: '#1e3a5f',
    textColor: '#ffffff',
    startDate: '',
    endDate: '',
    sortOrder: 0,
    isActive: true,
  });

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'mobileImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingBanner
        ? `/api/admin/banners/${editingBanner.id}`
        : '/api/admin/banners';
      const method = editingBanner ? 'PATCH' : 'POST';

      // 텍스트 타입일 때는 이미지 제거
      const submitData = {
        ...formData,
        image: bannerType === 'image' ? formData.image : null,
        mobileImage: bannerType === 'image' ? formData.mobileImage : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        fetchBanners();
        closeModal();
        alert(editingBanner ? '수정되었습니다.' : '등록되었습니다.');
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 배너를 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBanners(prev => prev.filter(b => b.id !== id));
        alert('삭제되었습니다.');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });

      if (res.ok) {
        setBanners(prev => prev.map(b =>
          b.id === banner.id ? { ...b, isActive: !b.isActive } : b
        ));
      }
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerType(banner.image ? 'image' : 'text');
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || '',
        image: banner.image || '',
        mobileImage: banner.mobileImage || '',
        link: banner.link || '',
        linkText: banner.linkText || '',
        description: banner.description || '',
        backgroundColor: banner.backgroundColor || '#1e3a5f',
        textColor: banner.textColor || '#ffffff',
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
        sortOrder: banner.sortOrder,
        isActive: banner.isActive,
      });
    } else {
      setEditingBanner(null);
      setBannerType('text');
      setFormData({
        title: '',
        subtitle: '',
        image: '',
        mobileImage: '',
        link: '',
        linkText: '',
        description: '',
        backgroundColor: '#1e3a5f',
        textColor: '#ffffff',
        startDate: '',
        endDate: '',
        sortOrder: 0,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
  };

  const openPreviewModal = (banner: Banner) => {
    setPreviewBanner(banner);
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewBanner(null);
  };

  const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setFormData(prev => ({
      ...prev,
      backgroundColor: preset.bg,
      textColor: preset.text,
    }));
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
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">배너 관리</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">이벤트/프로모션 배너를 관리합니다.</p>
        </div>
        <Button onClick={() => openModal()} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">배너 등록</span>
          <span className="sm:hidden">등록</span>
        </Button>
      </div>

      {/* Image Size Guide */}
      <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">배너 이미지 권장 사이즈</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 데스크톱: <strong>{IMAGE_SIZES.desktop.width} x {IMAGE_SIZES.desktop.height}px</strong> (비율 {IMAGE_SIZES.desktop.ratio})</li>
              <li>• 모바일: <strong>{IMAGE_SIZES.mobile.width} x {IMAGE_SIZES.mobile.height}px</strong> (비율 {IMAGE_SIZES.mobile.ratio})</li>
              <li>• 이미지 없이 <strong>텍스트 + 배경색</strong>만으로도 배너 생성 가능</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Banner List */}
      {banners.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">등록된 배너가 없습니다.</p>
          <Button onClick={() => openModal()}>첫 배너 등록하기</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <Card key={banner.id} className={`p-4 ${!banner.isActive ? 'opacity-60' : ''}`}>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Preview - Clickable */}
                <div
                  className="w-full md:w-48 h-24 rounded-lg overflow-hidden relative flex-shrink-0 cursor-pointer group"
                  onClick={() => openPreviewModal(banner)}
                  style={!banner.image ? { backgroundColor: banner.backgroundColor || '#1e3a5f' } : undefined}
                >
                  {banner.image ? (
                    <>
                      <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <p
                        className="text-sm font-medium text-center line-clamp-2"
                        style={{ color: banner.textColor || '#ffffff' }}
                      >
                        {banner.title}
                      </p>
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute top-1 left-1">
                    {banner.image ? (
                      <span className="bg-gray-900/70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        이미지
                      </span>
                    ) : (
                      <span className="bg-white/70 text-gray-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Type className="w-3 h-3" />
                        텍스트
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-sm text-gray-500">{banner.subtitle}</p>
                      )}
                      {banner.description && (
                        <p className="text-sm text-gray-400 mt-1">{banner.description}</p>
                      )}
                    </div>
                    <button onClick={() => handleToggleActive(banner)}>
                      {banner.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                          <Eye className="w-3 h-3" />
                          활성
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          <EyeOff className="w-3 h-3" />
                          비활성
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                    {banner.link && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded">
                        <LinkIcon className="w-3 h-3" />
                        {banner.linkText || '링크 있음'}
                      </span>
                    )}
                    {(banner.startDate || banner.endDate) && (
                      <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-1 rounded">
                        <Calendar className="w-3 h-3" />
                        {banner.startDate && new Date(banner.startDate).toLocaleDateString()}
                        {banner.startDate && banner.endDate && ' ~ '}
                        {banner.endDate && new Date(banner.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => openPreviewModal(banner)} title="미리보기">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openModal(banner)} title="수정">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(banner.id, banner.title)}
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={closePreviewModal} />
          <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between z-10">
              <h2 className="text-lg font-bold">배너 미리보기</h2>
              <button onClick={closePreviewModal} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              {/* Live Preview */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">실제 표시 모습</p>
                <div
                  className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden"
                  style={!previewBanner.image ? { backgroundColor: previewBanner.backgroundColor || '#1e3a5f' } : undefined}
                >
                  {previewBanner.image ? (
                    <Image
                      src={previewBanner.image}
                      alt={previewBanner.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center px-6">
                      <div className="text-center max-w-xl">
                        {previewBanner.subtitle && (
                          <p
                            className="text-sm md:text-base font-medium mb-2 opacity-90"
                            style={{ color: previewBanner.textColor || '#ffffff' }}
                          >
                            {previewBanner.subtitle}
                          </p>
                        )}
                        <h2
                          className="text-xl md:text-3xl font-bold mb-2"
                          style={{ color: previewBanner.textColor || '#ffffff' }}
                        >
                          {previewBanner.title}
                        </h2>
                        {previewBanner.description && (
                          <p
                            className="text-sm md:text-base opacity-80"
                            style={{ color: previewBanner.textColor || '#ffffff' }}
                          >
                            {previewBanner.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {previewBanner.link && (
                  <Card className="p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">클릭 링크</p>
                    <a
                      href={previewBanner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-sm break-all"
                    >
                      {previewBanner.link}
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    </a>
                  </Card>
                )}

                {(previewBanner.startDate || previewBanner.endDate) && (
                  <Card className="p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">노출 기간</p>
                    <p className="text-sm text-gray-600">
                      {previewBanner.startDate && new Date(previewBanner.startDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {previewBanner.startDate && previewBanner.endDate && ' ~ '}
                      {previewBanner.endDate && new Date(previewBanner.endDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </Card>
                )}

                <Card className="p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">상태</p>
                  <p className={`text-sm font-semibold ${previewBanner.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {previewBanner.isActive ? '활성화' : '비활성화'}
                  </p>
                </Card>

                <Card className="p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">정렬 순서</p>
                  <p className="text-sm text-gray-600">{previewBanner.sortOrder}</p>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button variant="outline" onClick={closePreviewModal} className="flex-1">
                  닫기
                </Button>
                <Button onClick={() => { closePreviewModal(); openModal(previewBanner); }} className="flex-1">
                  <Pencil className="w-4 h-4 mr-2" />
                  수정하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editingBanner ? '배너 수정' : '배너 등록'}
              </h2>
              <button onClick={closeModal}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Banner Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  배너 유형 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBannerType('text')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      bannerType === 'text'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Type className={`w-6 h-6 mx-auto mb-2 ${bannerType === 'text' ? 'text-primary' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium ${bannerType === 'text' ? 'text-primary' : 'text-gray-600'}`}>
                      텍스트 배너
                    </p>
                    <p className="text-xs text-gray-400 mt-1">배경색 + 텍스트</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerType('image')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      bannerType === 'image'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ImageIcon className={`w-6 h-6 mx-auto mb-2 ${bannerType === 'image' ? 'text-primary' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium ${bannerType === 'image' ? 'text-primary' : 'text-gray-600'}`}>
                      이미지 배너
                    </p>
                    <p className="text-xs text-gray-400 mt-1">이미지 업로드</p>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="예: 12월 특별 프로모션"
                  required
                />
              </div>

              {/* Subtitle - Text type only */}
              {bannerType === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    부제목 (선택)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: 최대 30% 할인"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명 (선택)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                  placeholder="배너에 대한 설명..."
                />
              </div>

              {/* Image Upload - Image type only */}
              {bannerType === 'image' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      배너 이미지 <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      권장: {IMAGE_SIZES.desktop.width} x {IMAGE_SIZES.desktop.height}px
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'image')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    {formData.image && (
                      <div className="mt-2 relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <Image src={formData.image} alt="Preview" fill className="object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      모바일용 이미지 (선택)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      권장: {IMAGE_SIZES.mobile.width} x {IMAGE_SIZES.mobile.height}px
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'mobileImage')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">미설정 시 기본 이미지가 사용됩니다.</p>
                  </div>
                </>
              )}

              {/* Colors - Text type only */}
              {bannerType === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    색상 설정
                  </label>
                  {/* Color Presets */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyColorPreset(preset)}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110"
                        style={{ backgroundColor: preset.bg }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">배경색</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.backgroundColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.backgroundColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">텍스트색</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.textColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.textColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Preview */}
                  <div
                    className="mt-3 p-4 rounded-lg text-center"
                    style={{ backgroundColor: formData.backgroundColor }}
                  >
                    <p className="text-sm font-medium" style={{ color: formData.textColor }}>
                      {formData.subtitle || '부제목 미리보기'}
                    </p>
                    <p className="text-lg font-bold" style={{ color: formData.textColor }}>
                      {formData.title || '제목 미리보기'}
                    </p>
                  </div>
                </div>
              )}

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  클릭 링크 (선택)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="/vehicles 또는 https://..."
                />
              </div>

              {/* Link Text - Text type only */}
              {bannerType === 'text' && formData.link && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    링크 버튼 텍스트 (선택)
                  </label>
                  <input
                    type="text"
                    value={formData.linkText}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="예: 자세히 보기"
                  />
                </div>
              )}

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작일 (선택)
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료일 (선택)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  정렬 순서
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">숫자가 작을수록 먼저 표시됩니다.</p>
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  바로 활성화
                </label>
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                  취소
                </Button>
                <Button type="submit" className="flex-1">
                  {editingBanner ? '수정' : '등록'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
