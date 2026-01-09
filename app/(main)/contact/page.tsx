'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Phone, Clock, MessageSquare, CheckCircle, Car,
  MapPin, FileText, CreditCard,
  ArrowRight, Building2, PhoneCall, Navigation,
  ClipboardCheck, AlertCircle, Sparkles, Timer, BadgeCheck, Download, Eye,
  Youtube, BookOpen
} from 'lucide-react';
import { KakaoIcon } from '@/components/icons/KakaoIcon';
import Image from 'next/image';

interface CompanyInfo {
  companyName?: string;
  ceoName?: string;
  businessNumber?: string;
  loanBrokerNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  faxNumber?: string;
  privacyOfficer?: string;
  loanBrokerPdf?: string;
  loanBrokerImage?: string;
  kakaoChannelUrl?: string;
  youtubeUrl?: string;
  blogUrl?: string;
}

// 실시간 상담 가능 여부 확인
function useConsultationStatus() {
  const [status, setStatus] = useState<'open' | 'closed' | 'lunch'>('closed');
  const [nextOpenTime, setNextOpenTime] = useState<string>('');

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours * 60 + minutes;

      // 주말
      if (day === 0 || day === 6) {
        setStatus('closed');
        setNextOpenTime('월요일 09:00');
        return;
      }

      // 점심시간 (12:00 - 13:00)
      if (currentTime >= 720 && currentTime < 780) {
        setStatus('lunch');
        setNextOpenTime('13:00');
        return;
      }

      // 영업시간 (09:00 - 18:00)
      if (currentTime >= 540 && currentTime < 1080) {
        setStatus('open');
        setNextOpenTime('');
        return;
      }

      // 영업시간 외
      setStatus('closed');
      if (currentTime < 540) {
        setNextOpenTime('오늘 09:00');
      } else {
        setNextOpenTime('내일 09:00');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // 1분마다 체크
    return () => clearInterval(interval);
  }, []);

  return { status, nextOpenTime };
}

