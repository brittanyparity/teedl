(async function(){
	function getSite(){
		try{ 
			const url = new URL(location.href);
			const pathname = url.pathname;
			
			// Detect Google Workspace site from iframe context
			if (pathname.includes('/document')) return 'docs';
			if (pathname.includes('/presentation')) return 'slides';
			if (pathname.includes('/spreadsheets')) return 'sheets';
			if (pathname.includes('/drive')) return 'drive';
			
			// Fallback to URL parameter or generic
			return url.searchParams.get('site') || 'docs';
		} catch(_){ 
			return 'docs'; 
		}
	}
	function uuid(){
		return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
	}
	async function getAnonId(){
		return new Promise(resolve=>{
			chrome.storage.local.get(['teedl_anon_id'], v=>{
				if (v && v.teedl_anon_id) return resolve(v.teedl_anon_id);
				var id = uuid();
				chrome.storage.local.set({ teedl_anon_id: id }, ()=> resolve(id));
			});
		});
	}
	async function postEvent(host, body){
		try{
await fetch(host.replace(/\/$/, '') + '/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
		}catch(_){ }
	}

	const site = getSite();
console.log('Teedl: Detected site:', site);
	const titleEl = document.getElementById('title');
	const list = document.getElementById('t-steps');
	const progress = document.getElementById('progress');
	const state = { title: '', steps: [], idx: 0 };
	const HOST = (await new Promise(r=> chrome.storage.local.get(['teedl_host'], v=> r((v && v.teedl_host) || 'http://localhost:3000'))));
	const anonId = await getAnonId();

// Paywall state
const DATASET_SITES = ['docs', 'slides', 'sheets', 'classroom', 'gmail', 'fafsa', 'replit'];
const AI_LIMIT = 10; // Free tier limit per month
const isDatasetSite = DATASET_SITES.includes(site);
let isSubscribed = localStorage.getItem('teedl_subscribed') === 'true';
let aiUsed = parseInt(localStorage.getItem('teedl_ai_used') || '0', 10);
const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
const lastResetMonth = localStorage.getItem('teedl_last_reset_month') || currentMonth;

// Guide data
const guideData = [
	{
		id: 'docs-guide',
		title: 'Google Docs Master Guide',
		steps: [
			'Open Google Docs and create a new document',
			'Set up your document with proper formatting',
			'Use headings and styles for structure',
			'Insert images, tables, and links',
			'Collaborate with comments and suggestions',
			'Use version history to track changes',
			'Share and set permissions for your document',
			'Export in multiple formats (PDF, Word, etc.)',
			'Use add-ons to extend functionality'
		],
		moreSteps: 0
	},
	{
		id: 'slides-guide',
		title: 'Google Slides Presentation Guide',
		steps: [
			'Create a new presentation in Google Slides',
			'Choose and customize a professional template',
			'Add and format text content effectively',
			'Insert images, videos, and animations',
			'Design consistent slide layouts',
			'Add smooth transitions between slides',
			'Practice and present your slideshow',
			'Share and collaborate with your team',
			'Export and download in various formats'
		],
		moreSteps: 0
	},
	{
		id: 'sheets-guide',
		title: 'Google Sheets Data Management',
		steps: [
			'Create a new Google Sheets spreadsheet',
			'Enter and organize your data efficiently',
			'Use formulas and functions for calculations',
			'Create charts and data visualizations',
			'Apply conditional formatting for insights',
			'Filter, sort, and analyze your data',
			'Collaborate with real-time editing',
			'Protect sheets and ranges as needed',
			'Export and share your spreadsheet'
		],
		moreSteps: 0
	}
];

// Keyword data
const keywordData = [
	{
		id: 1,
		title: 'Document Formatting',
		description: 'Master text formatting, headings, styles, and layout in Google Docs. Create professional-looking documents with ease.'
	},
	{
		id: 2,
		title: 'Real-time Collaboration',
		description: 'Work together with your team in real-time. See changes as they happen, add comments, and track who made what changes.'
	},
	{
		id: 3,
		title: 'Presentation Design',
		description: 'Create stunning presentations with themes, layouts, animations, and transitions. Make your slides stand out professionally.'
	},
	{
		id: 4,
		title: 'Data Analysis',
		description: 'Use formulas, functions, charts, and pivot tables to analyze your data. Turn numbers into actionable insights.'
	},
	{
		id: 5,
		title: 'Sharing & Permissions',
		description: 'Control who can view, comment, or edit your documents. Share with specific people or make them public with custom permissions.'
	},
	{
		id: 6,
		title: 'Version Control',
		description: 'Track all changes with version history. Restore previous versions, see who made changes, and never lose your work.'
	},
	{
		id: 7,
		title: 'Templates & Themes',
		description: 'Start with professional templates and themes. Maintain brand consistency across all your Google Workspace documents.'
	},
	{
		id: 8,
		title: 'Export & Download',
		description: 'Export your work in multiple formats: PDF, Word, PowerPoint, Excel. Ensure compatibility across different platforms.'
	},
	{
		id: 9,
		title: 'Mobile Access',
		description: 'Access and edit your documents on mobile devices. Work from anywhere with full functionality on smartphones and tablets.'
	},
	{
		id: 10,
		title: 'Add-ons & Extensions',
		description: 'Enhance your productivity with thousands of add-ons. From grammar checkers to advanced charting tools, extend Google Workspace.'
	}
];

// Icon data
const iconData = [
	{ id: 1, title: 'Google Docs', description: 'Create and edit documents', icon: '📄', category: 'google-workspace' },
	{ id: 2, title: 'Google Slides', description: 'Create presentations', icon: '📊', category: 'google-workspace' },
	{ id: 3, title: 'Google Sheets', description: 'Manage spreadsheets', icon: '📈', category: 'google-workspace' },
	{ id: 4, title: 'Format Text', description: 'Bold, italic, underline', icon: '✏️', category: 'formatting' },
	{ id: 5, title: 'Insert Table', description: 'Add tables to documents', icon: '📋', category: 'formatting' },
	{ id: 6, title: 'Add Images', description: 'Insert photos and graphics', icon: '🖼️', category: 'media' },
	{ id: 7, title: 'Share Document', description: 'Collaborate with others', icon: '👥', category: 'collaboration' },
	{ id: 8, title: 'Comments', description: 'Add feedback and notes', icon: '💬', category: 'collaboration' },
	{ id: 9, title: 'Version History', description: 'Track document changes', icon: '🕒', category: 'tools' },
	{ id: 10, title: 'Export', description: 'Download in different formats', icon: '💾', category: 'tools' }
];

// Reset counter if new month
if (lastResetMonth !== currentMonth) {
localStorage.setItem('teedl_ai_used', '0');
localStorage.setItem('teedl_last_reset_month', currentMonth);
aiUsed = 0;
}

	function normalize(data){
		if (Array.isArray(data)) return { title: '', steps: data };
		if (data && Array.isArray(data.steps)) return { title: data.title || '', steps: data.steps };
		return { title: '', steps: [] };
	}

function track(type, extra){
var payload = Object.assign({ anon_id: anonId, event_type: type, site: site, ts: new Date().toISOString() }, extra||{});
postEvent(HOST, payload);
	}

// Make functions globally accessible
window.track = track;

	function render(){
console.log('Teedl: Rendering steps:', state.steps);
// Re-get the list element to ensure it exists
var currentList = document.getElementById('t-steps');
if (!currentList) {
console.error('Teedl: t-steps element not found!');
return;
}
currentList.innerHTML='';
		for (var i=0;i<state.steps.length;i++){
			var li = document.createElement('li');
			li.textContent = state.steps[i];
			if (i === state.idx) li.style.fontWeight='600';
currentList.appendChild(li);
}
// Update title in app bar (if it exists)
var titleEl = document.querySelector('.app-title');
if (titleEl) {
titleEl.textContent = 'Teedl';
}
// Update progress (if it exists)
var progressEl = document.getElementById('progress');
if (progressEl) {
progressEl.textContent = 'Step ' + (state.steps.length ? (state.idx+1) : 0) + ' of ' + (state.steps.length || 0);
}
}

function updateCounterDisplay(){
const counterEl = document.getElementById('ai-counter');
if (counterEl) counterEl.textContent = aiUsed;
}

function renderGuides(){
	console.log('Teedl: Rendering guides');
	var guidesContainer = document.querySelector('.guides-container');
	if (!guidesContainer) {
		console.error('Teedl: Guides container not found!');
		return;
	}
	guidesContainer.innerHTML = '';
	
	for (var i = 0; i < guideData.length; i++) {
		var guide = guideData[i];
		var card = document.createElement('div');
		card.className = 'guide-card';
		card.innerHTML = `
			<div class="guide-title">${guide.title}</div>
			
			<div class="media-container">
				<div class="media-placeholder"></div>
			</div>
			
			<div class="steps-content">
				${guide.steps.slice(0, 3).map(function(step, index) {
					return `
						<div class="step-item">
							<p>Step ${index + 1}: ${step}</p>
						</div>
					`;
				}).join('')}
				<div class="more-steps">+ ${guide.steps.length - 3 + guide.moreSteps} more steps</div>
			</div>
			
			<button class="start-guide-btn">
				<span class="start-guide-text">Start Guide</span>
				<span class="arrow-icon">→</span>
			</button>
		`;
		
		card.addEventListener('click', function(e) {
			if (e.target.closest('.start-guide-btn')) {
				track('guide_start_click', { guide_id: guide.id, guide_title: guide.title });
				showGuideStep(guide.id, 1); // Start with step 1
			}
		});
		
		guidesContainer.appendChild(card);
	}
}

function showGuideStep(guideId, stepNumber) {
	console.log('Teedl: Showing guide step', guideId, stepNumber);
	
	// Hide all tab content
	document.getElementById('guides-content').style.display = 'none';
	document.getElementById('icons-content').style.display = 'none';
	document.getElementById('keywords-content').style.display = 'none';
	
	// Add class to disable main content scrolling
	document.getElementById('content').classList.add('guide-step-active');
	
	// Show guide step content
	const stepContent = document.getElementById('guide-step-content');
	stepContent.style.display = 'flex';
	
	// Find the guide data
	const guide = guideData.find(g => g.id === guideId);
	if (!guide) {
		console.error('Teedl: Guide not found', guideId);
		return;
	}
	
	// Calculate progress
	const totalSteps = guide.steps.length + guide.moreSteps;
	const progressPercentage = Math.round((stepNumber / totalSteps) * 100);
	
	// Render step content
	const stepContainer = document.querySelector('.step-container');
	stepContainer.innerHTML = `
		<div class="content-menu-bar">
			<button class="back-button" onclick="console.log('Back button clicked!'); goBackToGuides();">
				<span class="back-icon">←</span>
			</button>
		</div>
		
		<div class="step-scrollable-content">
			<div class="step-header">
				<div class="step-number">STEP ${stepNumber} :</div>
				<div class="step-title">${guide.steps[stepNumber - 1] || 'Additional Step'}</div>
			</div>
			
			<div class="step-media-container">
				<div class="step-media-placeholder"></div>
			</div>
			
			<div class="step-description">
				<p>${getStepDescription(guide.id, stepNumber)}</p>
				<p>&nbsp;</p>
				<p>Follow the instructions above to complete this step. Take your time to understand each part before moving on to the next step. If you need help, you can always go back to review previous steps or use the navigation buttons below.</p>
			</div>
		</div>
		
		<div class="progress-section">
			<div class="progress-header">
				<div class="step-progress-text">Step ${stepNumber} of ${totalSteps}</div>
				<div class="progress-percentage">${progressPercentage}%</div>
			</div>
			<div class="progress-bar-container">
				<div class="progress-bar-fill" style="width: ${progressPercentage}%"></div>
			</div>
		</div>
	`;
	
	// Add navigation buttons outside the step container
	const navigationButtons = document.createElement('div');
	navigationButtons.className = 'navigation-buttons';
	
	// Determine if this is the last step
	const isLastStep = stepNumber >= totalSteps;
	
	// Create onclick handlers separately to avoid template literal issues
	const prevOnClick = `console.log('Previous button clicked!'); console.log('navigateStep function available:', typeof window.navigateStep); navigateStep('${guideId}', ${stepNumber - 1})`;
	const nextOnClick = isLastStep 
		? `console.log('Complete button clicked!'); console.log('completeGuide function available:', typeof window.completeGuide); completeGuide();`
		: `console.log('Next button clicked!'); console.log('navigateStep function available:', typeof window.navigateStep); navigateStep('${guideId}', ${stepNumber + 1});`;
	
	navigationButtons.innerHTML = `
		<button class="nav-button previous" onclick="${prevOnClick}" ${stepNumber <= 1 ? 'disabled' : ''}>
			<span class="nav-icon">‹</span>
			<span class="nav-button-text">Previous</span>
		</button>
		<button class="nav-button ${isLastStep ? 'complete' : 'next'}" onclick="${nextOnClick}" ${!isLastStep && stepNumber >= totalSteps ? 'disabled' : ''}>
			${isLastStep ? '<span class="nav-icon">✓</span>' : ''}
			<span class="nav-button-text">${isLastStep ? 'Complete' : 'Next'}</span>
			${!isLastStep ? '<span class="nav-icon">›</span>' : ''}
		</button>
	`;
	
	console.log('Created navigation buttons for step', stepNumber, 'of', totalSteps);
	console.log('Previous button disabled:', stepNumber <= 1);
	console.log('Next button disabled:', stepNumber >= totalSteps);
	console.log('Is last step:', isLastStep);
	
	// Debug the actual onclick attributes
	setTimeout(() => {
		const nextButton = navigationButtons.querySelector('.nav-button.next, .nav-button.complete');
		if (nextButton) {
			console.log('Next/Complete button onclick:', nextButton.getAttribute('onclick'));
		}
	}, 100);
	
	// Remove any existing navigation buttons
	const existingNavButtons = document.querySelector('.navigation-buttons');
	if (existingNavButtons) {
		existingNavButtons.remove();
	}
	
	// Add navigation buttons to the panel
	document.getElementById('content').appendChild(navigationButtons);
	
	track('guide_step_view', { guide_id: guideId, step_number: stepNumber, total_steps: totalSteps });
}

// Function to get detailed step descriptions
function getStepDescription(guideId, stepNumber) {
	const stepDescriptions = {
		1: { // Google Docs
			1: "Navigate to docs.google.com in your web browser. Make sure you're signed in to your Google account. You can also access Google Docs through the Google Apps menu (the 9-dot grid) in the top-right corner of any Google page.",
			2: "Click on the '+ Blank' option or choose from one of the available templates. You can also use the 'Blank document' option to start with a completely empty document.",
			3: "Click anywhere in the document area and start typing your content. The cursor will appear where you click, and you can begin writing immediately.",
			4: "Select the text you want to format, then use the formatting toolbar at the top. Click 'B' for bold, 'I' for italic, or 'U' for underline. You can also use keyboard shortcuts: Ctrl+B for bold, Ctrl+I for italic.",
			5: "Use the 'Normal text' dropdown in the toolbar to select heading styles. Choose 'Heading 1' for main titles, 'Heading 2' for subtitles, and so on. This helps organize your document structure.",
			6: "Go to 'Insert' in the menu bar, then select 'Image' to upload photos, or 'Table' to create data tables. You can also insert charts, drawings, and other elements from the Insert menu.",
			7: "Click the 'Share' button in the top-right corner. Enter email addresses of people you want to share with, choose their permission level (view, comment, or edit), and click 'Send'.",
			8: "Select text and click the comment icon, or right-click and select 'Comment'. Others can reply to comments and make suggestions. Use 'Suggesting' mode to make trackable changes.",
			9: "Go to 'File' > 'Download' and choose your preferred format (PDF, Word, etc.). The document will be downloaded to your computer in the selected format."
		},
		2: { // Google Slides
			1: "Go to slides.google.com in your browser or access it through the Google Apps menu. Make sure you're signed in to your Google account.",
			2: "Browse through the available templates or start with a blank presentation. Templates provide pre-designed layouts and themes to make your presentation look professional.",
			3: "Click on the slide thumbnail in the left panel, then add your content. You can also click the '+' button to add new slides or use the 'Layout' option to change the slide structure.",
			4: "Go to 'Insert' > 'Text box' to add text areas, or 'Insert' > 'Shape' to add rectangles, circles, arrows, and other shapes. Click and drag to position them on your slide.",
			5: "Use 'Insert' > 'Image' to add pictures from your computer, Google Drive, or web search. For videos, use 'Insert' > 'Video' and choose from YouTube or your Google Drive.",
			6: "Click 'Theme' in the toolbar to change colors and fonts, or 'Layout' to modify the slide structure. Themes give your entire presentation a consistent look and feel.",
			7: "Select a slide, go to 'Slide' > 'Transition' to add slide transitions, or 'Insert' > 'Animation' to animate individual elements. Keep animations subtle for professional presentations.",
			8: "Use 'Present' mode to practice your presentation. You can see speaker notes, use a laser pointer, and get a timer. Practice helps you deliver confidently.",
			9: "Click 'Share' to collaborate with others in real-time. You can also use 'File' > 'Publish to the web' to create a shareable link that updates automatically."
		},
		3: { // Google Sheets
			1: "Navigate to sheets.google.com or access it through the Google Apps menu. Sign in to your Google account to get started.",
			2: "Click '+ Blank' to create a new spreadsheet, or choose from templates for budgets, schedules, or other common uses. Templates save time and provide good starting structures.",
			3: "Click on any cell and start typing. Press Enter to move down, Tab to move right, or use arrow keys to navigate between cells. You can also copy and paste data from other sources.",
			4: "Select cells and use the formatting toolbar to change font, size, color, alignment, and cell background. You can also format numbers as currency, percentages, or dates.",
			5: "Start any formula with an equals sign (=). For example, =SUM(A1:A10) adds up cells A1 through A10. Use the function button (fx) to browse available formulas.",
			6: "Select your data, then go to 'Insert' > 'Chart' to create visual representations. Choose from bar charts, pie charts, line graphs, and more. Charts help visualize your data.",
			7: "Select a column and use 'Data' > 'Sort sheet' to organize your information. Use 'Data' > 'Create a filter' to show only specific rows based on criteria you set.",
			8: "Click 'Share' to give others access to view or edit your spreadsheet. Use 'File' > 'Protect sheets and ranges' to prevent accidental changes to important data.",
			9: "Go to 'File' > 'Download' to save your spreadsheet as an Excel file, PDF, or other format. This ensures compatibility with other programs and makes sharing easier."
		}
	};
	
	return stepDescriptions[guideId] && stepDescriptions[guideId][stepNumber] 
		? stepDescriptions[guideId][stepNumber] 
		: `This is step ${stepNumber} of the guide. Follow the instructions above to complete this step.`;
}

// Make functions globally accessible
window.showGuideStep = showGuideStep;

function goBackToGuides() {
	console.log('Teedl: Going back to guides - function called');
	
	try {
		// Hide guide step content
		const guideStepContent = document.getElementById('guide-step-content');
		if (guideStepContent) {
			guideStepContent.style.display = 'none';
			console.log('Hidden guide step content');
		} else {
			console.error('Guide step content not found');
		}
		
		// Remove class to re-enable main content scrolling
		const content = document.getElementById('content');
		if (content) {
			content.classList.remove('guide-step-active');
			console.log('Removed guide-step-active class');
		} else {
			console.error('Content element not found');
		}
		
		// Remove navigation buttons
		const existingNavButtons = document.querySelector('.navigation-buttons');
		if (existingNavButtons) {
			existingNavButtons.remove();
			console.log('Removed navigation buttons');
		}
		
		// Show guides content
		const guidesContent = document.getElementById('guides-content');
		if (guidesContent) {
			guidesContent.style.display = 'block';
			console.log('Showed guides content');
		} else {
			console.error('Guides content not found');
		}
		
		track('guide_back_to_list');
		console.log('Successfully navigated back to guides');
	} catch (error) {
		console.error('Error in goBackToGuides:', error);
	}
}

// Make functions globally accessible
window.goBackToGuides = goBackToGuides;

// Test if function is accessible
console.log('goBackToGuides function available:', typeof window.goBackToGuides);

function navigateStep(guideId, stepNumber) {
	console.log('navigateStep called with guideId:', guideId, 'stepNumber:', stepNumber);
	
	const guide = guideData.find(g => g.id === guideId);
	if (!guide) {
		console.error('Guide not found for ID:', guideId);
		return;
	}
	
	const totalSteps = guide.steps.length + guide.moreSteps;
	console.log('Total steps for guide:', totalSteps);
	
	// Validate step number
	if (stepNumber < 1 || stepNumber > totalSteps) {
		console.log('Invalid step number:', stepNumber, 'Valid range: 1 to', totalSteps);
		return;
	}
	
	console.log('Navigating to step', stepNumber, 'of', totalSteps);
	// Show the new step
	showGuideStep(guideId, stepNumber);
}

// Function to complete the guide and return to main page
function completeGuide() {
	console.log('Guide completed! Returning to main guides page.');
	
	// Track guide completion
	track('guide_completed');
	
	// Use the same logic as goBackToGuides to return to main page
	goBackToGuides();
}

// Make functions globally accessible
window.navigateStep = navigateStep;
window.completeGuide = completeGuide;

function renderKeywords(){
	console.log('Teedl: Rendering keywords');
	var keywordsContainer = document.querySelector('.keywords-container');
	if (!keywordsContainer) {
		console.error('Teedl: Keywords container not found!');
		return;
	}
	keywordsContainer.innerHTML = '';
	
	for (var i = 0; i < keywordData.length; i++) {
		var keyword = keywordData[i];
		var card = document.createElement('div');
		card.className = 'keyword-card';
		card.innerHTML = `
			<div class="keyword-title">${keyword.title}</div>
			<div class="keyword-description">${keyword.description}</div>
		`;
		
		card.addEventListener('click', function() {
			track('keyword_click', { keyword_id: keyword.id, keyword_title: keyword.title });
		});
		
		keywordsContainer.appendChild(card);
	}
}

function getIconEmoji(iconName) {
	const iconMap = {
		'smartphone': '📱',
		'monitor': '🖥️',
		'globe': '🌐',
		'settings': '⚙️',
		'bar-chart-3': '📊',
		'shield': '🔒',
		'user': '👤',
		'bell': '🔔',
		'search': '🔍',
		'download': '⬇️'
	};
	return iconMap[iconName] || '📄';
}

function renderIcons(){
	console.log('Teedl: Rendering icons');
	var iconsContainer = document.querySelector('.icons-container');
	if (!iconsContainer) {
		console.error('Teedl: Icons container not found!');
		return;
	}
iconsContainer.innerHTML = '';
for (var i = 0; i < iconData.length; i++) {
var icon = iconData[i];
var card = document.createElement('div');
card.className = 'icon-card';
		card.innerHTML = `
				<div class="icon-avatar">${getIconEmoji(icon.icon)}</div>
<div class="icon-content">
<div class="icon-title">${icon.title}</div>
<div class="icon-description">${icon.description}</div>
</div>
				<div class="icon-media">${getIconEmoji(icon.icon)}</div>
`;
card.addEventListener('click', function() {
track('icon_click', { icon_id: icon.id, icon_title: icon.title });
console.log('Icon clicked:', icon.title);
});
iconsContainer.appendChild(card);
}
}

function renderDebugPanel(){
var debugPanel = document.createElement('div');
debugPanel.style.cssText = 'position:sticky;top:0;z-index:15;background:#f8f9fa;border-bottom:1px solid #dee2e6;padding:8px 12px;font-size:12px;';
debugPanel.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><strong>Debug Panel</strong><span>Site: ' + site + ' | Dataset: ' + (isDatasetSite ? 'Yes' : 'No') + '</span></div><div style="display:flex;gap:8px;align-items:center;"><span>AI Used: <strong id="ai-counter">' + aiUsed + '</strong>/' + AI_LIMIT + '</span><button id="test-ai" style="padding:4px 8px;border:1px solid #007bff;background:#007bff;color:#fff;border-radius:4px;cursor:pointer;font-size:11px;">Test AI Task</button><button id="reset-counter" style="padding:4px 8px;border:1px solid #6c757d;background:#6c757d;color:#fff;border-radius:4px;cursor:pointer;font-size:11px;">Reset</button></div>';
document.getElementById('content').prepend(debugPanel);

document.getElementById('test-ai').onclick = function(){
if (isDatasetSite) {
if (!isSubscribed && aiUsed >= AI_LIMIT) {
// Make banner glow instead of showing alert
var banner = document.querySelector('[id*="paywall1"]');
if (banner) {
banner.style.animation = 'glow 0.5s ease-in-out';
setTimeout(() => {
banner.style.animation = '';
}, 500);
}
return;
}
aiUsed++;
localStorage.setItem('teedl_ai_used', aiUsed.toString());
updateCounterDisplay();
track('ai_usage', { count: aiUsed, limit: AI_LIMIT });

// Check if limit reached and show paywall
if (!isSubscribed && aiUsed >= AI_LIMIT) {
showPaywall1Banner();
track('paywall1_shown', { ai_used: aiUsed, limit: AI_LIMIT });
}
} else {
alert('AI task generation only available for dataset sites');
}
};

document.getElementById('reset-counter').onclick = function(){
aiUsed = 0;
localStorage.setItem('teedl_ai_used', '0');
updateCounterDisplay();
// Remove any existing paywall banner
var existingBanner = document.querySelector('[id*="paywall1"]');
if (existingBanner) existingBanner.remove();
};
}

function updateFooter(){
var footer = document.querySelector('footer');
if (!footer) return;

// Clear existing footer content
footer.innerHTML = '';

// Create left side navigation
var nav = document.createElement('div');
nav.className = 'nav';
nav.innerHTML = '<button id="t-back">Back</button><button id="t-next">Next</button>';

// Create right side buttons
var rightSide = document.createElement('div');
rightSide.innerHTML = '<button id="t-feedback">Feedback</button><button id="t-close">Close</button>';

// Create main button row
var buttonRow = document.createElement('div');
buttonRow.style.display = 'flex';
buttonRow.style.justifyContent = 'space-between';
buttonRow.style.alignItems = 'center';
buttonRow.appendChild(nav);
buttonRow.appendChild(rightSide);

footer.appendChild(buttonRow);

// Add Upgrade button below other buttons if not subscribed
if (!isSubscribed) {
var upgradeRow = document.createElement('div');
upgradeRow.style.marginTop = '8px';
upgradeRow.style.display = 'flex';
upgradeRow.style.justifyContent = 'center';

var upgradeBtn = document.createElement('button');
upgradeBtn.id = 't-upgrade';
upgradeBtn.textContent = 'Upgrade';
upgradeBtn.style.padding = '10px 16px';
upgradeBtn.style.border = '1px solid #28a745';
upgradeBtn.style.background = '#28a745';
upgradeBtn.style.color = '#fff';
upgradeBtn.style.borderRadius = '6px';
upgradeBtn.style.cursor = 'pointer';
upgradeBtn.style.width = '80%';
upgradeBtn.style.display = 'block';
upgradeBtn.style.fontSize = '14px';
upgradeBtn.style.fontWeight = '600';
upgradeBtn.onclick = function(){
track('upgrade_button_click');
showSubscriptionForm();
};

upgradeRow.appendChild(upgradeBtn);
footer.appendChild(upgradeRow);
}

// Re-attach event listeners
document.getElementById('t-next').onclick = function(){
if (state.steps.length && state.idx < state.steps.length-1) {
state.idx++;
render();
track('step_view', { step_idx: state.idx });
} else {
track('step_complete', { step_idx: state.idx });
}
};
document.getElementById('t-back').onclick = function(){
if (state.steps.length && state.idx>0){
state.idx--;
render();
track('step_view', { step_idx: state.idx });
}
};
document.getElementById('t-close').onclick = function(){
track('panel_close');
// Try multiple ways to close the panel
try {
var f = parent.document.getElementById('teedl-panel'); 
if(f) f.remove();
} catch(e) {
try {
var f = window.parent.document.getElementById('teedl-panel'); 
if(f) f.remove();
} catch(e2) {
try {
var f = top.document.getElementById('teedl-panel'); 
if(f) f.remove();
} catch(e3) {
console.log('Could not close panel:', e3);
}
}
}
};
document.getElementById('t-feedback').onclick = function(){
track('open_feedback');
parent.open(HOST.replace(/\/$/,'') + '/feedback','_blank');
};
	}

	async function loadSteps(){
console.log('Teedl: Loading steps for site:', site);
		
		// Use local guideData instead of fetching from remote
		const guide = guideData.find(g => g.id === site + '-guide');
		if (guide) {
			console.log('Teedl: Found local guide:', guide.title);
			return {
				title: guide.title,
				steps: guide.steps
			};
		}
		
		console.log('Teedl: No local guide found for site:', site);
		return { title: '', steps: [] };
	}

function showSubscriptionForm(){
var content = document.getElementById('content');
if (!content) return;
content.innerHTML = '';
var box = document.createElement('div');
Object.assign(box.style, { 
padding:'20px', 
lineHeight:'1.55', 
textAlign:'center',
overflowX: 'hidden',
maxWidth: '100%'
});

var icon = document.createElement('div');
icon.innerHTML = '';
icon.style.fontSize = '48px';
icon.style.marginBottom = '16px';

var h = document.createElement('h2'); 
h.style.fontWeight='600'; 
h.style.marginBottom='8px'; 
h.style.color='#333';
h.textContent = "Subscribe to Teedl";

var p = document.createElement('p'); 
p.style.marginBottom='20px'; 
p.style.color='#666';
p.textContent = "Get unlimited AI-powered guides for all supported sites.";

var form = document.createElement('form');
form.style.maxWidth = '280px';
form.style.margin = '0 auto';
form.style.overflowX = 'hidden';

var name = document.createElement('input'); 
name.placeholder='Your name'; 
name.style.display='block'; 
name.style.width='100%'; 
name.style.margin='8px 0'; 
name.style.padding='12px 16px'; 
name.style.border='1px solid #ddd'; 
name.style.borderRadius='8px';
name.style.fontSize = '14px';
name.style.boxSizing = 'border-box';

var email = document.createElement('input'); 
email.placeholder='Your email'; 
email.type='email'; 
email.style.display='block'; 
email.style.width='100%'; 
email.style.margin='8px 0'; 
email.style.padding='12px 16px'; 
email.style.border='1px solid #ddd'; 
email.style.borderRadius='8px';
email.style.fontSize = '14px';
email.style.boxSizing = 'border-box';

var subscribe = document.createElement('button'); 
subscribe.textContent='Subscribe Now'; 
subscribe.type='button';
subscribe.style.padding='12px 20px'; 
subscribe.style.border='1px solid #28a745'; 
subscribe.style.background='#28a745'; 
subscribe.style.color='#fff'; 
subscribe.style.borderRadius='8px'; 
subscribe.style.cursor='pointer';
subscribe.style.fontSize = '14px';
subscribe.style.width = '100%';
subscribe.style.marginTop = '16px';
subscribe.onclick = function(){ 
if (!email.value.trim()) { alert('Please enter your email'); return; }
if (!name.value.trim()) { alert('Please enter your name'); return; }
track('subscription_form_submit', { name: name.value, email: email.value }); 
isSubscribed = true;
localStorage.setItem('teedl_subscribed', 'true');
alert('Thank you for subscribing! You now have unlimited AI guides.');
location.reload();
};

form.appendChild(name); 
form.appendChild(email); 
form.appendChild(subscribe);

box.appendChild(icon);
box.appendChild(h); 
box.appendChild(p); 
box.appendChild(form);
content.appendChild(box);

// Update footer with back button
var footer = document.querySelector('footer');
if (footer) {
footer.style.display = 'flex';
footer.style.flexDirection = 'column';
footer.style.gap = '8px';
footer.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;"><div class="nav"><button id="t-back">Back</button></div><div><button id="t-close" style="padding:8px 10px;border:1px solid #ddd;background:#fff;border-radius:6px;cursor:pointer;">Close</button></div></div>';

// Add back button functionality
document.getElementById('t-back').onclick = function(){
track('subscription_back_click');
// Go back to guided steps - restore the content
restoreGuidedSteps();
};

// Add close button functionality
document.getElementById('t-close').onclick = function(){
track('panel_close');
// Try multiple ways to close the panel
try {
var f = parent.document.getElementById('teedl-panel'); 
if(f) f.remove();
} catch(e) {
try {
var f = window.parent.document.getElementById('teedl-panel'); 
if(f) f.remove();
} catch(e2) {
try {
var f = top.document.getElementById('teedl-panel'); 
if(f) f.remove();
} catch(e3) {
console.log('Could not close panel:', e3);
}
}
}
};
}

titleEl.textContent = 'Teedl  Subscribe';
progress.textContent='';
}

function restoreGuidedSteps(){
console.log('Teedl: Restoring guided steps, current state:', state);

// Clear content but preserve the essential structure
var content = document.getElementById('content');
if (!content) {
console.error('Teedl: Content element not found!');
return;
}

// Clear content but recreate the steps container
content.innerHTML = '';

// Recreate the steps container
var stepsContainer = document.createElement('ol');
stepsContainer.id = 't-steps';
stepsContainer.style.cssText = 'margin:0;padding:12px 28px;line-height:1.55';
content.appendChild(stepsContainer);

// Re-render debug panel
renderDebugPanel();

// Re-render guided steps
console.log('Teedl: About to render steps, state.steps:', state.steps);
render();

// Check if we need to show paywall banner based on current state
if (isDatasetSite && !isSubscribed && aiUsed >= AI_LIMIT) {
console.log('Teedl: Showing paywall banner on restore, aiUsed:', aiUsed, 'limit:', AI_LIMIT);
showPaywall1Banner();
}

// Update footer
updateFooter();

// Update title and progress
titleEl.textContent = (state.title ? ('Teedl � ' + state.title) : 'Teedl  Guided Steps');
progress.textContent = 'Step ' + (state.steps.length ? (state.idx+1) : 0) + ' of ' + (state.steps.length || 0);
}

function showPaywall1Banner(){
console.log('Teedl: Showing Paywall #1 banner');
// Remove any existing banner first
var existingBanner = document.querySelector('[id*="paywall1"]');
if (existingBanner) existingBanner.remove();

var banner = document.createElement('div');
banner.id = 'paywall1-banner';
Object.assign(banner.style, { 
position:'sticky', top:'0', zIndex:'10', 
background:'#fff7e6', borderBottom:'1px solid #f2e7cc', 
padding:'12px 16px', fontSize:'13px', color:'#8a5a00',
display:'flex', justifyContent:'space-between', alignItems:'center',
transition: 'all 0.3s ease'
});
banner.innerHTML = '<div><strong>AI Limit Reached</strong><br>You have used ' + AI_LIMIT + ' free AI guides this month. Subscribe to unlock unlimited guides for supported sites.</div><button id="paywall1-subscribe" style="padding:6px 12px;border:1px solid #8a5a00;background:#fff;color:#8a5a00;border-radius:6px;cursor:pointer;font-size:12px;white-space:nowrap">Subscribe</button>';
document.getElementById('content').prepend(banner);
document.getElementById('paywall1-subscribe').onclick = function(){
track('paywall1_subscribe_click');
showSubscriptionForm();
};
}

function showPaywall2Form(){
console.log('Teedl: Showing Paywall #2 form');
var content = document.getElementById('content');
if (!content) return;
content.innerHTML = '';
var box = document.createElement('div');
Object.assign(box.style, { 
padding:'20px', 
lineHeight:'1.55', 
textAlign:'center',
overflowX: 'hidden',
maxWidth: '100%'
});

var icon = document.createElement('div');
icon.innerHTML = '??';
icon.style.fontSize = '48px';
icon.style.marginBottom = '16px';

var h = document.createElement('h2'); 
h.style.fontWeight='600'; 
h.style.marginBottom='8px'; 
h.style.color='#333';
h.textContent = "Guides for this site aren't available yet";

var p = document.createElement('p'); 
p.style.marginBottom='20px'; 
p.style.color='#666';
p.textContent = "Upgrade to unlock AI-powered guides for this site. Leave your email and we'll notify you when it's ready.";

var form = document.createElement('form');
form.style.maxWidth = '280px';
form.style.margin = '0 auto';
form.style.overflowX = 'hidden';

var name = document.createElement('input'); 
name.placeholder='Your name'; 
name.style.display='block'; 
name.style.width='100%'; 
name.style.margin='8px 0'; 
name.style.padding='12px 16px'; 
name.style.border='1px solid #ddd'; 
name.style.borderRadius='8px';
name.style.fontSize = '14px';
name.style.boxSizing = 'border-box';

var email = document.createElement('input'); 
email.placeholder='Your email'; 
email.type='email'; 
email.style.display='block'; 
email.style.width='100%'; 
email.style.margin='8px 0'; 
email.style.padding='12px 16px'; 
email.style.border='1px solid #ddd'; 
email.style.borderRadius='8px';
email.style.fontSize = '14px';
email.style.boxSizing = 'border-box';

var row = document.createElement('div'); 
row.style.display='flex'; 
row.style.gap='8px';
row.style.marginTop='16px';
row.style.overflowX = 'hidden';

var upgrade = document.createElement('button'); 
upgrade.textContent='Upgrade Now'; 
upgrade.type='button';
upgrade.style.padding='12px 16px';
upgrade.style.border='1px solid #007bff'; 
upgrade.style.background='#007bff'; 
upgrade.style.color='#fff'; 
upgrade.style.borderRadius='8px'; 
upgrade.style.cursor='pointer';
upgrade.style.fontSize = '13px';
upgrade.style.flex = '1';
upgrade.style.minWidth = '0';
upgrade.onclick = function(){ 
track('paywall2_upgrade_click'); 
showSubscriptionForm();
};

var submit = document.createElement('button'); 
submit.textContent='Notify Me'; 
submit.type='button';
submit.style.padding='12px 16px';
submit.style.border='1px solid #ddd'; 
submit.style.background='#fff';
submit.style.color='#333';
submit.style.borderRadius='8px'; 
submit.style.cursor='pointer';
submit.style.fontSize = '13px';
submit.style.flex = '1';
submit.style.minWidth = '0';
submit.onclick = function(){ 
if (!email.value.trim()) { alert('Please enter your email'); return; }
track('paywall2_lead_capture', { name: name.value||'', email: email.value||'' }); 
submit.disabled=true; 
submit.textContent='Thanks!'; 
submit.style.background='#f0f0f0';
};

row.appendChild(upgrade); 
row.appendChild(submit);
form.appendChild(name); 
form.appendChild(email); 
form.appendChild(row);

box.appendChild(icon);
box.appendChild(h); 
box.appendChild(p); 
box.appendChild(form);
content.appendChild(box);

// Add close button to footer for non-dataset sites
var footer = document.querySelector('footer');
if (footer) {
footer.style.display = 'flex';
footer.innerHTML = '<div style="margin-left:auto;"><button id="t-close" style="padding:8px 10px;border:1px solid #ddd;background:#fff;border-radius:6px;cursor:pointer;">Close</button></div>';
document.getElementById('t-close').onclick = function(){
track('panel_close');
// Try multiple ways to close the panel
try {
var f = parent.document.getElementById('teedl-panel'); 
if(f) f.remove();
} catch(e) {
try {
var f = window.parent.document.getElementById('teedl-panel'); 
if(f) f.remove();
} catch(e2) {
try {
var f = top.document.getElementById('teedl-panel'); 
if(f) f.remove();
} catch(e3) {
console.log('Could not close panel:', e3);
}
}
}
};
}

titleEl.textContent = 'Teedl � Upgrade';
progress.textContent='';
}

// Add CSS for glow animation
var style = document.createElement('style');
style.textContent = `
@keyframes glow {
0% { box-shadow: 0 0 5px rgba(255, 193, 7, 0.5); }
50% { box-shadow: 0 0 20px rgba(255, 193, 7, 0.8), 0 0 30px rgba(255, 193, 7, 0.6); }
100% { box-shadow: 0 0 5px rgba(255, 193, 7, 0.5); }
}
`;
document.head.appendChild(style);

// Tooltip toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const tooltipToggleBtn = document.getElementById('tooltipToggleBtn');
    if (tooltipToggleBtn) {
        // Load tooltip state
        chrome.storage.local.get(['teedl_tooltips_enabled'], function(result) {
            const isEnabled = result.teedl_tooltips_enabled !== false; // Default to true
            if (isEnabled) {
                tooltipToggleBtn.classList.add('active');
            }
        });
        
        tooltipToggleBtn.addEventListener('click', function() {
            const isActive = this.classList.contains('active');
            
            if (isActive) {
                this.classList.remove('active');
                chrome.storage.local.set({ teedl_tooltips_enabled: false });
                // Send message to content script to disable tooltips
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleTooltips', enabled: false });
                });
            } else {
                this.classList.add('active');
                chrome.storage.local.set({ teedl_tooltips_enabled: true });
                // Send message to content script to enable tooltips
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleTooltips', enabled: true });
                });
            }
        });
    }
});

