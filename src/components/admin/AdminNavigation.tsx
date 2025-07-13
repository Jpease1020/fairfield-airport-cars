'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
  DollarSign
} from 'lucide-react';

const AdminNavigation = () => {
  const pathname = usePathname();

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
        }
      ]
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                Admin Panel
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.name} className="relative">
                    <Link
                      href={item.href}
                      className={cn(
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                        item.current
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      )}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                    
                    {/* Dropdown for CMS */}
                    {item.children && item.current && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="py-1">
                          {item.children.map((child) => {
                            const ChildIconComponent = child.icon;
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                className={cn(
                                  'flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
                                  child.current && 'bg-blue-50 text-blue-700'
                                )}
                              >
                                <ChildIconComponent className="h-4 w-4 mr-2" />
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
          
          <div className="flex items-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              View Site
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { AdminNavigation }; 