// Content script for Teedl extension
(function() {
    'use strict';
    
    let panel = null;
    let isPanelOpen = false;
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'togglePanel') {
            togglePanel();
            sendResponse({success: true});
        }
    });
    
    function togglePanel() {
        if (isPanelOpen) {
            closePanel();
        } else {
            openPanel();
        }
    }
    
    function openPanel() {
        if (panel) {
            panel.style.display = 'block';
            isPanelOpen = true;
            return;
        }
        
        // Create iframe
        panel = document.createElement('iframe');
        panel.id = 'teedl-panel';
        panel.src = chrome.runtime.getURL('panel.html');
        panel.style.cssText = `
            position: fixed;
            top: 0px;
            right: 0px;
            width: 340px;
            height: 100%;
            border: 0;
            z-index: 2147483647;
            box-shadow: -4px 0 16px rgba(0,0,0,.12);
            background: #fff;
        `;
        
        document.body.appendChild(panel);
        isPanelOpen = true;
        
        // Listen for panel close events
        window.addEventListener('message', function(event) {
            if (event.data && event.data.__teedl_evt === 'panel_close') {
                closePanel();
            }
        });
    }
    
    function closePanel() {
        if (panel) {
            panel.style.display = 'none';
            isPanelOpen = false;
        }
    }
    
    // Auto-open panel on Google Workspace pages
    if (window.location.host.includes('google.com') && 
        (window.location.pathname.includes('/document') || 
         window.location.pathname.includes('/presentation') || 
         window.location.pathname.includes('/spreadsheets'))) {
        
        // Small delay to ensure page is loaded
        setTimeout(() => {
            openPanel();
        }, 1000);
    }
})();
