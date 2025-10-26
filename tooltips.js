// Icon detection and tooltip system for Teedl
(function() {
    'use strict';
    
    let tooltip = null;
    let isTooltipEnabled = true;
    
    // Google Workspace icon database
    const iconDatabase = {
        // Google Docs icons
        'docs-icon-format-bold': {
            name: 'Bold',
            description: 'Makes selected text bold',
            category: 'Formatting'
        },
        'docs-icon-format-italic': {
            name: 'Italic',
            description: 'Makes selected text italic',
            category: 'Formatting'
        },
        'docs-icon-format-underline': {
            name: 'Underline',
            description: 'Underlines selected text',
            category: 'Formatting'
        },
        'docs-icon-format-align-left': {
            name: 'Align Left',
            description: 'Aligns text to the left',
            category: 'Alignment'
        },
        'docs-icon-format-align-center': {
            name: 'Align Center',
            description: 'Centers text alignment',
            category: 'Alignment'
        },
        'docs-icon-format-align-right': {
            name: 'Align Right',
            description: 'Aligns text to the right',
            category: 'Alignment'
        },
        'docs-icon-format-align-justify': {
            name: 'Justify',
            description: 'Justifies text alignment',
            category: 'Alignment'
        },
        'docs-icon-insert-image': {
            name: 'Insert Image',
            description: 'Inserts an image into the document',
            category: 'Insert'
        },
        'docs-icon-insert-table': {
            name: 'Insert Table',
            description: 'Inserts a table into the document',
            category: 'Insert'
        },
        'docs-icon-insert-link': {
            name: 'Insert Link',
            description: 'Inserts a hyperlink',
            category: 'Insert'
        },
        'docs-icon-insert-comment': {
            name: 'Insert Comment',
            description: 'Adds a comment to selected text',
            category: 'Collaboration'
        },
        'docs-icon-share': {
            name: 'Share',
            description: 'Share the document with others',
            category: 'Collaboration'
        },
        'docs-icon-print': {
            name: 'Print',
            description: 'Print the document',
            category: 'File'
        },
        'docs-icon-download': {
            name: 'Download',
            description: 'Download the document',
            category: 'File'
        },
        'docs-icon-undo': {
            name: 'Undo',
            description: 'Undo the last action',
            category: 'Edit'
        },
        'docs-icon-redo': {
            name: 'Redo',
            description: 'Redo the last undone action',
            category: 'Edit'
        },
        'docs-icon-find-replace': {
            name: 'Find and Replace',
            description: 'Find and replace text in the document',
            category: 'Edit'
        },
        'docs-icon-spell-check': {
            name: 'Spell Check',
            description: 'Check spelling in the document',
            category: 'Tools'
        },
        'docs-icon-word-count': {
            name: 'Word Count',
            description: 'Show word count and statistics',
            category: 'Tools'
        },
        'docs-icon-version-history': {
            name: 'Version History',
            description: 'View and restore previous versions',
            category: 'Tools'
        },
        
        // Google Slides icons
        'slides-icon-new-slide': {
            name: 'New Slide',
            description: 'Add a new slide to the presentation',
            category: 'Slides'
        },
        'slides-icon-slide-layout': {
            name: 'Slide Layout',
            description: 'Change the layout of the current slide',
            category: 'Slides'
        },
        'slides-icon-slide-transition': {
            name: 'Slide Transition',
            description: 'Add transition effects between slides',
            category: 'Animation'
        },
        'slides-icon-animate': {
            name: 'Animate',
            description: 'Add animations to slide elements',
            category: 'Animation'
        },
        'slides-icon-present': {
            name: 'Present',
            description: 'Start presenting the slideshow',
            category: 'Presentation'
        },
        'slides-icon-slideshow': {
            name: 'Slideshow',
            description: 'View the presentation in fullscreen',
            category: 'Presentation'
        },
        
        // Google Sheets icons
        'sheets-icon-insert-function': {
            name: 'Insert Function',
            description: 'Insert a formula or function',
            category: 'Formulas'
        },
        'sheets-icon-sum': {
            name: 'Sum',
            description: 'Calculate the sum of selected cells',
            category: 'Formulas'
        },
        'sheets-icon-average': {
            name: 'Average',
            description: 'Calculate the average of selected cells',
            category: 'Formulas'
        },
        'sheets-icon-sort': {
            name: 'Sort',
            description: 'Sort data in ascending or descending order',
            category: 'Data'
        },
        'sheets-icon-filter': {
            name: 'Filter',
            description: 'Filter data based on criteria',
            category: 'Data'
        },
        'sheets-icon-chart': {
            name: 'Insert Chart',
            description: 'Create a chart from selected data',
            category: 'Charts'
        },
        'sheets-icon-freeze': {
            name: 'Freeze',
            description: 'Freeze rows or columns',
            category: 'View'
        },
        'sheets-icon-protect': {
            name: 'Protect Sheet',
            description: 'Protect the sheet from editing',
            category: 'Protection'
        }
    };
    
    // Common Google Workspace icon patterns
    const iconPatterns = [
        // Material Design icon patterns
        { pattern: /material-icons.*format_bold/i, id: 'docs-icon-format-bold' },
        { pattern: /material-icons.*format_italic/i, id: 'docs-icon-format-italic' },
        { pattern: /material-icons.*format_underlined/i, id: 'docs-icon-format-underline' },
        { pattern: /material-icons.*format_align_left/i, id: 'docs-icon-format-align-left' },
        { pattern: /material-icons.*format_align_center/i, id: 'docs-icon-format-align-center' },
        { pattern: /material-icons.*format_align_right/i, id: 'docs-icon-format-align-right' },
        { pattern: /material-icons.*format_align_justify/i, id: 'docs-icon-format-align-justify' },
        { pattern: /material-icons.*image/i, id: 'docs-icon-insert-image' },
        { pattern: /material-icons.*table_chart/i, id: 'docs-icon-insert-table' },
        { pattern: /material-icons.*link/i, id: 'docs-icon-insert-link' },
        { pattern: /material-icons.*comment/i, id: 'docs-icon-insert-comment' },
        { pattern: /material-icons.*share/i, id: 'docs-icon-share' },
        { pattern: /material-icons.*print/i, id: 'docs-icon-print' },
        { pattern: /material-icons.*download/i, id: 'docs-icon-download' },
        { pattern: /material-icons.*undo/i, id: 'docs-icon-undo' },
        { pattern: /material-icons.*redo/i, id: 'docs-icon-redo' },
        { pattern: /material-icons.*find_replace/i, id: 'docs-icon-find-replace' },
        { pattern: /material-icons.*spellcheck/i, id: 'docs-icon-spell-check' },
        { pattern: /material-icons.*functions/i, id: 'sheets-icon-insert-function' },
        { pattern: /material-icons.*add/i, id: 'slides-icon-new-slide' },
        { pattern: /material-icons.*play_arrow/i, id: 'slides-icon-present' },
        { pattern: /material-icons.*bar_chart/i, id: 'sheets-icon-chart' },
        
        // Google Workspace specific patterns
        { pattern: /goog-toolbar-button.*bold/i, id: 'docs-icon-format-bold' },
        { pattern: /goog-toolbar-button.*italic/i, id: 'docs-icon-format-italic' },
        { pattern: /goog-toolbar-button.*underline/i, id: 'docs-icon-format-underline' },
        { pattern: /goog-toolbar-button.*alignleft/i, id: 'docs-icon-format-align-left' },
        { pattern: /goog-toolbar-button.*aligncenter/i, id: 'docs-icon-format-align-center' },
        { pattern: /goog-toolbar-button.*alignright/i, id: 'docs-icon-format-align-right' },
        { pattern: /goog-toolbar-button.*justify/i, id: 'docs-icon-format-align-justify' },
        { pattern: /goog-toolbar-button.*image/i, id: 'docs-icon-insert-image' },
        { pattern: /goog-toolbar-button.*table/i, id: 'docs-icon-insert-table' },
        { pattern: /goog-toolbar-button.*link/i, id: 'docs-icon-insert-link' },
        { pattern: /goog-toolbar-button.*comment/i, id: 'docs-icon-insert-comment' },
        { pattern: /goog-toolbar-button.*share/i, id: 'docs-icon-share' },
        { pattern: /goog-toolbar-button.*print/i, id: 'docs-icon-print' },
        { pattern: /goog-toolbar-button.*download/i, id: 'docs-icon-download' },
        { pattern: /goog-toolbar-button.*undo/i, id: 'docs-icon-undo' },
        { pattern: /goog-toolbar-button.*redo/i, id: 'docs-icon-redo' },
        { pattern: /goog-toolbar-button.*find/i, id: 'docs-icon-find-replace' },
        { pattern: /goog-toolbar-button.*spell/i, id: 'docs-icon-spell-check' },
        
        // Generic button patterns
        { pattern: /button.*bold/i, id: 'docs-icon-format-bold' },
        { pattern: /button.*italic/i, id: 'docs-icon-format-italic' },
        { pattern: /button.*underline/i, id: 'docs-icon-format-underline' },
        { pattern: /button.*align/i, id: 'docs-icon-format-align-left' },
        { pattern: /button.*image/i, id: 'docs-icon-insert-image' },
        { pattern: /button.*table/i, id: 'docs-icon-insert-table' },
        { pattern: /button.*link/i, id: 'docs-icon-insert-link' },
        { pattern: /button.*comment/i, id: 'docs-icon-insert-comment' },
        { pattern: /button.*share/i, id: 'docs-icon-share' },
        { pattern: /button.*print/i, id: 'docs-icon-print' },
        { pattern: /button.*download/i, id: 'docs-icon-download' },
        { pattern: /button.*undo/i, id: 'docs-icon-undo' },
        { pattern: /button.*redo/i, id: 'docs-icon-redo' },
        { pattern: /button.*find/i, id: 'docs-icon-find-replace' },
        { pattern: /button.*spell/i, id: 'docs-icon-spell-check' }
    ];
    
    function detectIcon(element) {
        if (!element) return null;
        
        // Check element's class, id, title, and aria-label
        const classList = element.className || '';
        const id = element.id || '';
        const title = element.title || '';
        const ariaLabel = element.getAttribute('aria-label') || '';
        const textContent = element.textContent || '';
        
        const searchText = `${classList} ${id} ${title} ${ariaLabel} ${textContent}`.toLowerCase();
        
        // Find matching pattern
        for (const pattern of iconPatterns) {
            if (pattern.pattern.test(searchText)) {
                return iconDatabase[pattern.id] || null;
            }
        }
        
        return null;
    }
    
    function createTooltip() {
        if (tooltip) return tooltip;
        
        tooltip = document.createElement('div');
        tooltip.id = 'teedl-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 2147483648;
            max-width: 200px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            line-height: 1.4;
        `;
        
        document.body.appendChild(tooltip);
        return tooltip;
    }
    
    function showTooltip(element, iconInfo) {
        if (!isTooltipEnabled || !iconInfo) return;
        
        const tooltip = createTooltip();
        
        // Clear existing content
        tooltip.textContent = '';
        
        // Create tooltip content elements
        const nameDiv = document.createElement('div');
        nameDiv.style.cssText = 'font-weight: 600; margin-bottom: 2px;';
        nameDiv.textContent = iconInfo.name;
        
        const descDiv = document.createElement('div');
        descDiv.style.cssText = 'opacity: 0.9;';
        descDiv.textContent = iconInfo.description;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.style.cssText = 'font-size: 10px; opacity: 0.7; margin-top: 4px;';
        categoryDiv.textContent = iconInfo.category;
        
        // Append elements to tooltip
        tooltip.appendChild(nameDiv);
        tooltip.appendChild(descDiv);
        tooltip.appendChild(categoryDiv);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.bottom + 38; // 30px margin + 8px original spacing
        
        // Adjust if tooltip goes off screen
        if (left < 8) left = 8;
        if (left + tooltipRect.width > window.innerWidth - 8) {
            left = window.innerWidth - tooltipRect.width - 8;
        }
        if (top + tooltipRect.height > window.innerHeight - 8) {
            top = rect.top - tooltipRect.height - 8;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.opacity = '1';
    }
    
    function hideTooltip() {
        if (tooltip) {
            tooltip.style.opacity = '0';
        }
    }
    
    function addTooltipListeners() {
        // Add hover listeners to all clickable elements
        const elements = document.querySelectorAll('button, [role="button"], .goog-toolbar-button, .material-icons, [class*="icon"], [class*="button"]');
        
        elements.forEach(element => {
            element.addEventListener('mouseenter', function(e) {
                const iconInfo = detectIcon(element);
                if (iconInfo) {
                    showTooltip(element, iconInfo);
                }
            });
            
            element.addEventListener('mouseleave', function(e) {
                hideTooltip();
            });
        });
    }
    
    // Initialize tooltip system
    function initTooltips() {
        console.log('Teedl: Initializing hover tooltips');
        
        // Add listeners to existing elements
        addTooltipListeners();
        
        // Watch for new elements being added
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            if (node.matches && node.matches('button, [role="button"], .goog-toolbar-button, .material-icons, [class*="icon"], [class*="button"]')) {
                                const iconInfo = detectIcon(node);
                                if (iconInfo) {
                                    node.addEventListener('mouseenter', function(e) {
                                        showTooltip(node, iconInfo);
                                    });
                                    node.addEventListener('mouseleave', function(e) {
                                        hideTooltip();
                                    });
                                }
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Toggle tooltips on/off
    function toggleTooltips() {
        isTooltipEnabled = !isTooltipEnabled;
        if (!isTooltipEnabled) {
            hideTooltip();
        }
        console.log('Teedl: Tooltips', isTooltipEnabled ? 'enabled' : 'disabled');
    }
    
    // Expose functions globally
    window.teedlTooltips = {
        init: initTooltips,
        toggle: toggleTooltips,
        detectIcon: detectIcon,
        showTooltip: showTooltip,
        hideTooltip: hideTooltip
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTooltips);
    } else {
        initTooltips();
    }
    
})();
