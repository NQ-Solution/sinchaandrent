'use client';

import { useState, useEffect } from 'react';
import { Phone, Youtube } from 'lucide-react';

// 카카오톡 공식 아이콘 (SVG)
function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.8 5.16 4.5 6.54-.2.72-.72 2.64-.84 3.06-.12.54.24.54.48.36.24-.12 3.24-2.16 4.56-3.06.42.06.84.12 1.3.12 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
    </svg>
  );
}

interface CompanyInfo {
  phone?: string;
  kakaoChannelUrl?: string;
  youtubeUrl?: string;
}

export function FloatingCTA() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});
  const [isLoading, setIsLoading] = useState(true);

  const phoneNumber = companyInfo.phone || '';
  const kakaoUrl = companyInfo.kakaoChannelUrl || '#';
  const youtubeUrl = companyInfo.youtubeUrl || 'https://www.youtube.com';

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
      } finally {
        setIsLoading(false);
      }
    }
    fetchCompanyInfo();
  }, []);

  const [showPhoneTooltip, setShowPhoneTooltip] = useState(false);
  const [showKakaoTooltip, setShowKakaoTooltip] = useState(false);
  const [showYoutubeTooltip, setShowYoutubeTooltip] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
      {/* 유튜브 채널 */}
      <div className="relative">
        {showYoutubeTooltip && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap shadow-lg animate-fade-in">
            <div className="font-medium">유튜브 채널</div>
            <div className="text-gray-300 text-xs mt-0.5">영상으로 확인하세요</div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        )}
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200"
          aria-label="유튜브 채널"
          onMouseEnter={() => setShowYoutubeTooltip(true)}
          onMouseLeave={() => setShowYoutubeTooltip(false)}
          onClick={() => setShowYoutubeTooltip(false)}
        >
          <Youtube className="w-6 h-6" />
        </a>
      </div>

      {/* 카카오톡 상담 */}
      <div className="relative">
        {showKakaoTooltip && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap shadow-lg animate-fade-in">
            <div className="font-medium">카카오톡 상담</div>
            <div className="text-gray-300 text-xs mt-0.5">편하게 문의하세요</div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        )}
        <a
          href={kakaoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#FEE500] text-[#3C1E1E] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200"
          aria-label="카카오톡 상담"
          onMouseEnter={() => setShowKakaoTooltip(true)}
          onMouseLeave={() => setShowKakaoTooltip(false)}
          onClick={() => setShowKakaoTooltip(false)}
        >
          <KakaoIcon className="w-7 h-7" />
        </a>
      </div>

      {/* 전화 상담 */}
      <div className="relative">
        {showPhoneTooltip && phoneNumber && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap shadow-lg animate-fade-in">
            <div className="font-medium">전화 상담</div>
            <div className="text-primary text-xs mt-0.5">{phoneNumber}</div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        )}
        {!isLoading && phoneNumber && (
          <a
            href={`tel:${phoneNumber}`}
            className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200"
            aria-label="전화 상담"
            onMouseEnter={() => setShowPhoneTooltip(true)}
            onMouseLeave={() => setShowPhoneTooltip(false)}
            onClick={() => setShowPhoneTooltip(false)}
          >
            <Phone className="w-6 h-6" />
          </a>
        )}
      </div>
    </div>
  );
}
