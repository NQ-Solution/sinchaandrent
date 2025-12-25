'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
}

interface CompanyInfo {
  phone?: string;
  kakaoChannelUrl?: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});

  const phoneNumber = companyInfo.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || '1588-0000';
  const kakaoUrl = companyInfo.kakaoChannelUrl || process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || '#';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [faqRes, companyRes] = await Promise.all([
        fetch('/api/faq'),
        fetch('/api/company-info'),
      ]);
      const faqData = await faqRes.json();
      setFaqs(faqData);
      if (companyRes.ok) {
        const companyData = await companyRes.json();
        setCompanyInfo(companyData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            자주 묻는 질문
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            장기렌트에 대해 자주 묻는 질문들을 모았습니다.
            <br />
            궁금한 내용을 찾아보세요.
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : faqs.length > 0 ? (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.id} className="overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {faq.question}
                      </h3>
                      {openId === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {openId === faq.id && (
                    <div className="px-6 pb-6 pt-0">
                      <div className="border-t pt-4">
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">등록된 FAQ가 없습니다.</p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-md p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              더 궁금한 사항이 있으신가요?
            </h2>
            <p className="text-gray-600 mb-6">
              전문 상담원이 친절하게 안내해드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`tel:${phoneNumber}`}
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                전화 상담하기
              </a>
              <a
                href={kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#FEE500] text-[#000000] px-6 py-3 rounded-lg font-medium hover:bg-[#FEE500]/90 transition-colors"
              >
                카카오톡 상담하기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
