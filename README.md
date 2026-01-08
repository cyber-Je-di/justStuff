# Craw Hammer — Application Upload Server

This repository contains the static site and a small Node.js server that receives application form submissions (including attachments) and forwards them by email.

What I added

- `server.js` — Express server that serves static files and exposes a `/submit` endpoint that accepts multipart form submissions and emails them using `nodemailer`.
- `package.json` — minimal manifest for installing dependencies.
- `.env.example` — example environment variables for SMTP configuration.

Quick Setup (Windows)

1. Install Node.js (v16+ recommended) from https://nodejs.org.
2. Open PowerShell in the project folder (`c:/Users/Gani/OneDrive/Desktop/justStuff`).

3. Install dependencies:

```powershell
npm install
```

4. Copy `.env.example` to `.env` and fill in your SMTP credentials. Example using Gmail with an App Password (recommended):

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=you@gmail.com`
- `SMTP_PASS=your-app-password`
- `TO_EMAIL=crawhammer.marketing@gmail.com` (or another recipient)

5. Start the server:

```powershell
npm start
```

6. Open the site in your browser at:

```
http://localhost:3000/apply.html
```

Submit the application form (attach files) — the server will receive the files and send them as email attachments to the address configured in `TO_EMAIL`.

Notes & Security

- The server sets the outgoing `From` header to the SMTP account to avoid being rejected by mail servers. Replies will go to the applicant's email via `Reply-To`.
- For Gmail, you must use an App Password (2FA + App Password) or allow less-secure apps (not recommended).
- This server stores files in memory (not on disk). If you expect very large uploads, switch `multer` to disk storage and add cleanup.

Optional: use applicant email as outgoing From

By default the server sets the outgoing `From` header to the configured SMTP account (to avoid being rejected by receiving mail servers). If you explicitly want the outgoing `From` to be the applicant's email (the value they enter in the form), set the environment variable:

```
USE_APPLICANT_AS_FROM=true
```

Caution: using the applicant address as `From` can cause deliverability problems. Many mail providers enforce SPF and DMARC checks and will reject messages where the `From` domain doesn't match the authenticated SMTP account. If you set `USE_APPLICANT_AS_FROM=true`, the server will still set `Reply-To` to the applicant address so replies go to them, but accept that some recipient servers may drop or mark the message as spam. For safe delivery keep `USE_APPLICANT_AS_FROM=false` (the default) and rely on `Reply-To`.

Testing with curl

```powershell
curl -v -F "surname=Smith" -F "firstname=John" -F "email=john@example.com" -F "nrc=123456/78/9" -F "attachments=@C:/path/to/file.pdf" http://localhost:3000/submit
```

If you need help wiring SMTP credentials or prefer another delivery method (e.g., SendGrid API), tell me and I can adapt the server.
