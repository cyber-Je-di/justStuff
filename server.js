// Load environment variables from .env file (API keys, SMTP credentials, etc.)
require('dotenv').config();

// Core dependencies
const express = require('express');       // Web framework for handling HTTP requests
const cors = require('cors');             // Cross-Origin Resource Sharing - allows requests from allowed domains
const multer = require('multer');         // Handles file uploads from forms
const nodemailer = require('nodemailer'); // Sends emails with application submissions
const path = require('path');             // File/directory path utilities
const helmet = require('helmet');         // Security headers middleware (prevents various attacks)
const rateLimit = require('express-rate-limit'); // Prevents brute force attacks by limiting requests per IP
const validator = require('validator');   // Input validation and sanitization

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// SECURITY: Force HTTPS in production
// This ensures all traffic is encrypted when deployed to live servers
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect(301, 'https://' + req.get('host') + req.url);
    }
    next();
  });
}

// Serve static files (HTML, CSS, images, etc.) from the project root directory
app.use(express.static(path.join(__dirname)));

// Add security headers to prevent XSS, clickjacking, and other attacks
app.use(helmet());

// CORS Configuration: Restrict API to allowed domains only
// Prevents unauthorized cross-domain requests from malicious websites
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

// Rate Limiter: Protects against brute force and spam
// Max 10 submissions per IP address per minute - prevents abuse
const submitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // max 10 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => NODE_ENV !== 'production' // Disable in development for easier testing
});

// File Upload Configuration: Stores files in memory (RAM) temporarily
// Suitable for small to medium uploads (up to 20MB per file)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// Health check endpoint - used by hosting providers to verify server is running
app.get('/health', (req, res) => res.json({ ok: true }));

