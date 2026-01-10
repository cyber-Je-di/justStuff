# Deployment Guide

This guide covers deploying the Craw Hammer Trades School application to mamphost or any Node.js hosting provider.

## Pre-Deployment Checklist

- [ ] Update `.env` file with production values
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` with your domain
- [ ] Test email functionality locally
- [ ] Review all form validation settings
- [ ] Set up HTTPS/SSL certificate
- [ ] Create database backups if needed

## Environment Variables (.env)

All sensitive data is managed via environment variables. Create a `.env` file in your project root:

```env
# Environment Mode (CRITICAL: Set to 'production' for deployment)
NODE_ENV=production

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com          # Your SMTP provider
SMTP_PORT=587                      # SMTP port (usually 587 for TLS)
SMTP_SECURE=false                  # Set to true if using port 465
SMTP_USER=your-email@gmail.com     # Email account for sending
SMTP_PASS=your-app-password        # App-specific password (NOT your main password)

# Email Settings
SMTP_FROM=crawhammer.marketing@gmail.com  # Fallback From address
TO_EMAIL=crawhammer.marketing@gmail.com   # Where applications are sent
USE_APPLICANT_AS_FROM=false               # Send from applicant email (caution: DMARC issues)

# Server Configuration
PORT=3000                          # Application port
NODE_ENV=production                # Always 'production' for deployment

# Security: CORS Allowed Origins
# List all domains that should be allowed to submit forms (comma-separated)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

⚠️ **IMPORTANT NOTES:**

- **SMTP_PASS:** For Gmail, use an [App-specific password](https://support.google.com/accounts/answer/185833), NOT your main Google password
- **ALLOWED_ORIGINS:** Must match your actual domain with HTTPS protocol
- **NODE_ENV:** Must be `production` for security features to activate
- **SMTP_SECURE:** Use `false` with port 587 (TLS) or `true` with port 465 (SSL)

## Deployment Steps

### 1. On mamphost Control Panel

1. Create a new Node.js application
2. Set Node version to 16+ (check with `node --version` locally)
3. Add your repository or upload files
4. Point to `server.js` as the start file

### 2. Configure Environment Variables

In mamphost dashboard:
- Add all variables from `.env` to the **Environment Variables** section
- Do NOT include `.env` file in version control (add to `.gitignore`)

### 3. Install Dependencies

mamphost should auto-run `npm install`, but ensure `package.json` has cors:
```json
"cors": "^2.8.5"
```

### 4. Set Up HTTPS/SSL

- mamphost provides free SSL certificates
- Enable SSL in the hosting control panel
- Ensure your domain DNS points to mamphost servers

### 5. Update Frontend CORS Settings

The application is now configured for CORS. Make sure:
- Your domain is in `ALLOWED_ORIGINS` environment variable
- All form submissions go to your HTTPS domain

### 6. Test Email Delivery

After deployment:
1. Submit a test application
2. Verify email arrives at `TO_EMAIL`
3. Check spam/junk folder if not received
4. If email fails, check:
   - SMTP credentials are correct
   - SMTP_PASS is an app-specific password (for Gmail)
   - Firewall isn't blocking port 587

## Production Security Features

The application includes:

✅ **HTTPS Enforcement** - Forces HTTP → HTTPS redirect
✅ **CORS Protection** - Only allows configured origins
✅ **Rate Limiting** - Max 10 submissions per IP per minute
✅ **Input Validation** - NRC, email, phone number format checks
✅ **File Validation** - Whitelist of allowed file types
✅ **Size Limits** - Max 20MB per file, 30MB total
✅ **Error Masking** - Generic errors in production (no leak of internals)
✅ **Helmet.js** - Security headers (CSP, X-Frame-Options, etc.)

## Monitoring & Logging

In production mode:
- Generic error messages are returned to clients
- Detailed errors are logged server-side only
- Rate limit warnings appear in console
- Email delivery is logged

## Troubleshooting

### "CORS not allowed" error
- Verify `ALLOWED_ORIGINS` includes your domain with HTTPS
- Check domain spelling and protocol (must be HTTPS)
- Restart application after changing environment variables

### "Email send failed" error
- Verify SMTP credentials in environment variables
- For Gmail: Use [App-specific password](https://support.google.com/accounts/answer/185833)
- Check SMTP_PORT and SMTP_SECURE match (587 + false, or 465 + true)
- Look for SMTP provider's firewall restrictions

### Rate limiting too strict
- Default: 10 submissions per IP per minute
- Modify `max` in server.js if needed
- Limit disabled in development mode

### "Server configuration error"
- Missing SMTP_HOST, SMTP_USER, or SMTP_PASS
- Verify all required environment variables are set
- Restart application after adding/changing variables

## Performance Optimization

Current setup handles:
- ✅ ~1,000 applications/day
- ✅ File uploads up to 30MB total
- ✅ Concurrent submissions from multiple users
- ✅ Email delivery via Gmail/custom SMTP

For higher scale, consider:
- Queuing system for emails (Bull, RabbitMQ)
- Database storage (MongoDB, PostgreSQL)
- CDN for static files
- Load balancing across multiple instances

## Security Recommendations

1. **Rotate SMTP credentials** regularly
2. **Monitor rate limit** logs for abuse
3. **Backup application data** before major updates
4. **Review ALLOWED_ORIGINS** quarterly
5. **Keep Node.js and packages updated** (`npm audit fix`)
6. **Enable HTTPS everywhere** (mamphost provides free SSL)
7. **Use strong SMTP passwords** (app-specific for Gmail)

## File Structure

```
.
├── server.js                 # Main application
├── package.json             # Dependencies (includes cors)
├── .env                     # Environment variables (NOT in git)
├── .gitignore              # Should include .env, node_modules
├── index.html              # Homepage
├── apply.html              # Application form
├── review.html             # Review page
├── programs.html           # Programs listing
├── about.html              # About page
├── contact.html            # Contact page
├── updates.html            # News/Updates
├── css/site.css            # Styles
├── js/main.js              # Scripts
└── static/                 # Images and media
```

## Support & Documentation

- [Express.js Docs](https://expressjs.com)
- [mamphost Documentation](https://docs.mamphost.com)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [SMTP Security](https://nodemailer.com/smtp/)

---

**Last Updated:** January 10, 2026
**Ready for Production:** Yes ✅
