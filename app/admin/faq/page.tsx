'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await fetch('/api/admin/faq');
      if (res.ok) {
        const data = await res.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 FAQ를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/admin/faq/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
        alert('삭제되었습니다.');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const faq = faqs.find((f) => f.id === id);
      if (!faq) return;

      const res = await fetch(`/api/admin/faq/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...faq,
          isActive: !currentActive,
        }),
      });

      if (res.ok) {
        setFaqs((prev) =>
          prev.map((f) => (f.id === id ? { ...f, isActive: !currentActive } : f))
        );
      } else {
        alert('상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const currentFaq = faqs[index];
    const prevFaq = faqs[index - 1];

    try {
      await Promise.all([
        fetch(`/api/admin/faq/${currentFaq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...currentFaq, sortOrder: prevFaq.sortOrder }),
        }),
        fetch(`/api/admin/faq/${prevFaq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...prevFaq, sortOrder: currentFaq.sortOrder }),
        }),
      ]);

      const newFaqs = [...faqs];
      [newFaqs[index - 1], newFaqs[index]] = [newFaqs[index], newFaqs[index - 1]];
      const tempOrder = newFaqs[index - 1].sortOrder;
      newFaqs[index - 1].sortOrder = newFaqs[index].sortOrder;
      newFaqs[index].sortOrder = tempOrder;
      setFaqs(newFaqs);
    } catch (error) {
      console.error('Move error:', error);
      alert('순서 변경에 실패했습니다.');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === faqs.length - 1) return;
    const currentFaq = faqs[index];
    const nextFaq = faqs[index + 1];

    try {
      await Promise.all([
        fetch(`/api/admin/faq/${currentFaq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...currentFaq, sortOrder: nextFaq.sortOrder }),
        }),
        fetch(`/api/admin/faq/${nextFaq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...nextFaq, sortOrder: currentFaq.sortOrder }),
        }),
      ]);

      const newFaqs = [...faqs];
      [newFaqs[index], newFaqs[index + 1]] = [newFaqs[index + 1], newFaqs[index]];
      const tempOrder = newFaqs[index].sortOrder;
      newFaqs[index].sortOrder = newFaqs[index + 1].sortOrder;
      newFaqs[index + 1].sortOrder = tempOrder;
      setFaqs(newFaqs);
    } catch (error) {
      console.error('Move error:', error);
      alert('순서 변경에 실패했습니다.');
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ 관리</h1>
          <p className="text-gray-500 mt-1">상담안내 페이지에 표시되는 자주 묻는 질문을 관리합니다.</p>
        </div>
        <Button asChild>
          <Link href="/admin/faq/new" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            FAQ 등록
          </Link>
        </Button>
      </div>

      {faqs.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">등록된 FAQ가 없습니다.</p>
          <Button asChild>
            <Link href="/admin/faq/new">첫 FAQ 등록하기</Link>
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={`p-4 ${!faq.isActive ? 'bg-gray-50 opacity-60' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-lg font-bold text-gray-400 w-6 flex-shrink-0">
                    {faq.sortOrder}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-primary">Q.</span>
                      <p className="font-medium text-gray-900">{faq.question}</p>
                    </div>
                    <div className="flex items-start gap-2 pl-0">
                      <span className="font-medium text-gray-400">A.</span>
                      <p className="text-gray-600 text-sm line-clamp-2">{faq.answer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(faq.id, faq.isActive)}
                      className="transition-all"
                    >
                      {faq.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full hover:bg-green-100">
                          <Eye className="w-3 h-3" />
                          공개
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200">
                          <EyeOff className="w-3 h-3" />
                          비공개
                        </span>
                      )}
                    </button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={index === faqs.length - 1}
                        onClick={() => handleMoveDown(index)}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/faq/${faq.id}/edit`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(faq.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
