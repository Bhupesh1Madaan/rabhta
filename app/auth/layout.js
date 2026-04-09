'use client';

import { AuthProvider } from '@/components/AuthContext';

export default function AuthLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
