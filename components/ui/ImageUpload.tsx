'use client';

import { useState, useRef } from 'react';
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
  defaultSize?: SizePreset;
}

export function ImageUpload({
  label,
  value,
  onChange,
  type = 'image',
  hint,
  showSizeSelector = false,
  defaultSize = 'vehicle'
}: ImageUploadProps) {
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<SizePreset>(defaultSize);
  const [selectedPadding, setSelectedPadding] = useState(0);
  const [showSizeOptions, setShowSizeOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSizeOptions(false)}
                />
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[260px]">
                  {/* 사이즈 선택 */}
                  <div className="p-3 border-b">
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
                  <div className="p-3">
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
                    {selectedPadding > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        이미지 주변에 {selectedPadding}% 흰색 여백이 추가됩니다
                      </p>
                    )}
                  </div>

                  {/* 적용 버튼 */}
                  <div className="p-3 border-t bg-gray-50">
                    <button
                      type="button"
                      onClick={() => setShowSizeOptions(false)}
                      className="w-full py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"
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

      {/* Preview or Upload Area */}
      {value ? (
        <div className="relative inline-block">
          <div className="relative w-40 h-28 rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
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
}

export function MultiImageUpload({ label, values, onChange, maxImages = 10, hint }: MultiImageUploadProps) {
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} ({values.length}/{maxImages})
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
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
      </div>

      {/* Images Grid */}
      <div className="flex flex-wrap gap-3">
        {values.map((url, index) => (
          <div key={index} className="relative">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
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
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : null}
          </>
        )}
      </div>

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
