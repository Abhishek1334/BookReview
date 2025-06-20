// Minimal toast utility for notifications
class Toast {
  constructor() {
    this.container = null;
    this.createContainer();
  }

  createContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed top-20 right-2 sm:right-4 z-50 space-y-2 max-w-[calc(100vw-1rem)] sm:max-w-sm';
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    
    const baseClasses = 'px-3 sm:px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full opacity-0 w-full border bg-white text-gray-900 text-sm';
    
    // Minimal design with subtle indicators
    const typeClasses = {
      success: 'border-gray-200 shadow-sm',
      error: 'border-gray-300 shadow-md',
      info: 'border-gray-200 shadow-sm',
      warning: 'border-gray-300 shadow-md'
    };

    // Subtle indicator dots
    const indicators = {
      success: '<div class="w-2 h-2 rounded-full bg-gray-800 mr-2 sm:mr-3 flex-shrink-0"></div>',
      error: '<div class="w-2 h-2 rounded-full bg-gray-600 mr-2 sm:mr-3 flex-shrink-0"></div>',
      info: '<div class="w-2 h-2 rounded-full bg-gray-400 mr-2 sm:mr-3 flex-shrink-0"></div>',
      warning: '<div class="w-2 h-2 rounded-full bg-gray-500 mr-2 sm:mr-3 flex-shrink-0"></div>'
    };

    toast.className = `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
    toast.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center min-w-0 flex-1">
          ${indicators[type] || indicators.info}
          <span class="text-sm font-medium text-gray-900 truncate">${message}</span>
        </div>
        <button class="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    this.container.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
      toast.classList.add('translate-x-0', 'opacity-100');
    }, 100);

    // Auto remove
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  success(message, duration) {
    this.show(message, 'success', duration);
  }

  error(message, duration) {
    this.show(message, 'error', duration);
  }

  info(message, duration) {
    this.show(message, 'info', duration);
  }

  warning(message, duration) {
    this.show(message, 'warning', duration);
  }
}

// Create singleton instance
const toast = new Toast();

// Named export for compatibility
export const showToast = (message, type = 'info', duration = 4000) => {
  toast.show(message, type, duration);
};

export default toast; 