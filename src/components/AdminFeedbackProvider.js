'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import styles from './AdminFeedbackProvider.module.css';

const AdminFeedbackContext = createContext(null);

export function AdminFeedbackProvider({ children }) {
  const resolverRef = useRef(null);
  const [confirmState, setConfirmState] = useState(null);
  const [message, setMessage] = useState(null);

  const closeMessage = useCallback(() => {
    setMessage(null);
  }, []);

  const notify = useCallback((nextMessage) => {
    const normalized = typeof nextMessage === 'string'
      ? { title: nextMessage, tone: 'info' }
      : { tone: 'info', ...nextMessage };

    setMessage(normalized);

    if (normalized.autoClose !== false) {
      window.setTimeout(() => {
        setMessage((current) => (current === normalized ? null : current));
      }, normalized.duration || 4200);
    }
  }, []);

  const confirm = useCallback((options) => {
    const normalized = typeof options === 'string'
      ? { title: options }
      : options;

    setConfirmState({
      title: normalized.title || 'Confirm action',
      description: normalized.description || '',
      confirmText: normalized.confirmText || 'Confirm',
      cancelText: normalized.cancelText || 'Cancel',
      tone: normalized.tone || 'danger',
    });

    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const resolveConfirm = useCallback((value) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setConfirmState(null);
  }, []);

  const value = useMemo(() => ({ confirm, notify }), [confirm, notify]);

  return (
    <AdminFeedbackContext.Provider value={value}>
      {children}

      {message && (
        <div className={`${styles.toast} ${styles[message.tone] || styles.info}`} role="status">
          <div>
            <strong>{message.title}</strong>
            {message.description && <p>{message.description}</p>}
          </div>
          <button type="button" onClick={closeMessage} aria-label="Close message">×</button>
        </div>
      )}

      {confirmState && (
        <div className={styles.overlay} role="presentation" onMouseDown={() => resolveConfirm(false)}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-feedback-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={`${styles.icon} ${styles[confirmState.tone] || styles.danger}`} aria-hidden="true">
              !
            </div>
            <div className={styles.dialogBody}>
              <h2 id="admin-feedback-title">{confirmState.title}</h2>
              {confirmState.description && <p>{confirmState.description}</p>}
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={() => resolveConfirm(false)}>
                {confirmState.cancelText}
              </button>
              <button type="button" className={`${styles.confirmBtn} ${styles[confirmState.tone] || styles.danger}`} onClick={() => resolveConfirm(true)}>
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminFeedbackContext.Provider>
  );
}

export function useAdminFeedback() {
  const context = useContext(AdminFeedbackContext);
  if (!context) {
    throw new Error('useAdminFeedback must be used inside AdminFeedbackProvider');
  }

  return context;
}
