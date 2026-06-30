// ============================================================
// components/common/Modal.jsx
// Reusable modal dialog — used across Add Employee, Apply Leave, etc.
// ============================================================

import React, { useEffect } from 'react';

/**
 * Modal component.
 *
 * Props:
 * - isOpen {boolean}     - Controls visibility
 * - onClose {function}   - Called when overlay or X is clicked
 * - title {string}       - Modal header title
 * - children {ReactNode} - Modal body content
 * - size {'sm'|'md'|'lg'} - Controls max-width
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // Close modal on Escape key press (accessibility)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidths = { sm: '400px', md: '560px', lg: '800px' };

  return (
    // Overlay — clicking outside the card closes the modal
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
    >
      {/* Card — stop click from bubbling to overlay */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '1rem',
          width: '100%',
          maxWidth: maxWidths[size],
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
          animation: 'slideUp 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1.25rem', color: 'var(--text-2)', lineHeight: 1,
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
