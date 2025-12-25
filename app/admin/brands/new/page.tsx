'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function NewBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nameKr: '',
    nameEn: '',
    isDomestic: true,
    isActive: true,
    sortOrder: 999,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sortOrder: parseInt(formData.sortOrder.toString()) || 999,
        }),
      });

      if (res.ok) {
        router.push('/admin/brands');
        router.refresh();
      } else {
        alert('브랜드 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link
        href="/admin/brands"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        브랜드 목록
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">브랜드 등록</h1>

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
          <Button type="submit" disabled={loading}>
            {loading ? '등록 중...' : '브랜드 등록'}
          </Button>
        </div>
      </form>
    </div>
  );
}
