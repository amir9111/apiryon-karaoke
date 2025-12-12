import { useEffect } from "react";

export default function AccessibilityHelper() {
  useEffect(() => {
    // הוסף skip to main content
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'דלג לתוכן הראשי';
    skipLink.className = 'skip-to-main';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: #00caff;
      color: #001a2e;
      padding: 8px;
      text-decoration: none;
      z-index: 100000;
      font-weight: bold;
      border-radius: 0 0 8px 0;
    `;
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    if (document.body.firstChild) {
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // הוסף focus visible styles גלובלית
    const style = document.createElement('style');
    style.textContent = `
      *:focus-visible {
        outline: 3px solid #00caff !important;
        outline-offset: 2px !important;
      }
      
      button:focus-visible,
      a:focus-visible,
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible {
        box-shadow: 0 0 0 3px rgba(0, 202, 255, 0.5) !important;
      }
      
      .skip-to-main:focus {
        outline: 3px solid #001a2e;
      }
      
      /* Screen reader only */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `;
    document.head.appendChild(style);

    // הוסף live region להתראות
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'aria-live-region';
    document.body.appendChild(liveRegion);

    return () => {
      if (skipLink.parentNode) skipLink.remove();
      if (style.parentNode) style.remove();
      if (liveRegion.parentNode) liveRegion.remove();
    };
  }, []);

  return null;
}

// Helper function to announce to screen readers
export function announceToScreenReader(message) {
  const liveRegion = document.getElementById('aria-live-region');
  if (liveRegion) {
    liveRegion.textContent = message;
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
}