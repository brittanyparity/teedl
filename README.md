# Teedl - Google Workspace Guide Extension

A browser extension that provides interactive guides and tutorials for Google Workspace applications.

## 🚀 Features

- **Interactive Guides**: Step-by-step tutorials for Google Docs, Slides, and Sheets
- **Icon Reference**: Visual guide to Google Workspace icons and tools
- **Keyword Search**: Quick access to Google Workspace terminology
- **Auto-Detection**: Automatically activates on Google Workspace pages
- **Cross-Browser**: Works on Chrome, Firefox, Edge, and Safari

## 📦 Installation

### For Development/Testing:

1. **Download the extension files**
2. **Open your browser's extension page:**
   - Chrome: `chrome://extensions/`
   - Firefox: `about:addons`
   - Edge: `edge://extensions/`
3. **Enable Developer Mode**
4. **Click "Load unpacked"**
5. **Select the extension folder**

### For Distribution:

1. **Package the extension** (zip the files)
2. **Upload to browser stores:**
   - Chrome Web Store
   - Firefox Add-ons
   - Microsoft Edge Add-ons

## 🎯 Usage

1. **Navigate to Google Workspace** (Docs, Slides, Sheets)
2. **Click the Teedl extension icon** in your browser toolbar
3. **Click "Open Teedl Panel"**
4. **Follow the interactive guides**

## 📁 File Structure

```
teedl-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── content.js            # Content script injection
├── content.css           # Content script styles
├── panel.html            # Main panel UI
├── panel.js              # Panel functionality
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── icon-generator.html   # Tool to create icons
```

## 🔧 Development

### Creating Icons:
1. Open `icon-generator.html` in your browser
2. Right-click each generated icon
3. Save as `icon16.png`, `icon32.png`, etc. in the `icons/` folder

### Testing:
1. Load the extension in developer mode
2. Navigate to `docs.google.com`
3. Click the extension icon
4. Test all functionality

## 🌐 Browser Compatibility

- ✅ **Chrome** (Manifest V3)
- ✅ **Firefox** (WebExtensions API)
- ✅ **Edge** (Chromium-based)
- ✅ **Safari** (with modifications)

## 📝 Permissions

- `activeTab`: Access current tab for injection
- `storage`: Save user preferences
- `host_permissions`: Access Google Workspace domains

## 🚀 Deployment Steps

1. **Create icons** using `icon-generator.html`
2. **Test thoroughly** on all target browsers
3. **Package extension** (zip all files)
4. **Submit to stores:**
   - Chrome Web Store
   - Firefox Add-ons
   - Microsoft Edge Add-ons

## 🎉 Benefits of Extension Approach

- ✅ **Reliable**: No CSP or iframe restrictions
- ✅ **Cross-browser**: Works everywhere
- ✅ **User-friendly**: One-click installation
- ✅ **Persistent**: Stays active across sessions
- ✅ **Secure**: Proper permission model
- ✅ **Distributable**: Easy to share with testers
