import React, { useEffect } from 'react';
import '../../styles/Modal.css';

let openModalCount = 0;
let savedBodyOverflow = '';
let savedBodyPaddingRight = '';
let modalObserverAttached = false;

function restoreBodyIfNoModal() {
  if (openModalCount === 0 && !document.querySelector('.modal-overlay')) {
    // Restore inline styles if saved, otherwise clear inline styles so stylesheet can control it
    document.body.style.overflow = savedBodyOverflow || '';
    document.body.style.paddingRight = savedBodyPaddingRight || '';
    savedBodyOverflow = '';
    savedBodyPaddingRight = '';

    // Safety fallback: if computed style still reports 'hidden' then force 'auto'
    setTimeout(() => {
      const computedOverflow = window.getComputedStyle(document.body).overflow;
      if (computedOverflow === 'hidden') {
        document.body.style.overflow = 'auto';
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('[Modal] MutationObserver fallback: forced document.body.style.overflow = auto');
        }
      }
    }, 0);
  }
}

function ensureModalObserver() {
  if (modalObserverAttached) return;
  modalObserverAttached = true;

  try {
    const obs = new MutationObserver(() => {
      restoreBodyIfNoModal();
    });

    // Observe DOM changes and attribute changes that could affect overlays or body styles
    obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
    if (document.body) {
      obs.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    }

    window.addEventListener('resize', restoreBodyIfNoModal);
  } catch (err) {
    // In very old or restricted environments, ignore observer setup failures
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[Modal] Failed to attach MutationObserver for body overflow restoration', err);
    }
  }
}

export default function Modal({ isOpen, onClose, title, children, actions, size = 'md' }) {
  if (!isOpen) return null;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    document.addEventListener('keydown', onKey);

    // Ensure the observer is attached to detect and fix orphaned hidden overflow later
    ensureModalObserver();

    // increment counter and, if this is the first modal, save and update body styles
    openModalCount += 1;
    if (openModalCount === 1) {
      savedBodyOverflow = document.body.style.overflow;
      savedBodyPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', onKey);

      // decrement counter and restore only when there are no more open modals
      openModalCount -= 1;
      if (openModalCount === 0) {
        document.body.style.overflow = savedBodyOverflow || '';
        document.body.style.paddingRight = savedBodyPaddingRight || '';

        // clear saved values
        savedBodyOverflow = '';
        savedBodyPaddingRight = '';

        // Small delay to let browser apply inline changes; then ensure body is scrollable if still hidden
        setTimeout(() => {
          restoreBodyIfNoModal();
        }, 0);
      }
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content modal-size-${size}`} onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
        )}

        {title && <h3 className="modal-title">{title}</h3>}

        <div className="modal-children">{children}</div>

        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}
