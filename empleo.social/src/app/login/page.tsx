// src/app/login/page.tsx
"use client";

import { useEffect } from 'react';

export default function MinimalLoginPage() {
  useEffect(() => {
    console.log('[MinimalLoginPage] Component did mount/render - TESTING');
  }, []);

  console.log('[MinimalLoginPage] Rendering - TESTING');

  return (
    <div>
      <h1>Login Page (Minimal Test)</h1>
      <p>If you see this, the minimal page is rendering.</p>
      <p>Check the browser console for '[MinimalLoginPage]' logs.</p>
    </div>
  );
}
