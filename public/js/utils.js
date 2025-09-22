// Utility Functions for Error Handling and Common Operations

// Handle API Responses
async function handleApiResponse(response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'An unexpected error occurred'
        }));
        throw new Error(error.message || 'Request failed');
    }
    return response.json();
}

// Form Validation
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            showError(input, 'This field is required');
            isValid = false;
        } else if (input.type === 'email' && input.value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value)) {
                showError(input, 'Please enter a valid email address');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Show Error Message
function showError(element, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;
    
    // Remove any existing error messages
    const existing = element.parentElement.querySelector('.form-error');
    if (existing) {
        existing.remove();
    }
    
    element.parentElement.appendChild(errorDiv);
    element.classList.add('error');
}

// Clear Error Message
function clearError(element) {
    const errorDiv = element.parentElement.querySelector('.form-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    element.classList.remove('error');
}

// Show Loading State
function showLoading(element, message = 'Loading...') {
    element.classList.add('loading');
    element.disabled = true;
    element.dataset.originalText = element.textContent;
    element.textContent = message;
}

// Hide Loading State
function hideLoading(element) {
    element.classList.remove('loading');
    element.disabled = false;
    element.textContent = element.dataset.originalText;
}

// Format Date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// Format Time Ago
function formatTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now - past) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    
    return formatDate(past);
}

// Handle File Upload
async function handleFileUpload(file, endpoint) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });
        
        return handleApiResponse(response);
    } catch (error) {
        console.error('File upload failed:', error);
        throw error;
    }
}

// Show Toast Message
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Session Check
async function checkSession() {
    try {
        const response = await fetch('/check-session');
        const data = await handleApiResponse(response);
        
        if (!data.authenticated) {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Session check failed:', error);
        window.location.href = '/login';
    }
}

// Export utilities
window.utils = {
    handleApiResponse,
    validateForm,
    showError,
    clearError,
    showLoading,
    hideLoading,
    formatDate,
    formatTimeAgo,
    handleFileUpload,
    showToast,
    debounce,
    checkSession
};