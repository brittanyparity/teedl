// Popup script for Teedl extension
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggleBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const status = document.getElementById('status');
    const currentSite = document.getElementById('currentSite');
    const siteIcon = document.getElementById('siteIcon');
    const siteName = document.getElementById('siteName');
    
    // Check current tab and show appropriate UI
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const url = currentTab.url;
        
        if (url.includes('docs.google.com')) {
            showCurrentSite('📄', 'Google Docs');
        } else if (url.includes('slides.google.com')) {
            showCurrentSite('📊', 'Google Slides');
        } else if (url.includes('sheets.google.com')) {
            showCurrentSite('📈', 'Google Sheets');
        } else if (url.includes('drive.google.com')) {
            showCurrentSite('💾', 'Google Drive');
        } else {
            showStatus('⚠️ Please navigate to a Google Workspace app first', 'error');
            toggleBtn.disabled = true;
            toggleBtn.textContent = 'Not on Google Workspace';
        }
    });
    
    // Toggle panel button
    toggleBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            
            // Send message to content script to toggle panel
            chrome.tabs.sendMessage(currentTab.id, {
                action: 'togglePanel'
            }, function(response) {
                if (chrome.runtime.lastError) {
                    showStatus('❌ Failed to communicate with page', 'error');
                } else if (response && response.success) {
                    showStatus('✅ Panel toggled successfully', 'success');
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                } else {
                    showStatus('❌ Failed to toggle panel', 'error');
                }
            });
        });
    });
    
    // Settings button
    settingsBtn.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });
    
    function showCurrentSite(icon, name) {
        siteIcon.textContent = icon;
        siteName.textContent = name;
        currentSite.style.display = 'block';
        showStatus('✅ Ready to use Teedl!', 'success');
    }
    
    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
    }
});
