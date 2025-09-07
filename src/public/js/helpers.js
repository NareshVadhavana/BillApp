document.addEventListener('DOMContentLoaded', () => {
  function showToast(type, message) {
    const toastId = 'custom-toast-' + Date.now();
    const container = document.getElementById('customToastContainer');

    if (!container) {
      console.warn('Toast container not found');
      return;
    }

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `custom-toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        container.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // Other helper functions can go here
  // Example:
  window.showToast = showToast; // Expose it globally
});
