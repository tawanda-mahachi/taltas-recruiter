// @ts-nocheck
'use client';
import { useEffect, useCallback, ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  className?: string;
}

export function Modal({ open, onClose, children, maxWidth = '640px', className = '' }: ModalProps) {
  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={className}
        style={{ background:'#FFFFFF', border:'1px solid #E8E8E5', width:'92%', maxWidth, maxHeight:'90vh', overflowY:'auto', padding:'28px 32px', display:'flex', flexDirection:'column', gap:0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
