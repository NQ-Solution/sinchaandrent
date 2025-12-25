'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: '장기렌트와 리스의 차이점은 무엇인가요?',
    answer: '장기렌트는 렌트사 소유 차량을 빌려 사용하는 방식으로, 보험료/자동차세/정비비가 모두 월 렌트료에 포함됩니다. 리스는 금융사가 차량을 구매하고 사용자가 이용료를 내는 방식으로, 보험/정비는 별도 부담입니다. 장기렌트는 번호판이 "허, 하, 호"이고, 리스는 일반 번호판입니다.',
    category: '기본 정보',
  },
  {
    question: '장기렌트 계약 기간은 어떻게 되나요?',
    answer: '일반적으로 12개월, 24개월, 36개월, 48개월, 60개월 계약이 가능합니다. 계약 기간이 길수록 월 렌트료가 낮아지며, 가장 인기있는 계약 기간은 48개월과 60개월입니다.',
    category: '계약 조건',
  },
  {
    question: '초기비용이 정말 0원인가요?',
    answer: '네, 맞습니다. 신차 구매 시 필요한 취득세, 등록세, 공채비용, 번호판 비용 등 초기비용이 전혀 없습니다. 보증금과 선납금 없이 월 렌트료만으로 새 차를 이용하실 수 있습니다. 다만, 보증금/선납금을 납부하시면 월 렌트료를 낮출 수 있습니다.',
    category: '비용',
  },
  {
    question: '사고가 나면 어떻게 되나요?',
    answer: '사고 발생 시 렌트사 고객센터로 연락하시면 사고 처리를 지원해드립니다. 보험 처리는 렌트료에 포함된 자동차보험으로 진행되며, 사고로 인한 수리비는 보험사에서 처리합니다. 본인 과실 사고의 경우 자기부담금이 발생할 수 있습니다.',
    category: '사고/보험',
  },
  {
    question: '신용등급에 영향이 있나요?',
    answer: '장기렌트는 대출이 아니기 때문에 신용등급에 영향을 주지 않습니다. 할부 구매나 리스와 달리 부채로 잡히지 않아, 추후 주택담보대출이나 신용대출 시에도 불이익이 없습니다.',
    category: '신용',
  },
  {
    question: '중도해지가 가능한가요?',
    answer: '계약 기간 중 중도해지는 가능하지만, 위약금이 발생합니다. 위약금은 잔여 계약기간과 차량 상태에 따라 달라지며, 일반적으로 잔여 렌트료의 일정 비율입니다. 차량 승계(명의 이전)를 통해 위약금 없이 계약을 종료할 수도 있습니다.',
    category: '계약 조건',
  },
  {
    question: '계약 만료 후에는 어떻게 되나요?',
    answer: '계약 만료 시 세 가지 선택이 가능합니다. 1) 차량 반납: 반납 후 새 차량으로 재계약 가능 2) 차량 인수: 잔존가치를 지불하고 본인 소유로 인수 3) 계약 연장: 동일 차량으로 재계약 가능합니다.',
    category: '계약 조건',
  },
  {
    question: '어떤 차량이든 렌트 가능한가요?',
    answer: '국산차(현대, 기아, 제네시스, 쉐보레, 르노코리아, KG모빌리티 등)는 대부분 렌트 가능합니다. 수입차도 BMW, 벤츠, 아우디 등 주요 브랜드는 렌트가 가능하며, 일부 모델은 제한될 수 있습니다. 원하시는 차량을 상담 시 말씀해주세요.',
    category: '차량',
  },
  {
    question: '주행거리 제한이 있나요?',
    answer: '네, 계약 시 연간 주행거리를 선택합니다 (1만km, 2만km, 3만km 등). 선택한 주행거리가 많을수록 월 렌트료가 높아집니다. 계약 주행거리를 초과할 경우 km당 추가 요금이 발생하므로, 예상 주행거리에 맞게 선택하시는 것이 좋습니다.',
    category: '계약 조건',
  },
  {
    question: '심사는 어떻게 진행되나요?',
    answer: '간단한 서류(신분증, 운전면허증)로 당일 심사가 가능합니다. 신용등급, 소득, 기존 대출 현황 등을 종합적으로 심사하며, 대부분 1~2시간 내 결과를 알려드립니다. 신용등급이 낮더라도 조건에 따라 심사 가능하니 먼저 상담받아보세요.',
    category: '심사',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
          <div className="space-y-3">
            {FAQ_DATA.map((faq, index) => (
              <div
                key={index}
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
        </div>
      </div>
    </section>
  );
}
