// @ts-nocheck
'use client';
import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { IconX } from '@/components/icons';

interface Toast { id: number; message: string; type: 'success' | 'info' | 'warn' | 'error'; }

const ToastContext = createContext<{ show: (msg: string, type?: Toast['type']) => void }>({ show: () => {} });

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);
  const dismiss = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380 }}>
        {toasts.map(t => (
          <div key={t.id} className="toast-item" style={{
            background: t.type === 'success' ? 'var(--green-bg)' : t.type === 'warn' ? 'var(--orange-bg)' : t.type === 'error' ? 'var(--red-bg)' : 'var(--blue-bg)',
            border: `1px solid ${t.type === 'success' ? 'var(--green-border)' : t.type === 'warn' ? 'var(--orange-border)' : t.type === 'error' ? 'var(--red-border)' : 'var(--blue-border)'}`,
            borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,.12)', animation: 'toastIn .3s ease',
          }}>
            <span style={{
              fontSize: 11.5, fontFamily: 'var(--font-sans)', lineHeight: 1.5, flex: 1,
              color: t.type === 'success' ? 'var(--green)' : t.type === 'warn' ? 'var(--orange)' : t.type === 'error' ? 'var(--red)' : 'var(--blue)',
            }}>{t.message}</span>
            <button onClick={() => dismiss(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: .5, color: 'inherit' }}><IconX size={10} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

