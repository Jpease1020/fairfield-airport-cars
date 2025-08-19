'use client';

import React from 'react';

export default function CustomerLayout({
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