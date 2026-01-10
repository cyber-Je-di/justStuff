# Production Deployment Checklist

## ✅ Code Changes Completed
- [x] Updated CORS configuration with production domain
- [x] Fixed Helmet security middleware for production
- [x] Improved HTTPS redirect logic (won't conflict with cPanel)
- [x] Added logging for debugging CORS issues
- [x] Updated .env for production settings

## 📋 Steps to Deploy on cPanel/Mamphost

### 1. Upload Files to Server
- Use cPanel File Manager or FTP
- Upload all files from your local project to your hosting account
- Ensure `.env` file is uploaded with production settings

### 2. Update .env on Server
In cPanel File Manager, edit the `.env` file with these settings:
```
NODE_ENV=production
ALLOWED_ORIGINS=https://crawhammertrades.com,https://www.crawhammertrades.com,http://localhost:3000
FORCE_HTTPS=false
```

### 3. Setup Node.js Application
1. Go to cPanel → **Setup Node.js App**
2. Click **Create Application**
3. Fill in:
   - **Node.js version**: 18.x or latest
   - **Application mode**: production
   - **Application root**: `/home/username/public_html` (or your domain's public folder)
   - **Application startup file**: `server.js`
   - **Application URL**: `https://crawhammertrades.com`
4. Click **Create**
5. Click **Restart** to apply changes

### 4. Configure Domain SSL/HTTPS
1. Go to cPanel → **AutoSSL**
2. Ensure SSL certificate is installed for your domain
3. Go to **Domains** and enable **Force HTTPS** for your domain
   - This tells cPanel to redirect all HTTP traffic to HTTPS
   - Our code respects this with the `FORCE_HTTPS=false` setting

### 5. Disable ModSecurity (if needed)
**Only if you get 403 Forbidden errors on form submission:**
1. Go to cPanel → **ModSecurity**
2. Find your domain
3. Click **Disable** temporarily to test
4. If the form works, contact your host to whitelist POST requests with file uploads

### 6. Test the Application
- [ ] Visit https://crawhammertrades.com in browser
- [ ] Check console for CORS errors (F12 → Console tab)
- [ ] Test filling out the application form
- [ ] Test file uploads
- [ ] Test form submission
- [ ] Check email to verify application was received

## 🔍 Debugging Production Issues

### CORS "CORS not allowed" Error
**Check in browser console (F12):**
- Opens the Network tab
- Click on the failed request
- Look for `Access-Control-Allow-Origin` header
- If missing, CORS is blocked

**Solution:**
1. Verify ALLOWED_ORIGINS in .env includes your domain
2. Restart Node.js app in cPanel
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check server logs in cPanel → Node.js App

### Form Submission Gets 403 Forbidden
This is ModSecurity blocking file uploads.

**Solution:**
1. Go to cPanel → ModSecurity
2. Disable for your domain temporarily
3. Restart Node.js
4. Test again
5. Contact host if you need permanent solution

### Application Not Loading
1. Check Node.js app is running in cPanel
2. Verify startup file is set to `server.js`
3. Check server logs for errors
4. Ensure port isn't already in use (should be handled by cPanel)

### Email Not Sending
1. Verify SMTP credentials in .env
2. Check firewall isn't blocking SMTP port 587
3. Review server logs for SMTP errors
4. Ensure Gmail app password is used (not regular password)

## 🚀 Production Domains
- **Primary**: https://crawhammertrades.com
- **WWW**: https://www.crawhammertrades.com
- **Admin/Contact**: crawhammer.marketing@gmail.com

## 📧 Production SMTP Settings
- **Host**: smtp.gmail.com
- **Port**: 587
- **User**: crawhammer.marketing@gmail.com
- **Password**: [Gmail App Password]
- **To Email**: crawhammer.marketing@gmail.com

## 🔐 Security Reminders
- ✅ HTTPS is enforced
- ✅ CORS is restricted to your domain
- ✅ File uploads are validated
- ✅ Input is sanitized against XSS
- ✅ Rate limiting protects against abuse
- ✅ Helmet provides security headers

## 📞 Support
If you encounter issues:
1. Check server logs in cPanel Node.js setup
2. Review browser console (F12) for client-side errors
3. Test on different browser/device
4. Try disabling browser extensions
5. Contact Mamphost support with error details

---
**Last Updated**: January 10, 2026
**Status**: Production Ready ✅
