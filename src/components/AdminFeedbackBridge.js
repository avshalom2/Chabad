'use client';

import { useEffect } from 'react';
import { useAdminFeedback } from './AdminFeedbackProvider.js';

export default function AdminFeedbackBridge() {
  const { notify } = useAdminFeedback();

  useEffect(() => {
    const nativeAlert = window.alert;

    window.alert = (message) => {
      notify({
        title: String(message || ''),
        tone: 'info',
        autoClose: false,
      });
    };

    return () => {
      window.alert = nativeAlert;
    };
  }, [notify]);

  return null;
}
