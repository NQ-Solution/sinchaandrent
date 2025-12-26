'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Link2, X, Plus, Loader2, Settings2 } from 'lucide-react';
import { Button } from './Button';

// 사이즈 프리셋 (서버와 동일하게 유지)
const SIZE_PRESETS = {
  vehicle: { label: '800x500', description: '권장' },
  vehicleHD: { label: '1200x750', description: '고화질' },
  banner: { label: '1920x600', description: '배너용' },
  original: { label: '원본', description: '' },
} as const;

type SizePreset = keyof typeof SIZE_PRESETS;

// 패딩 옵션
const PADDING_OPTIONS = [
  { value: 0, label: '없음' },
  { value: 5, label: '5%' },
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 20, label: '20%' },
];

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  type?: 'thumbnail' | 'image';
  hint?: string;
  showSizeSelector?: boolean;
  sizePreset?: SizePreset;
  padding?: number;
  onSettingsChange?: (settings: { sizePreset: SizePreset; padding: number }) => void;
}

export function ImageUpload({
  label,
  value,
  onChange,
  type = 'image',
  hint,
  showSizeSelector = false,
  sizePreset = 'vehicle',
  padding = 0,
  onSettingsChange,
}: ImageUploadProps) {
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<SizePreset>(sizePreset);
  const [selectedPadding, setSelectedPadding] = useState(padding);
  const [showSizeOptions, setShowSizeOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 외부 props가 변경되면 내부 state 업데이트
  useEffect(() => {
    setSelectedSize(sizePreset);
  }, [sizePreset]);

  useEffect(() => {
    setSelectedPadding(padding);
  }, [padding]);

  // 설정 변경 시 부모에 알림
  const handleSizeChange = (newSize: SizePreset) => {
    setSelectedSize(newSize);
    onSettingsChange?.({ sizePreset: newSize, padding: selectedPadding });
  };

  const handlePaddingChange = (newPadding: number) => {
    setSelectedPadding(newPadding);
    onSettingsChange?.({ sizePreset: selectedSize, padding: newPadding });
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (showSizeSelector && type !== 'thumbnail') {
        formData.append('sizePreset', selectedSize);
        formData.append('padding', selectedPadding.toString());
      }

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        if (res.status === 401) {
          throw new Error('로그인이 필요합니다.');
        }
        throw new Error(error.error || 'Upload failed');
      }

      const data = await res.json();
      onChange(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      const message = error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.';
      alert(message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 기존 이미지 재처리
  const handleReprocess = async () => {
    if (!value || !value.startsWith('data:image')) {
      alert('재처리할 수 없는 이미지입니다.');
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: value,
          sizePreset: selectedSize,
          padding: selectedPadding,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Reprocess failed');
      }

      const data = await res.json();
      onChange(data.url);
      setShowSizeOptions(false);
    } catch (error) {
      console.error('Reprocess error:', error);
      alert('이미지 재처리에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Mode Toggle */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all ${
            mode === 'file'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          파일 업로드
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all ${
            mode === 'url'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Link2 className="w-4 h-4" />
          URL 입력
        </button>

        {/* Size & Padding Selector */}
        {showSizeSelector && type !== 'thumbnail' && (
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setShowSizeOptions(!showSizeOptions)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-blue-200"
            >
              <Settings2 className="w-4 h-4" />
              {SIZE_PRESETS[selectedSize].label}
              {selectedPadding > 0 && <span className="text-blue-400">+{selectedPadding}%</span>}
            </button>

            {showSizeOptions && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSizeOptions(false)}
                />
                <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border rounded-xl shadow-2xl z-50 w-[320px] max-h-[90vh] overflow-y-auto">
                  {/* 헤더 */}
                  <div className="p-4 border-b bg-gray-50 rounded-t-xl">
                    <h3 className="font-semibold text-gray-900">이미지 설정</h3>
                    <p className="text-xs text-gray-500 mt-0.5">업로드할 이미지의 크기와 여백을 설정합니다</p>
                  </div>

                  {/* 사이즈 선택 */}
                  <div className="p-4 border-b">
                    <p className="text-xs font-medium text-gray-500 mb-2">이미지 크기</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(SIZE_PRESETS) as SizePreset[]).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSizeChange(key)}
                          className={`px-3 py-2 text-sm rounded-lg transition-all ${
                            selectedSize === key
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {SIZE_PRESETS[key].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 여백 선택 */}
                  <div className="p-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">여백 (축소)</p>
                    <div className="flex gap-1.5">
                      {PADDING_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handlePaddingChange(opt.value)}
                          className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                            selectedPadding === opt.value
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {selectedPadding > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        이미지 주변에 {selectedPadding}% 흰색 여백이 추가됩니다
                      </p>
                    )}
                  </div>

                  {/* 미리보기 */}
                  {value && (
                    <div className="p-4 border-t bg-gray-50">
                      <p className="text-xs font-medium text-gray-500 mb-2">현재 이미지 미리보기</p>
                      <div
                        className="relative bg-gray-100 rounded-lg overflow-hidden mx-auto"
                        style={{
                          width: '200px',
                          height: '125px',
                        }}
                      >
                        <div
                          className="absolute bg-white"
                          style={{
                            top: `${selectedPadding}%`,
                            left: `${selectedPadding}%`,
                            right: `${selectedPadding}%`,
                            bottom: `${selectedPadding}%`,
                          }}
                        >
                          <Image
                            src={value}
                            alt="Preview"
                            fill
                            className="object-contain"
                          />
                        </div>
                        {selectedPadding > 0 && (
                          <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-blue-300 opacity-50"
                            style={{
                              top: `${selectedPadding}%`,
                              left: `${selectedPadding}%`,
                              right: `${selectedPadding}%`,
                              bottom: `${selectedPadding}%`,
                            }}
                          />
                        )}
                      </div>
                      <p className="text-[10px] text-center text-gray-400 mt-1">
                        새 이미지 업로드 시 설정이 적용됩니다
                      </p>
                    </div>
                  )}

                  {/* 적용 버튼 */}
                  <div className="p-4 border-t space-y-2">
                    {value && value.startsWith('data:image') && (
                      <button
                        type="button"
                        onClick={handleReprocess}
                        disabled={uploading}
                        className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            처리 중...
                          </>
                        ) : (
                          '설정 적용하기'
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowSizeOptions(false)}
                      className={`w-full py-2.5 text-sm font-medium rounded-lg ${
                        value ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-primary text-white hover:bg-primary/90'
                      }`}
                    >
                      {value ? '닫기' : '설정 완료'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Preview or Upload Area */}
      {value ? (
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="relative w-40 h-28 rounded-lg overflow-hidden border-2 border-gray-200 bg-white">
              <Image
                src={value}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 이미지 설정 버튼 (업로드 후) */}
          {showSizeSelector && type !== 'thumbnail' && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowSizeOptions(true)}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-blue-200 disabled:opacity-50"
              >
                <Settings2 className="w-4 h-4" />
                이미지 조정
              </button>
              <p className="text-xs text-gray-400">
                {SIZE_PRESETS[selectedSize].label}
                {selectedPadding > 0 && ` / 여백 ${selectedPadding}%`}
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {mode === 'file' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                uploading
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary hover:bg-gray-50'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                  <p className="text-sm text-gray-600">업로드 중...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">클릭하여 이미지 업로드</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (최대 5MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
              />
              <Button type="button" onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                적용
              </Button>
            </div>
          )}
        </>
      )}

      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

interface MultiImageUploadProps {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  hint?: string;
  showSizeSelector?: boolean;
  sizePreset?: SizePreset;
  padding?: number;
  onSettingsChange?: (settings: { sizePreset: SizePreset; padding: number }) => void;
}

export function MultiImageUpload({
  label,
  values,
  onChange,
  maxImages = 10,
  hint,
  showSizeSelector = false,
  sizePreset = 'vehicle',
  padding = 0,
  onSettingsChange,
}: MultiImageUploadProps) {
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [reprocessingIndex, setReprocessingIndex] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizePreset>(sizePreset);
  const [selectedPadding, setSelectedPadding] = useState(padding);
  const [showSizeOptions, setShowSizeOptions] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 외부 props가 변경되면 내부 state 업데이트
  useEffect(() => {
    setSelectedSize(sizePreset);
  }, [sizePreset]);

  useEffect(() => {
    setSelectedPadding(padding);
  }, [padding]);

  // 설정 변경 시 부모에 알림
  const handleSizeChange = (newSize: SizePreset) => {
    setSelectedSize(newSize);
    onSettingsChange?.({ sizePreset: newSize, padding: selectedPadding });
  };

  const handlePaddingChange = (newPadding: number) => {
    setSelectedPadding(newPadding);
    onSettingsChange?.({ sizePreset: selectedSize, padding: newPadding });
  };

  const handleFileUpload = async (file: File) => {
    if (values.length >= maxImages) {
      alert(`최대 ${maxImages}개까지 업로드 가능합니다.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');
      if (showSizeSelector) {
        formData.append('sizePreset', selectedSize);
        formData.append('padding', selectedPadding.toString());
      }

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        if (res.status === 401) {
          throw new Error('로그인이 필요합니다.');
        }
        throw new Error(error.error || 'Upload failed');
      }

      const data = await res.json();
      onChange([...values, data.url]);
    } catch (error) {
      console.error('Upload error:', error);
      const message = error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.';
      alert(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim() && values.length < maxImages) {
      onChange([...values, urlInput.trim()]);
      setUrlInput('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  // 개별 이미지 재처리
  const handleReprocessImage = async (index: number) => {
    const imageUrl = values[index];
    if (!imageUrl || !imageUrl.startsWith('data:image')) {
      alert('재처리할 수 없는 이미지입니다.');
      return;
    }

    setReprocessingIndex(index);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          sizePreset: selectedSize,
          padding: selectedPadding,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Reprocess failed');
      }

      const data = await res.json();
      const newValues = [...values];
      newValues[index] = data.url;
      onChange(newValues);
      setEditingIndex(null);
      setShowSizeOptions(false);
    } catch (error) {
      console.error('Reprocess error:', error);
      alert('이미지 재처리에 실패했습니다.');
    } finally {
      setReprocessingIndex(null);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} ({values.length}/{maxImages})
      </label>

      {/* Mode Toggle & Size Selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all ${
            mode === 'file'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          파일 업로드
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all ${
            mode === 'url'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Link2 className="w-4 h-4" />
          URL 입력
        </button>

        {/* Size & Padding Selector */}
        {showSizeSelector && (
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => {
                setEditingIndex(null);
                setShowSizeOptions(!showSizeOptions);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-blue-200"
            >
              <Settings2 className="w-4 h-4" />
              {SIZE_PRESETS[selectedSize].label}
              {selectedPadding > 0 && <span className="text-blue-400">+{selectedPadding}%</span>}
            </button>

            {showSizeOptions && editingIndex === null && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSizeOptions(false)}
                />
                <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border rounded-xl shadow-2xl z-50 w-[320px] max-h-[90vh] overflow-y-auto">
                  {/* 헤더 */}
                  <div className="p-4 border-b bg-gray-50 rounded-t-xl">
                    <h3 className="font-semibold text-gray-900">이미지 설정</h3>
                    <p className="text-xs text-gray-500 mt-0.5">새로 업로드할 이미지에 적용됩니다</p>
                  </div>

                  {/* 사이즈 선택 */}
                  <div className="p-4 border-b">
                    <p className="text-xs font-medium text-gray-500 mb-2">이미지 크기</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(SIZE_PRESETS) as SizePreset[]).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSizeChange(key)}
                          className={`px-3 py-2 text-sm rounded-lg transition-all ${
                            selectedSize === key
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {SIZE_PRESETS[key].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 여백 선택 */}
                  <div className="p-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">여백 (축소)</p>
                    <div className="flex gap-1.5">
                      {PADDING_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handlePaddingChange(opt.value)}
                          className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                            selectedPadding === opt.value
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {selectedPadding > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        이미지 주변에 {selectedPadding}% 흰색 여백이 추가됩니다
                      </p>
                    )}
                  </div>

                  <div className="p-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowSizeOptions(false)}
                      className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"
                    >
                      설정 완료
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Images Grid */}
      <div className="flex flex-wrap gap-3">
        {values.map((url, index) => (
          <div key={index} className="relative group">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 bg-white">
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-contain"
              />
              {reprocessingIndex === index && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
            {/* 개별 이미지 조정 버튼 */}
            {showSizeSelector && url.startsWith('data:image') && (
              <button
                type="button"
                onClick={() => {
                  setEditingIndex(index);
                  setShowSizeOptions(true);
                }}
                className="absolute -bottom-2 -right-2 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                title="이미지 조정"
              >
                <Settings2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}

        {/* Add Button */}
        {values.length < maxImages && (
          <>
            {mode === 'file' ? (
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                  uploading
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                }`}
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">추가</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* 개별 이미지 조정 모달 */}
      {showSizeSelector && showSizeOptions && editingIndex !== null && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowSizeOptions(false);
              setEditingIndex(null);
            }}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border rounded-xl shadow-2xl z-50 w-[320px] max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="p-4 border-b bg-gray-50 rounded-t-xl">
              <h3 className="font-semibold text-gray-900">이미지 조정</h3>
              <p className="text-xs text-gray-500 mt-0.5">이미지 #{editingIndex + 1} 설정 변경</p>
            </div>

            {/* 미리보기 */}
            <div className="p-4 border-b">
              <p className="text-xs font-medium text-gray-500 mb-2">현재 이미지</p>
              <div className="relative w-full aspect-[16/10] bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="absolute bg-white"
                  style={{
                    top: `${selectedPadding}%`,
                    left: `${selectedPadding}%`,
                    right: `${selectedPadding}%`,
                    bottom: `${selectedPadding}%`,
                  }}
                >
                  <Image
                    src={values[editingIndex]}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* 사이즈 선택 */}
            <div className="p-4 border-b">
              <p className="text-xs font-medium text-gray-500 mb-2">이미지 크기</p>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(SIZE_PRESETS) as SizePreset[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedSize(key)}
                    className={`px-3 py-2 text-sm rounded-lg transition-all ${
                      selectedSize === key
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {SIZE_PRESETS[key].label}
                  </button>
                ))}
              </div>
            </div>

            {/* 여백 선택 */}
            <div className="p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">여백 (축소)</p>
              <div className="flex gap-1.5">
                {PADDING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedPadding(opt.value)}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                      selectedPadding === opt.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 버튼 */}
            <div className="p-4 border-t space-y-2">
              <button
                type="button"
                onClick={() => handleReprocessImage(editingIndex)}
                disabled={reprocessingIndex !== null}
                className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {reprocessingIndex === editingIndex ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  '설정 적용하기'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSizeOptions(false);
                  setEditingIndex(null);
                }}
                className="w-full py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
            </div>
          </div>
        </>
      )}

      {/* URL Input (when in URL mode) */}
      {mode === 'url' && values.length < maxImages && (
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
          />
          <Button type="button" onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
            추가
          </Button>
        </div>
      )}

      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
