/**
 * India Forest Fire Intelligence — Global Application Controller
 * Handles status indicator polling, toast messaging, and shared utilities.
 */

const App = {
  init() {
    this.pollFirmsStatus();
    this.setupToasts();
  },

  async pollFirmsStatus() {
    try {
      const resp = await fetch('/api/firms-status');
      if (!resp.ok) return;
      const data = await resp.json();
      
      const badge = document.getElementById('live-indicator-badge');
      const text = document.getElementById('live-indicator-text');
      if (badge && text) {
        if (data.mode === 'LIVE') {
          badge.className = 'live-indicator';
          text.textContent = 'LIVE FEED (VIIRS)';
        } else {
          badge.className = 'live-indicator demo';
          text.textContent = 'DEMO ARCHIVE';
        }
      }
    } catch (e) {
      console.warn('Status poll warning:', e);
    }
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `callout ${type}`;
    toast.style.cssText = 'background:#ffffff;border:1px solid #d4ccbd;box-shadow:0 4px 12px rgba(0,0,0,0.08);padding:10px 16px;border-radius:6px;font-size:0.8125rem;';
    toast.innerHTML = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
