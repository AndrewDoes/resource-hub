'use client';

import { Root } from './_components/layout/MainLayout';
import { RoleProvider } from './context/RoleContext';
import { ToastProvider } from './context/ToastContext';
import { ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <ToastProvider>
        <Root>
          {children}
        </Root>
      </ToastProvider>
    </RoleProvider>
  );
}
