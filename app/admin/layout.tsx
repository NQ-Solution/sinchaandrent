import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

// 동적 렌더링 강제 (auth에서 headers 사용)
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;

  try {
    session = await auth();
  } catch (error) {
    console.error('Auth check failed:', error);
  }

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar userName={session.user?.name || '관리자'} />

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8">
        {/* Mobile: Add top padding for fixed header */}
        <div className="lg:hidden h-14" />
        {children}
      </main>
    </div>
  );
}