// MAIN APPLICATION SUBMISSION ENDPOINT
// POST /submit - Receives application form data and file uploads, validates, and sends via email
app.post('/submit', submitLimiter, upload.array('attachments', 5), async (req, res) => {
  try {
    const fields = req.body || {};  // Form field data (name, email, etc.)
    const files = req.files || [];   // Uploaded files (documents, images, etc.)

    // ===== VALIDATION SECTION =====
    // Check for required fields
    const errors = [];
    if (!fields.surname) errors.push('surname');
    if (!fields.firstname) errors.push('firstname');
    if (!fields.nrc) errors.push('nrc');
    if (errors.length) return res.status(400).json({ error: 'Missing required fields' });

    // Validate NRC format (Zambian ID number) BEFORE sanitization to preserve slashes
    // Accepts format: 123456/78/9 or 123456789
    const nrcOk = /^\d{6}\/\d{2}\/\d{1}$/.test(fields.nrc) || /^\d{9}$/.test(fields.nrc);
    if (!nrcOk) return res.status(400).json({ error: 'Invalid NRC format. Expected 123456/78/9 or 123456789' });

    // Sanitize all text fields to prevent XSS attacks (HTML injection)
    const nrcValue = fields.nrc;
    Object.keys(fields).forEach(k => {
      if (typeof fields[k] === 'string') {
        fields[k] = validator.escape(validator.trim(fields[k]));
      }
    });
    fields.nrc = validator.trim(nrcValue); // Keep NRC without escaping to preserve format

    // Email validation - ensures email is in valid format if provided
    if (fields.email && !validator.isEmail(fields.email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Phone validation - allows digits, spaces, +, and - characters
    if (fields.phone && !/^[0-9+\-\s()]{7,20}$/.test(fields.phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // ===== FILE VALIDATION SECTION =====
    // Whitelist of allowed file types (only secure formats)
    const ALLOWED_MIMES = [
      'application/pdf',                                              // PDF documents
      'image/png',                                                    // PNG images
      'image/jpeg',                                                   // JPEG images
      'application/msword',                                           // Microsoft Word (.doc)
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // Word (.docx)
    ];
    const MAX_TOTAL_ATTACHMENTS = 30 * 1024 * 1024; // 30MB total size limit
    let totalBytes = 0;
    
    // Check each uploaded file
    for (const f of files) {
      if (!ALLOWED_MIMES.includes(f.mimetype)) {
        return res.status(400).json({ error: 'Unsupported file type' });
      }
      totalBytes += (f.size || 0);
      if (totalBytes > MAX_TOTAL_ATTACHMENTS) {
        return res.status(400).json({ error: 'Total attachments exceed 30MB' });
      }
    }

    // ===== EMAIL PREPARATION SECTION =====
    // Build email body with all application information
    const lines = [];
    lines.push(`Application received from ${fields.surname} ${fields.firstname}`);
    lines.push('');
    Object.keys(fields).forEach(k => {
      lines.push(`${k}: ${fields[k]}`);
    });

    // Check SMTP configuration exists
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Missing SMTP configuration in environment');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create email transporter function (can retry with different host if needed)
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

    // Prepare files for email attachment
    const attachments = files.map(f => ({ filename: f.originalname, content: f.buffer }));

    // Determine From header
    // Default: Use SMTP_FROM for security (avoid email spoofing)
    // Optional: Use applicant email if explicitly enabled (may cause delivery issues with SPF/DMARC)
    const useApplicantFrom = process.env.USE_APPLICANT_AS_FROM === 'true';
    let fromHeader = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (useApplicantFrom && fields.email) {
      fromHeader = fields.email;
      if (NODE_ENV === 'development') {
        console.warn('Using applicant email as From header (USE_APPLICANT_AS_FROM=true).');
      }
    }

    // Configure email message
    const mailOptions = {
      from: fromHeader,
      to: process.env.TO_EMAIL || 'crawhammer.marketing@gmail.com',
      subject: `New application: ${fields.surname} ${fields.firstname}`,
      text: lines.join('\n'),
      replyTo: fields.email || undefined, // Allows admissions team to reply directly to applicant
      attachments
    };

    // ===== EMAIL SENDING WITH RETRY LOGIC =====
    // Try to send email with fallback to IPv4 if IPv6 fails
    const dns = require('dns').promises;
    try {
      const info = await transporter.sendMail(mailOptions);
      if (NODE_ENV === 'development') {
        console.log('Email sent:', info.messageId);
      }
    } catch (sendErr) {
      console.error('Email send error:', sendErr.code || sendErr.message);
      
      // If IPv6 network error, retry with IPv4 address resolution
      if (sendErr && sendErr.code === 'ENETUNREACH') {
        try {
          const lookup = await dns.lookup(process.env.SMTP_HOST, { family: 4 });
          if (lookup && lookup.address) {
            if (NODE_ENV === 'development') {
              console.log('Retrying SMTP send using IPv4 address');
            }
            transporter = createTransport(lookup.address);
            transporter.options.tls = transporter.options.tls || {};
            transporter.options.tls.servername = process.env.SMTP_HOST;
            const info2 = await transporter.sendMail(mailOptions);
            if (NODE_ENV === 'development') {
              console.log('Email sent on IPv4 retry:', info2.messageId);
            }
          } else {
            throw sendErr;
          }
        } catch (retryErr) {
          console.error('Email retry failed');
          throw retryErr;
        }
      } else {
        throw sendErr;
      }
    }

    // Success response
    res.json({ ok: true });
  } catch (err) {
    console.error('Submit error:', err.message);
    // Return generic error in production (security), detailed in development (debugging)
    const errorMessage = NODE_ENV === 'production' ? 'Server error' : err.message || 'Server error';
    res.status(500).json({ error: errorMessage });
  }
});

// Global error handler - catches any unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  if (NODE_ENV === 'production') {
    res.status(500).json({ error: 'Server error' }); // Generic message for security
  } else {
    res.status(500).json({ error: err.message || 'Server error' }); // Detailed message for debugging
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server started on ${NODE_ENV === 'production' ? 'https' : 'http'}://localhost:${PORT}`));