// Init
	var loaded = await loadSteps();
	state.title = loaded.title;
	state.steps = loaded.steps;
console.log('Teedl: Loaded steps:', state.steps);

// Debug panel removed to match Figma design

// Paywall #2: Unsupported sites (generic or no steps)
if (site === 'generic' || !state.steps.length){
showPaywall2Form();
track('paywall2_shown');
return;
}

// Paywall #1: Dataset sites with AI limit
if (isDatasetSite && !isSubscribed && aiUsed >= AI_LIMIT) {
showPaywall1Banner();
track('paywall1_shown', { ai_used: aiUsed, limit: AI_LIMIT });
}

	render();
	track('panel_open');

	// Footer removed to match Figma design

	// Tab switching functionality
	function initTabs() {
		const guidesTab = document.getElementById('guides-tab');
		const iconsTab = document.getElementById('icons-tab');
		const keywordsTab = document.getElementById('keywords-tab');
		const tabSlider = document.getElementById('tab-slider');
		
		const guidesContent = document.getElementById('guides-content');
		const iconsContent = document.getElementById('icons-content');
		const keywordsContent = document.getElementById('keywords-content');

		function switchTab(activeTab, activeContent) {
			// Remove active class from all tabs
			[guidesTab, iconsTab, keywordsTab].forEach(tab => tab.classList.remove('active'));
			
			// Hide all content divs
			[guidesContent, iconsContent, keywordsContent].forEach(content => content.style.display = 'none');
			
			// Also hide the guide step content if it's visible
			const guideStepContent = document.getElementById('guide-step-content');
			if (guideStepContent) {
				guideStepContent.style.display = 'none';
			}
			
			// Remove class to re-enable main content scrolling when switching tabs
			document.getElementById('content').classList.remove('guide-step-active');
			
			// Remove navigation buttons when switching tabs
			const existingNavButtons = document.querySelector('.navigation-buttons');
			if (existingNavButtons) {
				existingNavButtons.remove();
			}
			
			// Activate selected tab and content
			activeTab.classList.add('active');
			activeContent.style.display = 'block';
			
			// Move the slider to the active tab
			const tabIndex = Array.from([guidesTab, iconsTab, keywordsTab]).indexOf(activeTab);
			const tabWidth = 33.333; // Each tab takes 1/3 of the width
			tabSlider.style.left = (tabIndex * tabWidth) + '%';
			tabSlider.style.width = 'calc(33.333% - 8px)'; // Match CSS width calculation
			
			// Add appropriate class for margin styling
			tabSlider.classList.remove('guides', 'icons', 'keywords');
			if (activeTab === guidesTab) {
				tabSlider.classList.add('guides');
			} else if (activeTab === iconsTab) {
				tabSlider.classList.add('icons');
			} else if (activeTab === keywordsTab) {
				tabSlider.classList.add('keywords');
			}
		}

		guidesTab.addEventListener('click', () => {
			switchTab(guidesTab, guidesContent);
			renderGuides();
			track('tab_switch', { tab: 'guides' });
		});

		iconsTab.addEventListener('click', () => {
			switchTab(iconsTab, iconsContent);
			renderIcons();
			track('tab_switch', { tab: 'icons' });
		});

		keywordsTab.addEventListener('click', () => {
			switchTab(keywordsTab, keywordsContent);
			renderKeywords();
			track('tab_switch', { tab: 'keywords' });
		});

		// Initialize with Guides tab active
		switchTab(guidesTab, guidesContent);
		renderGuides();
	}

	// Initialize tabs
	initTabs();




	// Close button removed - extension icon handles closing
	
	// Add event delegation for back button
	document.addEventListener('click', function(e) {
		if (e.target && e.target.closest('.back-button')) {
			console.log('Back button clicked via event delegation!');
			e.preventDefault();
			goBackToGuides();
		}
	});

	// Add event delegation for Previous and Next buttons
	document.addEventListener('click', function(e) {
		if (e.target && e.target.closest('.nav-button.previous')) {
			console.log('Previous button clicked via event delegation!');
			e.preventDefault();
			const button = e.target.closest('.nav-button.previous');
			const onclick = button.getAttribute('onclick');
			if (onclick) {
				// Extract the function call and execute it - now handles string guideIds
				const match = onclick.match(/navigateStep\('([^']+)',\s*(\d+)\)/);
				if (match) {
					const guideId = match[1];
					const stepNumber = parseInt(match[2]);
					navigateStep(guideId, stepNumber);
				}
			}
		}
		
		if (e.target && e.target.closest('.nav-button.next')) {
			console.log('Next button clicked via event delegation!');
			e.preventDefault();
			const button = e.target.closest('.nav-button.next');
			const onclick = button.getAttribute('onclick');
			if (onclick) {
				// Extract the function call and execute it - now handles string guideIds
				const match = onclick.match(/navigateStep\('([^']+)',\s*(\d+)\)/);
				if (match) {
					const guideId = match[1];
					const stepNumber = parseInt(match[2]);
					navigateStep(guideId, stepNumber);
				}
			}
		}
		
		if (e.target && e.target.closest('.nav-button.complete')) {
			console.log('Complete button clicked via event delegation!');
			e.preventDefault();
			completeGuide();
		}
	});

	// Footer buttons removed to match Figma design
})(); 
