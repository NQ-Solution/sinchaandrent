'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Car,
  Tag,
  Star,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Image,
  Handshake
} from 'lucide-react';

const sidebarItems = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/vehicles', label: '차량 관리', icon: Car },
  { href: '/admin/brands', label: '브랜드 관리', icon: Tag },
  { href: '/admin/popular', label: '인기 차량', icon: Star },
  { href: '/admin/banners', label: '배너 관리', icon: Image },
  { href: '/admin/partners', label: '제휴사 관리', icon: Handshake },
  { href: '/admin/faq', label: 'FAQ 관리', icon: HelpCircle },
  { href: '/admin/settings', label: '사이트 설정', icon: Settings },
];

interface AdminSidebarProps {
  userName: string;
}

export default function AdminSidebar({ userName }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
    router.refresh();
  };

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-gray-900 text-white flex items-center justify-between px-4 z-40">
        <h1 className="text-lg font-bold">관리자</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop always visible, Mobile slide-in */}
      <aside className={`
        fixed left-0 top-0 h-full bg-gray-900 text-white z-40 transition-transform duration-300
        w-64 lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 hidden lg:block">
          <h1 className="text-xl font-bold">관리자</h1>
        </div>

        {/* Mobile: Add top padding for header */}
        <div className="lg:hidden h-14" />

        <nav className="mt-6 lg:mt-0">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white border-l-4 border-primary'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-400 mb-2">{userName}</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
