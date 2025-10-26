# Teedl - Google Workspace Guide

Interactive guides for Google Docs, Slides, and Sheets.

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/teedl-webapp.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

### Option 2: Deploy from Local Files

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Project name: `teedl-webapp`
   - Framework: Other
   - Build command: (leave empty)
   - Output directory: (leave empty)

## 📁 Project Structure

```
teedl-webapp/
├── index.html              # Main landing page
├── teedl-inject.js         # Injection script
├── vercel.json             # Vercel configuration
├── src/
│   ├── panel.html          # Teedl panel interface
│   └── panel.js            # Panel functionality
└── public/
    └── (any additional assets)
```

## 🎯 How It Works

1. **User visits your Vercel URL** (e.g., `teedl-webapp.vercel.app`)
2. **User goes to Google Workspace** (Docs, Slides, or Sheets)
3. **User clicks "Activate Teedl"** on your website
4. **Teedl panel appears** on the right side of Google Workspace
5. **User follows interactive guides**

## 🔧 Customization

### Change the Domain
Update `HOST` in `teedl-inject.js`:
```javascript
var HOST = 'https://your-custom-domain.com';
```

### Add Analytics
Uncomment the analytics section in `teedl-inject.js`:
```javascript
fetch(HOST + '/api/events', { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' }, 
  body: JSON.stringify(payload), 
  keepalive: true 
}).catch(function(){});
```

## 🧪 Testing

1. **Deploy to Vercel**
2. **Open Google Docs** in a new tab
3. **Visit your Vercel URL**
4. **Click "Activate Teedl"**
5. **Verify panel appears** on the right side

## 📱 Browser Support

- ✅ Chrome
- ✅ Firefox  
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🚀 Next Steps

1. **Deploy to Vercel** using the instructions above
2. **Test on different browsers** and Google Workspace apps
3. **Share the Vercel URL** with your testers
4. **Collect feedback** and iterate
5. **Consider custom domain** for production

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all files are deployed correctly
3. Test on different Google Workspace pages
4. Check Vercel deployment logs
