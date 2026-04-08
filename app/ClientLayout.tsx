'use client';

import { RoleProvider } from './context/RoleContext';
import { ToastProvider } from './context/ToastContext';
import { Root } from './components/Root';
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
