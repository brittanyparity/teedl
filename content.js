// Content script for Teedl extension
(function() {
    'use strict';
    
    console.log('Teedl content script loaded on:', window.location.href);
    
    let panel = null;
    let isPanelOpen = false;
    
    // Listen for messages from extension icon click
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log('Teedl received message:', request);
        if (request.action === 'togglePanel') {
            togglePanel();
            sendResponse({success: true});
        } else if (request.action === 'openPanel') {
            if (!isPanelOpen) {
                openPanel();
            }
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
        
        // Detect current Google Workspace app
        let site = 'docs'; // default
        if (window.location.pathname.includes('/document')) site = 'docs';
        else if (window.location.pathname.includes('/presentation')) site = 'slides';
        else if (window.location.pathname.includes('/spreadsheets')) site = 'sheets';
        else if (window.location.pathname.includes('/drive')) site = 'drive';
        
        // Create iframe with site parameter
        panel = document.createElement('iframe');
        panel.id = 'teedl-panel';
        panel.src = chrome.runtime.getURL(`panel.html?site=${site}`);
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
    
    // Don't auto-open panel - let user control it
})();
