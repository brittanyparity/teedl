# 🚀 Teedl Web App Deployment Guide

## Quick Start (5 minutes)

### Step 1: Prepare Your Files
Make sure you have these files in your project folder:
- ✅ `index.html` (main landing page)
- ✅ `teedl-inject.js` (injection script)
- ✅ `src/panel.html` (your existing panel)
- ✅ `src/panel.js` (your existing panel JavaScript)
- ✅ `vercel.json` (Vercel configuration)
- ✅ `package.json` (project metadata)

### Step 2: Deploy to Vercel

#### Option A: GitHub + Vercel (Recommended)
1. **Create GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial Teedl web app"
   git branch -M main
   git remote add origin https://github.com/YOURUSERNAME/teedl-webapp.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Select your repository
   - Click "Deploy"

#### Option B: Direct Upload
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

### Step 3: Test Your Deployment

1. **Get your Vercel URL** (e.g., `teedl-webapp.vercel.app`)
2. **Open Google Docs** in a new tab
3. **Visit your Vercel URL**
4. **Click "Activate Teedl"**
5. **Verify the panel appears** on the right side

## 🎯 What You'll Get

- **Landing page:** Beautiful interface to activate Teedl
- **One-click activation:** Works on any Google Workspace page
- **Cross-browser support:** Chrome, Firefox, Safari, Edge
- **No installation:** Users just visit your URL
- **Instant updates:** Deploy changes immediately

## 🔧 Customization

### Change the Branding
Edit `index.html`:
- Update the logo emoji
- Change colors in the CSS
- Modify the title and description

### Add Analytics
Uncomment the analytics code in `teedl-inject.js`:
```javascript
fetch(HOST + '/api/events', { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' }, 
  body: JSON.stringify(payload), 
  keepalive: true 
}).catch(function(){});
```

### Custom Domain
1. **Buy a domain** (e.g., `teedl.app`)
2. **Add to Vercel:**
   - Go to your project settings
   - Add custom domain
   - Update DNS records

## 🧪 Testing Checklist

- [ ] Landing page loads correctly
- [ ] "Activate Teedl" button works
- [ ] Panel appears on Google Docs
- [ ] Panel appears on Google Slides  
- [ ] Panel appears on Google Sheets
- [ ] Navigation buttons work
- [ ] Guides display correctly
- [ ] Icons show properly
- [ ] Keywords display correctly

## 📱 Share with Testers

Send them this message:
```
🚀 Teedl is ready for testing!

Visit: https://your-vercel-url.vercel.app

How to use:
1. Go to Google Docs, Slides, or Sheets
2. Visit the Teedl URL
3. Click "Activate Teedl"
4. Follow the interactive guides!

Works on all browsers - no installation needed!
```

## 🚨 Troubleshooting

### Panel doesn't appear
- Check browser console for errors
- Verify all files are deployed
- Test on different Google Workspace pages

### Buttons don't work
- Check if JavaScript is enabled
- Verify the panel loaded completely
- Try refreshing the page

### Styling issues
- Check if CSS files are loading
- Verify file paths in Vercel
- Test on different browsers

## 🎉 You're Ready!

Once deployed, you'll have:
- ✅ A professional landing page
- ✅ One-click Teedl activation
- ✅ Cross-browser compatibility
- ✅ Easy sharing with testers
- ✅ Instant deployment updates

**Your Teedl web app is ready for testing tomorrow!**
