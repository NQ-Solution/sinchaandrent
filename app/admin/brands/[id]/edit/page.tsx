'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { Brand } from '@/types';

export default function EditBrandPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nameKr: '',
    nameEn: '',
    isDomestic: true,
    isActive: true,
    sortOrder: 999,
  });

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

      <h1 className="text-2xl font-bold text-gray-900 mb-8">브랜드 수정</h1>

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
    </div>
  );
}
