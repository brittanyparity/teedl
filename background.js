// Background script for Teedl extension
chrome.action.onClicked.addListener(function(tab) {
    // Check if we're on a Google Workspace page
    if (tab.url.includes('docs.google.com') || 
        tab.url.includes('slides.google.com') || 
        tab.url.includes('sheets.google.com') || 
        tab.url.includes('drive.google.com')) {
        
        // Send message to content script to toggle panel
        chrome.tabs.sendMessage(tab.id, {
            action: 'togglePanel'
        }, function(response) {
            if (chrome.runtime.lastError) {
                console.log('Teedl: Could not communicate with content script');
            }
        });
    } else {
        // If not on Google Workspace, open a new tab to docs.google.com
        chrome.tabs.create({
            url: 'https://docs.google.com/document/create'
        });
    }
});
