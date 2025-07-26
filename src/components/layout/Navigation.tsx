'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone } from 'lucide-react';
import Logo from '@/components/Logo';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';

const Navigation = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getPhoneNumber, getCompanyName } = useBusinessSettings();

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      current: pathname === '/'
    },
    {
      name: 'Book',
      href: '/book',
      current: pathname === '/book'
    },
    {
      name: 'Help',
      href: '/help',
      current: pathname === '/help'
    },
    {
      name: 'About',
      href: '/about',
      current: pathname === '/about'
    }
  ];

  return (
    <nav className="bg-white border-b-2 border-gray-100 shadow-lg sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <Logo className="h-12 w-auto transition-transform group-hover:scale-105" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                {getCompanyName()}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-base font-semibold transition-all duration-200 hover:scale-105',
                  item.current
                    ? 'text-blue-900 border-b-2 border-blue-900 pb-1'
                    : 'text-gray-700 hover:text-blue-900 hover:border-b-2 hover:border-blue-300 pb-1'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Contact Button */}
          <div className="hidden md:flex items-center space-x-4">
            <a 
              href={`tel:${getPhoneNumber()}`}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-xl hover:from-blue-800 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <Phone className="h-5 w-5" />
              <span>Call Now</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-3 hover:bg-blue-50 rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-xl">
          <div className="px-6 pt-4 pb-6 space-y-3">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200',
                  item.current
                    ? 'bg-blue-900 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-900'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200">
              <a 
                href={`tel:${getPhoneNumber()}`}
                className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone className="h-5 w-5" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export { Navigation };
