# ✅ READY TO UPLOAD - Files Updated!

## 🎉 Build Completed Successfully!

Your frontend is now configured to connect to:
```
https://springgreen-camel-350920.hostingersite.com:4000
```

---

## 📦 Files to Upload to Hostinger

### **Upload these files from `C:\Art_Gallery-main\build\` to `public_html`:**

```
✅ index.html
✅ assets/
   ├── index-0ptBd7Ql.css
   └── index-BxFIX1I5.js   ← New JS file (updated)
✅ .htaccess (from root: C:\Art_Gallery-main\.htaccess)
```

---

## 📋 Upload Steps:

### **Method 1: Hostinger File Manager (Easiest)**

1. Go to **Hostinger Control Panel → File Manager**
2. Navigate to `public_html/`
3. **Delete old files:**
   - Delete old `index.html`
   - Delete entire `assets/` folder
4. **Upload new files:**
   - Upload `C:\Art_Gallery-main\build\index.html`
   - Upload `C:\Art_Gallery-main\build\assets\` folder (entire folder)
5. **Check .htaccess exists:**
   - Enable "Show Hidden Files" (gear icon)
   - If `.htaccess` is missing, upload from `C:\Art_Gallery-main\.htaccess`

### **Method 2: FileZilla/SFTP**

1. Connect to Hostinger
2. Navigate to `/public_html/`
3. Delete old `assets/` folder
4. Upload:
   - `build/index.html` → `public_html/index.html`
   - `build/assets/` → `public_html/assets/`
   - `.htaccess` → `public_html/.htaccess`

---

## ⚠️ IMPORTANT: Backend Must Be Running!

Your frontend will now try to connect to:
```
https://springgreen-camel-350920.hostingersite.com:4000
```

Make sure:
1. ✅ Backend is deployed on Hostinger
2. ✅ Backend is running on port 4000
3. ✅ Port 4000 is accessible from the internet

### **Test Backend First:**
Visit: `https://springgreen-camel-350920.hostingersite.com:4000/health`

Expected response:
```json
{"status":"ok","timestamp":"2025-12-10...","env":"production"}
```

If this doesn't work, your backend is NOT deployed yet!

---

## 🔍 After Upload - Verification:

1. **Clear browser cache:** Ctrl + Shift + R
2. **Visit your site:** `https://springgreen-camel-350920.hostingersite.com`
3. **Open browser console:** Press F12
4. **Check for errors:**
   - ✅ No CORS errors = Backend is responding
   - ✅ Artworks load = Everything working!
   - ❌ CORS errors = Backend not deployed or wrong port
   - ❌ 404 errors = Files uploaded incorrectly

---

## 🚨 If Backend is NOT Deployed Yet:

You need to deploy the backend first! Follow these steps:

### **Quick Backend Deployment to Hostinger:**

1. **SSH to Hostinger:**
   ```bash
   ssh your_username@springgreen-camel-350920.hostingersite.com -p 22
   ```

2. **Create backend directory:**
   ```bash
   mkdir -p ~/backend
   cd ~/backend
   ```

3. **Upload server files** (via SFTP or File Manager)
   - Upload entire `C:\Art_Gallery-main\server\` folder contents

4. **Install dependencies:**
   ```bash
   npm install --production
   ```

5. **Create .env file:**
   ```bash
   nano .env
   ```
   
   Paste:
   ```bash
   PORT=4000
   NODE_ENV=production
   FRONTEND_URL=https://springgreen-camel-350920.hostingersite.com
   FIREBASE_PROJECT_ID=artgallery-175dc
   FIREBASE_PRIVATE_KEY="YOUR_KEY_HERE"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@artgallery-175dc.iam.gserviceaccount.com
   # Add other environment variables
   ```

6. **Setup PM2 and start:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name art-gallery-api
   pm2 save
   pm2 startup
   ```

7. **Configure Node.js in Hostinger Panel:**
   - Go to: Advanced → Node.js
   - Create application
   - Port: 4000
   - Entry file: server.js

---

## 📝 Current File Structure After Upload:

```
public_html/
├── .htaccess
├── index.html
└── assets/
    ├── index-0ptBd7Ql.css
    └── index-BxFIX1I5.js
```

---

## ✅ Checklist:

- [x] Frontend built with correct backend URL
- [ ] Upload `build/` contents to `public_html/`
- [ ] Verify `.htaccess` is present
- [ ] Backend deployed on port 4000
- [ ] Test backend: `/health` endpoint
- [ ] Clear browser cache
- [ ] Test frontend: Artworks should load

---

**Ready to upload! Your files are in `C:\Art_Gallery-main\build\`**
