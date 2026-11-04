import React from 'react';
import toast from 'react-hot-toast';

/**
 * Reusable Confirmation Toast
 * Replaces native browser alert() and window.confirm() with clean, styled toasts.
 */
export const toastConfirm = ({
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  toast(
    (t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: '240px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.25rem 0.65rem', fontSize: '0.8rem' }}
            onClick={() => {
              toast.dismiss(t.id);
              if (onCancel) onCancel();
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ padding: '0.25rem 0.65rem', fontSize: '0.8rem' }}
            onClick={() => {
              toast.dismiss(t.id);
              if (onConfirm) onConfirm();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    ),
    {
      duration: 8000,
      position: 'top-center',
    }
  );
};

export default toastConfirm;

