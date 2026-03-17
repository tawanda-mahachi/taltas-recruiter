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
  useEffect(() => { if (open) { document.addEventListener('keydown', handleKey); document.body.style.overflow = 'hidden'; } return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; }; }, [open, handleKey]);
  if (!open) return null;
  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal ${className}`} style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

