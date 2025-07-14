'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  BookOpen,
  Tag,
  Settings,
  Layout,
  BarChart3,
  Users,
  CreditCard,
  Mail,
  DollarSign,
  HelpCircle,
  Bot,
  Menu,
  X
} from 'lucide-react';

const AdminNavigation = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
      current: pathname === '/admin'
    },
    {
      name: 'Bookings',
      href: '/admin/bookings',
      icon: BookOpen,
      current: pathname === '/admin/bookings'
    },
    {
      name: 'Calendar',
      href: '/admin/calendar',
      icon: Calendar,
      current: pathname === '/admin/calendar'
    },
    {
      name: 'Promos',
      href: '/admin/promos',
      icon: Tag,
      current: pathname === '/admin/promos'
    },
    {
      name: 'Help',
      href: '/admin/help',
      icon: HelpCircle,
      current: pathname === '/admin/help'
    },
    {
      name: 'AI Assistant',
      href: '/admin/ai-assistant',
      icon: Bot,
      current: pathname === '/admin/ai-assistant'
    },
    {
      name: 'CMS',
      href: '/admin/cms',
      icon: Layout,
      current: pathname.startsWith('/admin/cms'),
      children: [
        {
          name: 'Pages',
          href: '/admin/cms/pages',
          icon: Layout,
          current: pathname === '/admin/cms/pages'
        },
        {
          name: 'Business',
          href: '/admin/cms/business',
          icon: Settings,
          current: pathname === '/admin/cms/business'
        },
        {
          name: 'Pricing',
          href: '/admin/cms/pricing',
          icon: DollarSign,
          current: pathname === '/admin/cms/pricing'
        },
        {
          name: 'Payment',
          href: '/admin/cms/payment',
          icon: CreditCard,
          current: pathname === '/admin/cms/payment'
        },
        {
          name: 'Communication',
          href: '/admin/cms/communication',
          icon: Mail,
          current: pathname === '/admin/cms/communication'
        },
        {
          name: 'Drivers',
          href: '/admin/cms/drivers',
          icon: Users,
          current: pathname === '/admin/cms/drivers'
        },
        {
          name: 'Analytics',
          href: '/admin/cms/analytics',
          icon: BarChart3,
          current: pathname === '/admin/cms/analytics'
        },
        {
          name: 'Colors',
          href: '/admin/cms/colors',
          icon: Settings,
          current: pathname === '/admin/cms/colors'
        }
      ]
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-2xl font-bold text-gray-900">Admin Panel</Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.name} className="relative">
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md font-medium transition',
                        item.current
                          ? 'bg-[var(--primary)] text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-[var(--primary)]'
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                      {item.name}
                    </Link>
                    {/* Dropdown for CMS */}
                    {item.children && item.current && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                        <div className="py-2">
                          {item.children.map((child) => {
                            const ChildIconComponent = child.icon;
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                className={cn(
                                  'flex items-center gap-2 px-4 py-2 text-sm rounded-md transition',
                                  child.current
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-[var(--primary)]'
                                )}
                              >
                                <ChildIconComponent className="h-4 w-4" />
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <Link
            href="/"
            className="ml-auto px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-blue-700 transition hidden md:inline-block"
          >
            View Site
          </Link>
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="py-2 px-2 space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 rounded-md font-medium',
                      item.current
                        ? 'bg-[var(--primary)] text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-[var(--primary)]'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <IconComponent className="h-5 w-5" />
                    {item.name}
                  </Link>
                  {/* Mobile CMS submenu */}
                  {item.children && item.current && (
                    <div className="pl-8 space-y-1">
                      {item.children.map((child) => {
                        const ChildIconComponent = child.icon;
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              'flex items-center gap-2 px-4 py-2 text-sm rounded-md',
                              child.current
                                ? 'bg-[var(--primary)] text-white'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-[var(--primary)]'
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <ChildIconComponent className="h-4 w-4" />
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="pt-2 border-t border-gray-200">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-3 rounded-md font-medium text-gray-700 hover:bg-gray-100 hover:text-[var(--primary)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                View Site
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export { AdminNavigation }; 