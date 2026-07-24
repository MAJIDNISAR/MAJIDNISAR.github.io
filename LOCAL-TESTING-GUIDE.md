# 🧪 Local Testing Guide

This guide will help you test all the modern features locally before deploying to GitHub Pages.

## 🚀 Quick Start

### **1. Install Dependencies**
```bash
# Install Ruby dependencies
bundle install

# Install Node.js dependencies
npm install
```

### **2. Start Development Server**
```bash
# Option 1: Using npm script
npm run dev

# Option 2: Using Jekyll directly
bundle exec jekyll serve --livereload --port 4000

# Option 3: Using Jekyll with draft posts
bundle exec jekyll serve --livereload --drafts --port 4000
```

### **3. Open in Browser**
Navigate to: `http://localhost:4000`

---

## ✅ Feature Testing Checklist

### 🌙 **Dark Mode Toggle**
**Location**: Fixed button in top-right corner

**Test Steps**:
1. ✅ Click the moon icon to toggle dark mode
2. ✅ Refresh the page - theme should persist
3. ✅ Check system preference (if dark mode enabled in OS)
4. ✅ Test on mobile devices

**Expected Behavior**:
- Smooth transition between themes
- Icon changes (moon/sun)
- Theme persists across page reloads
- Mobile browsers update theme-color

---

### 📊 **Reading Progress Bar**
**Location**: Fixed bar at top of page

**Test Steps**:
1. ✅ Open any blog post or long page
2. ✅ Scroll down the page
3. ✅ Observe progress bar filling
4. ✅ Scroll back up - bar should decrease

**Expected Behavior**:
- Progress bar appears at top
- Smooth gradient animation
- Real-time progress tracking
- Resets on new page

---

### 🔍 **Advanced Search**
**Location**: Search icon in navigation

**Test Steps**:
1. ✅ Click search icon in navigation
2. ✅ Type search query
3. ✅ Press Escape to close
4. ✅ Test keyboard navigation

**Expected Behavior**:
- Modern overlay with blur effect
- Search input focuses automatically
- Escape key closes overlay
- Click outside to close

---

### 📧 **Newsletter Subscription**
**Location**: Newsletter section (if added to page)

**Test Steps**:
1. ✅ Enter email address
2. ✅ Click subscribe button
3. ✅ Observe validation
4. ✅ Check form submission feedback

**Expected Behavior**:
- Email validation works
- Animated button feedback
- Success message on submission
- Form resets after submission

---

### 📱 **Table of Contents**
**Location**: Sidebar on blog posts (desktop only)

**Test Steps**:
1. ✅ Open a blog post with multiple headings
2. ✅ Scroll through the post
3. ✅ Observe TOC highlighting
4. ✅ Click TOC links

**Expected Behavior**:
- TOC appears on desktop (1200px+)
- Active section highlights
- Smooth scroll to sections
- Hidden on mobile/tablet

---

### 💼 **Skills Showcase**
**Location**: Skills section (if added to page)

**Test Steps**:
1. ✅ Scroll to skills section
2. ✅ Hover over skill cards
3. ✅ Test responsive layout
4. ✅ Verify dark mode styling

**Expected Behavior**:
- Card hover animations
- Grid layout adjusts for screen size
- Dark mode colors apply
- Smooth transitions

---

### 🎨 **Visual Design**
**Test Across Devices**:

**Desktop (1200px+)**:
- ✅ Navigation mega-menu
- ✅ Sticky table of contents
- ✅ Hover effects on cards
- ✅ Large hero sections

**Tablet (768px-1199px)**:
- ✅ Responsive navigation
- ✅ Card grid adjustments
- ✅ Touch-friendly buttons
- ✅ Optimized typography

**Mobile (< 768px)**:
- ✅ Hamburger menu
- ✅ Single-column layout
- ✅ Touch-optimized UI
- ✅ Readable typography

---

## 🔧 **Browser Testing**

### **Chrome/Edge (Recommended)**
- ✅ All features supported
- ✅ CSS backdrop-filter works
- ✅ Modern JavaScript features
- ✅ DevTools available

### **Firefox**
- ✅ Full feature support
- ✅ CSS grid/flexbox
- ✅ ES6+ JavaScript
- ✅ Responsive design mode

