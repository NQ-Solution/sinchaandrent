'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// /admin/company는 /admin/settings로 리다이렉트
export default function AdminCompanyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/settings');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
