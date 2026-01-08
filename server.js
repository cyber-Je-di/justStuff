require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static site files from the repository root (so you can open http://localhost:3000/apply.html)
app.use(express.static(path.join(__dirname)));

// Basic security headers
app.use(helmet());

// Rate limiter for the submit endpoint (protects against brute force/abuse)
const submitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false
});

// Multer memory storage (files kept in memory buffer, suitable for small uploads)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/submit', submitLimiter, upload.array('attachments', 5), async (req, res) => {
  try {
    const fields = req.body || {};
    const files = req.files || [];

    // Basic server-side validation & sanitization
    const errors = [];

    // Required fields
    if (!fields.surname) errors.push('surname');
    if (!fields.firstname) errors.push('firstname');
    if (!fields.nrc) errors.push('nrc');
    if (errors.length) return res.status(400).json({ error: `Missing required fields: ${errors.join(', ')}` });

    // Sanitize and trim fields
    Object.keys(fields).forEach(k => {
      if (typeof fields[k] === 'string') {
        fields[k] = validator.escape(validator.trim(fields[k]));
      }
    });

    // Email validation (if provided)
    if (fields.email && !validator.isEmail(fields.email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // NRC simple validation (expects digits and slashes, e.g. 123456/78/9)
    const nrcOk = /^\d{6}\/\d{2}\/\d{1}$/.test(fields.nrc);
    if (!nrcOk) return res.status(400).json({ error: 'Invalid NRC format. Expected 123456/78/9' });

    // Phone validation (simple): allow digits, spaces, + and -
    if (fields.phone && !/^[0-9+\-\s()]{7,20}$/.test(fields.phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // File validation: allowed mime types and total size
    const ALLOWED_MIMES = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const MAX_TOTAL_ATTACHMENTS = 30 * 1024 * 1024; // 30MB total
    let totalBytes = 0;
    for (const f of files) {
      if (!ALLOWED_MIMES.includes(f.mimetype)) {
        return res.status(400).json({ error: `Unsupported file type: ${f.originalname}` });
      }
      totalBytes += (f.size || 0);
      if (totalBytes > MAX_TOTAL_ATTACHMENTS) {
        return res.status(400).json({ error: 'Total attachments exceed 30MB' });
      }
    }

    // Build email body
    const lines = [];
    lines.push(`Application received from ${fields.surname} ${fields.firstname}`);
    lines.push('');
    Object.keys(fields).forEach(k => {
      lines.push(`${k}: ${fields[k]}`);
    });

    // Configure transporter
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Missing SMTP configuration in environment');
      return res.status(500).json({ error: 'Server not configured for sending email. See README.' });
    }

    const createTransport = (host) => nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    let transporter = createTransport(process.env.SMTP_HOST);

    // Prepare attachments array for nodemailer
    const attachments = files.map(f => ({ filename: f.originalname, content: f.buffer }));

    // Decide From header. By default we use SMTP_FROM or SMTP_USER to avoid spoofing problems.
    // If the operator explicitly enables USE_APPLICANT_AS_FROM=true in .env, and an applicant email
    // was provided, we will set From to the applicant's address (note: this can increase deliverability
    // problems due to SPF/DMARC checks; see README).
    const useApplicantFrom = process.env.USE_APPLICANT_AS_FROM === 'true';
    let fromHeader = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (useApplicantFrom && fields.email) {
      fromHeader = fields.email;
      console.warn('Using applicant email as From header (USE_APPLICANT_AS_FROM=true). This may trigger SPF/DMARC rejections.');
    }

    const mailOptions = {
      from: fromHeader,
      to: process.env.TO_EMAIL || 'crawhammer.marketing@gmail.com',
      subject: `New application: ${fields.surname} ${fields.firstname}`,
      text: lines.join('\n'),
      replyTo: fields.email || undefined,
      attachments
    };

    // Try to send. If an IPv6 network error occurs (ENETUNREACH), retry by resolving SMTP host to IPv4.
    const dns = require('dns').promises;
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
    } catch (sendErr) {
      console.error('Initial send error', sendErr && sendErr.code, sendErr && sendErr.message);
      if (sendErr && sendErr.code === 'ENETUNREACH') {
        try {
          const lookup = await dns.lookup(process.env.SMTP_HOST, { family: 4 });
          if (lookup && lookup.address) {
            console.log('Retrying SMTP send using IPv4 address', lookup.address);
            transporter = createTransport(lookup.address);
            // set TLS servername so certificate validation still checks the real host
            transporter.options.tls = transporter.options.tls || {};
            transporter.options.tls.servername = process.env.SMTP_HOST;
            const info2 = await transporter.sendMail(mailOptions);
            console.log('Email sent on IPv4 retry:', info2.messageId);
          } else {
            throw sendErr;
          }
        } catch (retryErr) {
          console.error('Retry failed', retryErr);
          throw retryErr;
        }
      } else {
        throw sendErr;
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Submit error', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