### **Safari**
- ✅ Webkit prefixes added
- ✅ backdrop-filter supported
- ✅ Mobile Safari tested
- ✅ iOS compatibility

### **Mobile Browsers**
- ✅ Chrome Mobile
- ✅ Safari iOS
- ✅ Samsung Internet
- ✅ Firefox Mobile

---

## 📱 **Mobile Testing**

### **iOS Testing**
1. Open Safari on iPhone/iPad
2. Navigate to `http://localhost:4000`
3. Test touch interactions
4. Verify responsive layout

### **Android Testing**
1. Open Chrome on Android device
2. Navigate to `http://localhost:4000`
3. Test touch gestures
4. Verify mobile navigation

---

## 🎯 **Performance Testing**

### **Lighthouse Audit**
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Run audit for:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO

**Target Scores**:
- Performance: 95+
- Accessibility: 90+
- Best Practices: 95+
- SEO: 95+

### **Network Testing**
1. Open DevTools Network tab
2. Throttle to "Slow 3G"
3. Test page load time
4. Verify lazy loading

---

## 🐛 **Common Issues & Solutions**

### **Dark Mode Not Working**
**Symptoms**: Toggle doesn't change theme
**Solutions**:
- Check JavaScript console for errors
- Verify localStorage is accessible
- Clear browser cache
- Check CSS is loading

### **Search Not Opening**
**Symptoms**: Clicking search does nothing
**Solutions**:
- Verify JavaScript is enabled
- Check for console errors
- Ensure Font Awesome is loading
- Test keyboard shortcut (Ctrl/Cmd + K)

### **Progress Bar Not Showing**
**Symptoms**: No progress indicator
**Solutions**:
- Check if reading-progress.html is included
- Verify JavaScript is loaded
- Test on blog post pages
- Check z-index conflicts

### **Responsive Issues**
**Symptoms**: Layout breaks on mobile
**Solutions**:
- Test viewport meta tag
- Check CSS media queries
- Verify Bootstrap grid
- Test on actual devices

---

## 🔍 **Testing Commands**

### **Build and Test**
```bash
# Build for production
npm run build:prod

# Serve built site
cd _site && python -m http.server 4000

# Test production build locally
open http://localhost:4000
```

### **Lint JavaScript**
```bash
# Check JavaScript syntax
npm run lint

# Fix common issues
npm run lint -- --fix
```

### **Jekyll Build Test**
```bash
# Test Jekyll build
bundle exec jekyll build

# Check for build errors
bundle exec jekyll doctor

# Serve with drafts
bundle exec jekyll serve --drafts
```

---

## 📋 **Feature Verification**

### **Visual Features**
- ✅ Dark/light mode toggle
- ✅ Modern typography
- ✅ Card-based layouts
- ✅ Smooth animations
- ✅ Responsive design

### **Functional Features**
- ✅ Search functionality
- ✅ Reading progress
- ✅ Newsletter form
- ✅ Table of contents
- ✅ Skills showcase

### **Technical Features**
- ✅ CSS variables
- ✅ Modern JavaScript
- ✅ Performance optimizations
- ✅ Accessibility features
- ✅ SEO enhancements

---

## 🚀 **Next Steps After Testing**

### **If All Tests Pass**:
1. ✅ Commit changes to Git
2. ✅ Push to GitHub repository
3. ✅ Enable GitHub Pages
4. ✅ Configure LinkedIn API (optional)
5. ✅ Deploy to production

### **If Issues Found**:
1. 🔍 Check browser console
2. 🔧 Review error messages
3. 📱 Test on multiple devices
4. 🧪 Verify file paths
5. 🔄 Clear cache and retry

---

## 📞 **Support Resources**

### **Documentation**
- Jekyll: https://jekyllrb.com/docs/
- Bootstrap: https://getbootstrap.com/docs/
- Font Awesome: https://fontawesome.com/docs/

### **Debug Tools**
- Chrome DevTools
- Firefox Developer Tools
- Safari Web Inspector
- VS Code Live Server

### **Testing Tools**
- Lighthouse
- WebPageTest
- GTmetrix
- BrowserStack

---

**Happy Testing! 🎉**

Your website is now feature-packed and ready for local testing. All modern features work without external API dependencies.