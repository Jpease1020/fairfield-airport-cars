'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import PageCommentWidget from '@/components/admin/PageCommentWidget';

const GlobalCommentWidget = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is admin (you can enhance this with proper auth)
    const checkAdminStatus = () => {
      // For now, we'll check if we're on admin pages or if there's an admin session
      const isOnAdminPage = pathname?.startsWith('/admin');
      const hasAdminSession = localStorage.getItem('admin-session') || sessionStorage.getItem('admin-session');
      
      // Also check for any admin-related cookies or session data
      const hasAdminCookie = document.cookie.includes('admin') || document.cookie.includes('auth');
      
      setIsAdmin(isOnAdminPage || !!hasAdminSession || hasAdminCookie);
    };

    checkAdminStatus();
    
    // Re-check when pathname changes
    const interval = setInterval(checkAdminStatus, 2000);
    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    // Get page title
    const title = document.title || 'Fairfield Airport Cars';
    setPageTitle(title);
  }, [pathname]);

  // Debug: Log admin status
  useEffect(() => {
    console.log('🔍 GlobalCommentWidget - Admin status:', isAdmin, 'Path:', pathname);
  }, [isAdmin, pathname]);

  if (!isAdmin) {
    return null;
  }

  return (
    <PageCommentWidget 
      pageUrl={pathname || '/'}
      pageTitle={pageTitle}
      isAdmin={isAdmin}
    />
  );
};

export default GlobalCommentWidget; 