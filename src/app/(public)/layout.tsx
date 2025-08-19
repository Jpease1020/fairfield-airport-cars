'use client';

import React from 'react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <main data-testid="layout-main-content">
        {children}
      </main>
    </div>
  );
} 