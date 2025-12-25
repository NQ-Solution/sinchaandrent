'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export default function EditFAQPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    sortOrder: '',
    isActive: true,
  });

  useEffect(() => {
    async function fetchFAQ() {
      try {
        const res = await fetch(`/api/admin/faq/${params.id}`);
        if (!res.ok) {
          alert('FAQ를 찾을 수 없습니다.');
          router.push('/admin/faq');
          return;
        }
        const data: FAQ = await res.json();
        setFormData({
          question: data.question,
          answer: data.answer,
          sortOrder: data.sortOrder.toString(),
          isActive: data.isActive,
        });
      } catch (error) {
        console.error('Failed to fetch FAQ:', error);
        alert('FAQ를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchFAQ();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/faq/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: formData.question,
          answer: formData.answer,
          sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : 999,
          isActive: formData.isActive,
        }),
      });

      if (res.ok) {
        alert('저장되었습니다.');
        router.push('/admin/faq');
        router.refresh();
      } else {
        alert('저장에 실패했습니다.');
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
        href="/admin/faq"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        FAQ 목록
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">FAQ 수정</h1>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>FAQ 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="question"
              label="질문 *"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="예: 장기렌트와 리스의 차이점은 무엇인가요?"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                답변 *
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="답변 내용을 입력해주세요"
                rows={5}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            <Input
              id="sortOrder"
              label="정렬 순서"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
              placeholder="낮은 숫자가 먼저 표시됩니다"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-gray-700">
                공개 (체크 해제 시 사용자에게 표시되지 않음)
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-8">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? '저장 중...' : '변경사항 저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}
