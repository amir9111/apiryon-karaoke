import { toast } from "sonner";

/**
 * Toast notification wrapper
 * Provides a consistent interface for showing notifications
 * Replaces alert() with better UX
 */

export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      duration: 4000,
      ...options
    });
  },

  error: (message, options = {}) => {
    toast.error(message, {
      duration: 5000,
      ...options
    });
  },

  info: (message, options = {}) => {
    toast.info(message, {
      duration: 4000,
      ...options
    });
  },

  warning: (message, options = {}) => {
    toast.warning(message, {
      duration: 4000,
      ...options
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, options);
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(promise, {
      loading: messages.loading || 'טוען...',
      success: messages.success || 'הצלחה!',
      error: messages.error || 'שגיאה!',
      ...options
    });
  },

  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }
};

/**
 * Confirm dialog using toast
 * Better UX than alert/confirm
 */
export const confirmAction = (message, onConfirm, onCancel) => {
  toast(message, {
    duration: Infinity,
    action: {
      label: 'אישור',
      onClick: () => {
        if (onConfirm) onConfirm();
      }
    },
    cancel: {
      label: 'ביטול',
      onClick: () => {
        if (onCancel) onCancel();
      }
    }
  });
};
