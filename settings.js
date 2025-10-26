// Settings page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupEventListeners();
});

function loadSettings() {
    // Load anonymous ID
    chrome.storage.local.get(['teedl_anon_id'], function(result) {
        const anonId = result.teedl_anon_id || 'Not available';
        document.getElementById('anonId').textContent = anonId.substring(0, 8) + '...';
    });
    
    // Load usage count
    const aiUsed = parseInt(localStorage.getItem('teedl_ai_used') || '0', 10);
    document.getElementById('usageCount').textContent = aiUsed + ' requests';
    
    // Load toggle states
    loadToggleState('autoOpenToggle', 'teedl_auto_open');
    loadToggleState('showProgressToggle', 'teedl_show_progress');
    loadToggleState('notificationsToggle', 'teedl_notifications');
}

function loadToggleState(toggleId, storageKey) {
    chrome.storage.local.get([storageKey], function(result) {
        const toggle = document.getElementById(toggleId);
        const isActive = result[storageKey] || false;
        if (isActive) {
            toggle.classList.add('active');
        }
    });
}

function setupEventListeners() {
    // Auto-open toggle
    document.getElementById('autoOpenToggle').addEventListener('click', function() {
        toggleSetting(this, 'teedl_auto_open');
    });
    
    // Show progress toggle
    document.getElementById('showProgressToggle').addEventListener('click', function() {
        toggleSetting(this, 'teedl_show_progress');
    });
    
    // Notifications toggle
    document.getElementById('notificationsToggle').addEventListener('click', function() {
        toggleSetting(this, 'teedl_notifications');
    });
}

function toggleSetting(toggle, storageKey) {
    const isActive = toggle.classList.contains('active');
    toggle.classList.toggle('active');
    
    chrome.storage.local.set({
        [storageKey]: !isActive
    });
}

function resetData() {
    if (confirm('Are you sure you want to reset all Teedl data? This cannot be undone.')) {
        chrome.storage.local.clear();
        localStorage.removeItem('teedl_ai_used');
        localStorage.removeItem('teedl_subscribed');
        localStorage.removeItem('teedl_last_reset_month');
        alert('Data reset successfully!');
        location.reload();
    }
}

function exportData() {
    chrome.storage.local.get(null, function(items) {
        const data = {
            ...items,
            localStorage: {
                teedl_ai_used: localStorage.getItem('teedl_ai_used'),
                teedl_subscribed: localStorage.getItem('teedl_subscribed'),
                teedl_last_reset_month: localStorage.getItem('teedl_last_reset_month')
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'teedl-data-export.json';
        a.click();
        URL.revokeObjectURL(url);
    });
}

function openFeedback() {
    chrome.tabs.create({
        url: 'https://forms.gle/your-feedback-form-url'
    });
}
