'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
}

// 기본 FAQ 데이터 (API 실패 시 fallback)
const DEFAULT_FAQ_DATA: FAQItem[] = [
  {
    question: '장기렌트와 리스의 차이점은 무엇인가요?',
    answer: '장기렌트는 렌트사 소유 차량을 빌려 사용하는 방식으로, 보험료/자동차세/정비비가 모두 월 렌트료에 포함됩니다. 리스는 금융사가 차량을 구매하고 사용자가 이용료를 내는 방식으로, 보험/정비는 별도 부담입니다.',
    category: '기본 정보',
  },
  {
    question: '초기비용이 정말 0원인가요?',
    answer: '네, 맞습니다. 신차 구매 시 필요한 취득세, 등록세, 공채비용, 번호판 비용 등 초기비용이 전혀 없습니다.',
    category: '비용',
  },
  {
    question: '신용등급에 영향이 있나요?',
    answer: '장기렌트는 대출이 아니기 때문에 신용등급에 영향을 주지 않습니다.',
    category: '신용',
  },
];

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQ_DATA);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const res = await fetch('/api/faq');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setFaqs(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
        // 에러 시 기본 데이터 유지
      } finally {
        setLoading(false);
      }
    }
    fetchFaqs();
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-bold text-sm tracking-wider">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
            자주 묻는 질문
          </h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            장기렌트에 대해 궁금하신 점을 확인해보세요. 더 궁금한 점은 상담을 통해 안내받으실 수 있습니다.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id || index}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openIndex === index ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="px-6 pb-5">
                      <div className="pl-12">
                        {faq.category && (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full mb-2">
                            {faq.category}
                          </span>
                        )}
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