export default function ContactPage() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});
  const [showCertificate, setShowCertificate] = useState(false);

  const phoneNumber = companyInfo.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || '1588-0000';
  const kakaoUrl = companyInfo.kakaoChannelUrl || process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || '';
  const youtubeUrl = companyInfo.youtubeUrl || process.env.NEXT_PUBLIC_YOUTUBE_URL || '';
  const blogUrl = companyInfo.blogUrl || '';

  const { status, nextOpenTime } = useConsultationStatus();
  const [selectedConsultType, setSelectedConsultType] = useState<'phone' | 'kakao' | 'visit' | null>(null);

  useEffect(() => {
    async function fetchCompanyInfo() {
      try {
        const res = await fetch('/api/company-info');
        if (res.ok) {
          const data = await res.json();
          setCompanyInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch company info:', error);
      }
    }
    fetchCompanyInfo();
  }, []);

  const handlePdfDownload = () => {
    if (companyInfo.loanBrokerPdf) {
      const link = document.createElement('a');
      link.href = companyInfo.loanBrokerPdf;
      link.download = '대출모집법인등록증.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImageDownload = () => {
    if (companyInfo.loanBrokerImage) {
      const link = document.createElement('a');
      link.href = companyInfo.loanBrokerImage;
      link.download = '대출모집법인등록증.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const statusConfig = {
    open: {
      label: '상담 가능',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      message: '지금 바로 상담받으실 수 있습니다',
    },
    lunch: {
      label: '점심시간',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      message: `${nextOpenTime}부터 상담 가능합니다`,
    },
    closed: {
      label: '상담 마감',
      color: 'bg-gray-400',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      message: `${nextOpenTime}부터 상담 가능합니다`,
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero - 실시간 상담 가능 여부 강조 */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] bg-gradient-to-br from-gray-900 via-gray-800 to-primary flex items-center overflow-hidden py-12 sm:py-0">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 sm:left-20 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* 실시간 상담 가능 여부 배지 */}
            <div className={`inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 ${currentStatus.bgColor} ${currentStatus.borderColor} border backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-3 rounded-full mb-6 sm:mb-8`}>
              <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentStatus.color} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 ${currentStatus.color}`}></span>
              </span>
              <span className={`font-bold text-sm sm:text-base ${currentStatus.textColor}`}>{currentStatus.label}</span>
              <span className="text-gray-600 text-xs sm:text-sm">{currentStatus.message}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight break-keep">
              어떤 방식으로
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-blue-400">
                상담받으시겠어요?
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300 mb-8 sm:mb-10 max-w-xl mx-auto px-2 break-keep">
              전화, 카카오톡, 방문 중 편하신 방법을 선택하세요.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>전문 상담원이 친절하게 안내해드립니다.
            </p>

            {/* 빠른 연락 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0">
              <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-6 sm:px-8 font-bold h-12 sm:h-14 text-sm sm:text-base">
                <a href={`tel:${phoneNumber}`} className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  지금 전화하기
                </a>
              </Button>
              {kakaoUrl && (
                <Button asChild size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 rounded-full px-6 sm:px-8 font-bold h-12 sm:h-14 text-sm sm:text-base">
                  <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    <KakaoIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    카카오톡 상담
                  </a>
                </Button>
              )}
            </div>

            {/* 스크롤 안내 */}
            <div className="mt-8 sm:mt-12 text-gray-400 text-xs sm:text-sm flex items-center justify-center gap-2">
              <span>아래에서 상담 유형을 선택하세요</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 animate-bounce rotate-90" />
            </div>
          </div>
        </div>
      </section>

      {/* 상담 유형 선택 - 인터랙티브 카드 */}
      <section className="py-12 sm:py-16 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <span className="text-primary font-bold text-xs sm:text-sm tracking-wider">CHOOSE YOUR WAY</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mt-1 sm:mt-2">
              상담 방법 선택
            </h2>
            <p className="text-gray-500 mt-2 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base">
              고객님의 상황에 맞는 상담 방법을 선택하세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* 전화 상담 */}
            <div
              className={`relative group cursor-pointer transition-all duration-300 ${
                selectedConsultType === 'phone' ? 'scale-105' : 'hover:scale-102'
              }`}
              onClick={() => setSelectedConsultType('phone')}
            >
              <div className={`bg-white rounded-3xl p-8 border-2 transition-all ${
                selectedConsultType === 'phone'
                  ? 'border-primary shadow-xl shadow-primary/20'
                  : 'border-gray-100 hover:border-primary/50 hover:shadow-lg'
              }`}>
                {selectedConsultType === 'phone' && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}

                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center mb-6">
                  <PhoneCall className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">전화 상담</h3>
                <p className="text-gray-500 text-sm mb-6">
                  가장 빠르고 정확한 상담 방법입니다.
                  궁금한 점을 바로 해결해드립니다.
                </p>

                <div className="space-y-2 mb-6">
                  {['즉시 상담 가능', '상세한 조건 안내', '맞춤 견적 제공'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-2xl font-black text-primary">{phoneNumber}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(phoneNumber);
                        alert('전화번호가 복사되었습니다');
                      }}
                      className="text-gray-400 hover:text-primary transition-colors"
                      title="전화번호 복사"
                    >
                      <ClipboardCheck className="w-5 h-5" />
                    </button>
                  </div>
                  <Button asChild className="w-full rounded-full">
                    <a href={`tel:${phoneNumber}`} className="flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      전화하기
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* 카카오톡 상담 */}
            <div
              className={`relative group cursor-pointer transition-all duration-300 ${
                selectedConsultType === 'kakao' ? 'scale-105' : 'hover:scale-102'
              }`}
              onClick={() => setSelectedConsultType('kakao')}
            >
              <div className={`bg-white rounded-3xl p-8 border-2 transition-all ${
                selectedConsultType === 'kakao'
                  ? 'border-yellow-400 shadow-xl shadow-yellow-400/20'
                  : 'border-gray-100 hover:border-yellow-400/50 hover:shadow-lg'
              }`}>
                {selectedConsultType === 'kakao' && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-gray-900" />
                  </div>
                )}

                <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mb-6">
                  <KakaoIcon className="w-8 h-8 text-gray-900" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">카카오톡 상담</h3>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                    24시간 접수
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-6">
                  편하게 문의하고, 답변을 기다리세요.
                  사진/서류 전송도 가능합니다.
                </p>

                <div className="space-y-2 mb-6">
                  {['24시간 문의 접수', '사진/서류 전송 가능', '대화 내역 저장'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-yellow-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">신차앤렌트 카카오톡 채널</p>
                  <Button asChild className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-300 rounded-full">
                    <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      <KakaoIcon className="w-4 h-4" />
                      카카오톡 열기
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* 방문 상담 */}
            <div
              className={`relative group cursor-pointer transition-all duration-300 ${
                selectedConsultType === 'visit' ? 'scale-105' : 'hover:scale-102'
              }`}
              onClick={() => setSelectedConsultType('visit')}
            >
              <div className={`bg-white rounded-3xl p-8 border-2 transition-all ${
                selectedConsultType === 'visit'
                  ? 'border-gray-900 shadow-xl shadow-gray-900/20'
                  : 'border-gray-100 hover:border-gray-400 hover:shadow-lg'
              }`}>
                {selectedConsultType === 'visit' && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}

                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mb-6">
                  <Building2 className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">방문 상담</h3>
                <p className="text-gray-500 text-sm mb-6">
                  직접 방문하여 실물 차량 확인과
                  상세한 상담을 받으실 수 있습니다.
                </p>

                <div className="space-y-2 mb-6">
                  {['실물 차량 확인 가능', '대면 상세 상담', '당일 계약 가능'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-gray-700" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">방문 전 전화예약 권장</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const address = companyInfo.address || '서울특별시 강남구 테헤란로 123';
                        navigator.clipboard.writeText(address);
                        alert('주소가 복사되었습니다');
                      }}
                      className="text-gray-400 hover:text-gray-900 transition-colors"
                      title="주소 복사"
                    >
                      <ClipboardCheck className="w-5 h-5" />
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    위치 안내 보기
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* SNS 채널 안내 - 유튜브와 블로그만 */}
          {(youtubeUrl || blogUrl) && (
            <div className="mt-12 max-w-3xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">다양한 채널에서 만나보세요</h3>
                <p className="text-gray-500 text-sm mt-1">유튜브, 블로그에서 더 많은 정보를 확인하세요</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {/* 유튜브 채널 */}
                {youtubeUrl && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-5 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center">
                      <Youtube className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">유튜브 채널</h4>
                      <p className="text-gray-600 text-sm">차량 정보 영상으로 확인</p>
                    </div>
                    <Button asChild className="bg-red-600 hover:bg-red-700 rounded-full w-full">
                      <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        <Youtube className="w-4 h-4" />
                        채널 방문
                      </a>
                    </Button>
                  </div>
                )}

                {/* 블로그 */}
                {blogUrl && (
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-5 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">블로그</h4>
                      <p className="text-gray-600 text-sm">렌트 정보 & 후기</p>
                    </div>
                    <Button asChild className="bg-green-500 hover:bg-green-600 rounded-full w-full">
                      <a href={blogUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        블로그 방문
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 상담 전 체크리스트 */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-bold text-sm tracking-wider">BEFORE CONSULTATION</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
              상담 전 체크리스트
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              아래 사항들을 미리 준비하시면 더 빠르고 정확한 상담이 가능합니다
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 필수 준비물 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">필수 준비물</h3>
                    <p className="text-sm text-gray-500">심사 시 반드시 필요합니다</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: FileText, text: '신분증 (주민등록증/운전면허증)' },
                    { icon: CreditCard, text: '운전면허증' },
                    { icon: FileText, text: '재직증명서 또는 사업자등록증' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 미리 생각해오시면 좋은 것들 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">미리 생각해오세요</h3>
                    <p className="text-sm text-gray-500">상담이 더 빨라집니다</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: Car, text: '희망 차종 및 옵션' },
                    { icon: Timer, text: '희망 계약 기간 (12~60개월)' },
                    { icon: CreditCard, text: '월 예산 범위' },
                    { icon: MapPin, text: '예상 연간 주행거리' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-gray-700" />
                      </div>
                      <span className="text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 팁 안내 */}
            <div className="mt-8 bg-primary/5 rounded-2xl p-6 border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">상담 TIP</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    서류가 없어도 상담은 가능합니다. 먼저 상담을 통해 조건을 확인하시고,
                    심사 진행 시에만 서류를 제출하시면 됩니다. 부담 없이 문의해주세요!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 상담 절차 인포그래픽 */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-bold text-sm tracking-wider">CONSULTATION PROCESS</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
              이렇게 진행됩니다
            </h2>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* 데스크톱 타임라인 */}
            <div className="hidden lg:block relative">
              {/* 연결선 */}
              <div className="absolute top-14 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-gray-200"></div>

              <div className="grid grid-cols-5 gap-2">
                {[
                  { step: 1, title: '상담 신청', desc: '전화/카카오톡으로\n문의하기', icon: Phone, time: '즉시' },
                  { step: 2, title: '조건 상담', desc: '맞춤 조건 안내 및\n견적 확인', icon: MessageSquare, time: '20~30분' },
                  { step: 3, title: '심사 진행', desc: '간단 서류 제출 후\n빠른 심사', icon: FileText, time: '당일~1일' },
                  { step: 4, title: '계약 체결', desc: '조건 확정 및\n계약 진행', icon: BadgeCheck, time: '1~2일' },
                  { step: 5, title: '차량 인수', desc: '원하는 장소로\n새 차 배송', icon: Car, time: '1~2주' },
                ].map((item, index) => (
                  <div key={index} className="relative text-center px-1">
                    {/* 소요 시간 - 원 위에 배치 */}
                    <div className="mb-2 flex justify-center">
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>

                    {/* 원형 아이콘 */}
                    <div className="w-24 h-24 xl:w-28 xl:h-28 mx-auto bg-white rounded-full border-4 border-primary shadow-lg flex flex-col items-center justify-center relative z-10 group hover:scale-105 transition-transform">
                      <item.icon className="w-6 h-6 xl:w-7 xl:h-7 text-primary mb-1" />
                      <span className="text-[10px] xl:text-xs text-gray-400">STEP {item.step}</span>
                    </div>

                    {/* 텍스트 */}
                    <div className="mt-4">
                      <h3 className="font-bold text-gray-900 text-sm xl:text-base">{item.title}</h3>
                      <p className="text-gray-500 text-xs xl:text-sm mt-1 whitespace-pre-line">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 모바일/태블릿 타임라인 */}
            <div className="lg:hidden space-y-0">
              {[
                { step: 1, title: '상담 신청', desc: '전화/카카오톡으로 문의하기', icon: Phone, time: '1분' },
                { step: 2, title: '조건 상담', desc: '맞춤 조건 안내 및 견적 확인', icon: MessageSquare, time: '10~20분' },
                { step: 3, title: '심사 진행', desc: '간단 서류 제출 후 빠른 심사', icon: FileText, time: '1~2시간' },
                { step: 4, title: '계약 체결', desc: '조건 확정 및 계약 진행', icon: BadgeCheck, time: '30분' },
                { step: 5, title: '차량 인수', desc: '원하는 장소로 새 차 배송', icon: Car, time: '1~2주' },
              ].map((item, index) => (
                <div key={index} className="flex gap-4">
                  {/* 라인과 원 */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    {index < 4 && (
                      <div className="w-0.5 h-16 bg-primary/30"></div>
                    )}
                  </div>

                  {/* 컨텐츠 */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary font-bold">STEP {item.step}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.time}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mt-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 총 소요시간 안내 */}
            <div className="mt-12 text-center bg-gray-900 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <div className="text-white">
                  <p className="text-gray-400 text-sm mb-1">상담부터 인수까지 평균</p>
                  <p className="text-3xl font-black">1~2주 소요</p>
                </div>
                <div className="hidden md:block w-px h-16 bg-gray-700"></div>
                <div className="text-center md:text-left">
                  <p className="text-gray-400 text-sm">
                    급하게 차량이 필요하신가요?<br />
                    <span className="text-white font-medium">빠른 심사로 최대한 빨리 진행해드립니다.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 운영시간 + 신뢰 지표 */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* 운영시간 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    status === 'open' ? 'bg-green-500' : status === 'lunch' ? 'bg-yellow-400' : 'bg-gray-400'
                  }`}>
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">상담 운영 시간</h3>
                    <div className={`inline-flex items-center gap-2 ${currentStatus.textColor}`}>
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentStatus.color} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${currentStatus.color}`}></span>
                      </span>
                      <span className="text-sm font-medium">{currentStatus.label}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-0">
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-gray-700 font-medium">평일</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span className="text-gray-700 font-medium">점심시간</span>
                    </div>
                    <span className="font-medium text-gray-500">12:00 - 13:00</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="text-gray-700 font-medium">토/일/공휴일</span>
                    </div>
                    <span className="font-medium text-red-500">휴무</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <div className="flex items-center gap-3">
                    <KakaoIcon className="w-5 h-5 text-gray-900" />
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">카카오톡</span>은 24시간 문의 접수 가능합니다
                    </p>
                  </div>
                </div>
              </div>

              {/* 사업자 정보 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">사업자 정보</h3>
                    <p className="text-gray-500 text-sm">{companyInfo.companyName || '신차앤렌트'}</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  {companyInfo.companyName && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-500">상호명</span>
                      <span className="text-gray-900 font-medium">{companyInfo.companyName}</span>
                    </div>
                  )}
                  {companyInfo.ceoName && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-500">대표자</span>
                      <span className="text-gray-900 font-medium">{companyInfo.ceoName}</span>
                    </div>
                  )}
                  {companyInfo.businessNumber && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-500">사업자등록번호</span>
                      <span className="text-gray-900 font-medium">{companyInfo.businessNumber}</span>
                    </div>
                  )}
                  {companyInfo.address && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-500">주소</span>
                      <span className="text-gray-900 font-medium text-right">{companyInfo.address}</span>
                    </div>
                  )}
                </div>

                {companyInfo.loanBrokerNumber && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3">대출모집법인 정보</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• 여신금융협회 등록번호: {companyInfo.loanBrokerNumber}</p>
                      <p className="text-gray-500">본 업체는 여신금융협회에 등록된 대출모집법인입니다.</p>
                    </div>

                    {/* 등록증 보기/다운로드 버튼 */}
                    {(companyInfo.loanBrokerImage || companyInfo.loanBrokerPdf) && (
                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        {companyInfo.loanBrokerImage && (
                          <>
                            <Button
                              variant="outline"
                              className="flex-1 rounded-lg text-sm"
                              onClick={() => setShowCertificate(!showCertificate)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              {showCertificate ? '등록증 숨기기' : '등록증 보기'}
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 rounded-lg text-sm"
                              onClick={handleImageDownload}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              이미지 다운로드
                            </Button>
                          </>
                        )}
                        {companyInfo.loanBrokerPdf && (
                          <Button
                            variant="outline"
                            className="flex-1 rounded-lg text-sm"
                            onClick={handlePdfDownload}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            PDF 다운로드
                          </Button>
                        )}
                      </div>
                    )}

                    {/* 등록증 이미지 표시 */}
                    {showCertificate && companyInfo.loanBrokerImage && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="relative w-full">
                          <Image
                            src={companyInfo.loanBrokerImage}
                            alt="대출모집법인 등록증"
                            width={800}
                            height={600}
                            className="w-full h-auto rounded-lg border border-gray-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 찾아오는 길 */}
      <section id="location" className="py-12 sm:py-16 md:py-28 bg-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <span className="text-primary font-bold text-xs sm:text-sm tracking-wider">LOCATION</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mt-1 sm:mt-2">
              찾아오는 길
            </h2>
            <p className="text-gray-500 mt-2 sm:mt-4 text-sm sm:text-base">
              방문 상담을 원하시면 아래 주소로 방문해주세요
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden">
              {/* 주소 정보 */}
              <div className="p-4 sm:p-6 md:p-8 bg-white">
                {companyInfo.address && (
                  <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1">주소</h3>
                        <p className="text-gray-700 text-sm sm:text-base break-keep">{companyInfo.address}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Car className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">주차 안내</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        건물 내 주차 가능 · 1시간 무료
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">대중교통</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        지하철 이용 시 문의 바랍니다
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button asChild className="flex-1 rounded-full h-11 sm:h-12">
                    <a href={`tel:${phoneNumber}`} className="flex items-center justify-center gap-2 text-sm sm:text-base">
                      <Phone className="w-4 h-4" />
                      방문 예약 전화
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full h-11 sm:h-12 text-sm sm:text-base"
                    onClick={() => {
                      const address = companyInfo.address || '';
                      if (address) {
                        navigator.clipboard.writeText(address);
                        alert('주소가 복사되었습니다');
                      } else {
                        alert('등록된 주소가 없습니다');
                      }
                    }}
                  >
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    주소 복사
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className={`inline-flex items-center gap-2 ${currentStatus.bgColor} ${currentStatus.borderColor} border px-4 py-2 rounded-full mb-6`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentStatus.color} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${currentStatus.color}`}></span>
              </span>
              <span className={`text-sm font-medium ${currentStatus.textColor}`}>
                {status === 'open' ? '지금 상담 가능합니다' : `${nextOpenTime}부터 상담 가능`}
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              지금 바로
              <br />
              <span className="text-primary-300">상담받아 보세요</span>
            </h2>
            <p className="text-lg text-gray-400 mb-10">
              전문 상담원이 고객님께 최적의 렌트 조건을 안내해드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-10 font-bold text-lg h-14">
                <a href={`tel:${phoneNumber}`} className="flex items-center gap-3">
                  <Phone className="w-6 h-6" />
                  {phoneNumber}
                </a>
              </Button>
              {kakaoUrl && (
                <Button asChild size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 rounded-full px-10 font-bold text-lg h-14">
                  <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                    <KakaoIcon className="w-6 h-6" />
                    카카오톡 상담
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
