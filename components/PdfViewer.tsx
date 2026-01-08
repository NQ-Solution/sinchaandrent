'use client';

import { Eye, ArrowRight } from 'lucide-react';

interface PdfViewerProps {
  name: string;
  file: string;
  index: number;
}

export function PdfViewer({ name, file, index }: PdfViewerProps) {
  const openPdfInNewTab = () => {
    try {
      // base64 데이터인지 확인
      if (file.startsWith('data:application/pdf;base64,') || file.startsWith('data:')) {
        // base64 데이터에서 prefix 제거
        const base64Content = file.includes(',') ? file.split(',')[1] : file;

        // base64를 binary로 변환
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        // Blob 생성
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        // 새 창에서 열기
        window.open(blobUrl, '_blank');
      } else {
        // 일반 URL인 경우 직접 열기
        window.open(file, '_blank');
      }
    } catch (error) {
      console.error('PDF 열기 오류:', error);
      alert('PDF를 열 수 없습니다.');
    }
  };

  return (
    <button
      onClick={openPdfInNewTab}
      className="w-full text-left bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
          <Eye className="w-6 h-6 text-blue-600 group-hover:text-primary transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
            {name || `등록증 ${index + 1}`}
          </h5>
          <p className="text-sm text-gray-500 mt-1">클릭하여 새창에서 보기</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
}
