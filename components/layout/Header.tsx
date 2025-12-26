'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import { useUIStore } from '@/stores/ui';
import { cn } from '@/lib/utils';

interface CompanyInfo {
  phone?: string;
}

const navItems = [
  { href: '/vehicles', label: '차량 보기' },
  { href: '/about', label: '회사소개' },
  { href: '/contact', label: '상담안내' },
];

export function Header() {
  const pathname = usePathname();
  const { isMobileMenuOpen, isScrolled, toggleMobileMenu, closeMobileMenu, setIsScrolled } =
    useUIStore();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});

  const phoneNumber = companyInfo.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || '1588-0000';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsScrolled]);

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

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white',
        isScrolled && 'shadow-md'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2" onClick={closeMobileMenu}>
            <Image
              src="/logo.png"
              alt="신차앤렌트"
              width={200}
              height={50}
              className="h-8 sm:h-10 md:h-12 w-auto"
              priority
            />
            <span className="text-sm sm:text-lg md:text-xl font-bold text-primary">
              신차앤렌트
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative font-medium transition-all duration-200 py-1 group",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-gray-700 hover:text-primary"
                )}
              >
                {item.label}
                {/* 활성 상태 밑줄 */}
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-200",
                    isActive(item.href)
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  )}
                />
              </Link>
            ))}
            <a
              href={`tel:${phoneNumber}`}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>전화상담</span>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden bg-white border-t py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-4 py-3 transition-all duration-200 border-l-4",
                  isActive(item.href)
                    ? "border-primary bg-primary/5 text-primary font-semibold"
                    : "border-transparent text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary/30"
                )}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={`tel:${phoneNumber}`}
              className="flex items-center gap-2 mx-4 mt-3 bg-primary text-white px-4 py-3 rounded-lg font-medium justify-center"
            >
              <Phone className="w-4 h-4" />
              <span>전화상담</span>
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
