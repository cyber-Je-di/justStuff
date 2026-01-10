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
app.post('/submit', submitLimiter, upload.any(), async (req, res) => {
  try {
    const fields = req.body || {};  // Form field data (name, email, etc.)
    const attachments = req.files || [];  // Uploaded files

    // ===== VALIDATION SECTION =====
    // Check for required fields
    const errors = [];
    if (!fields.surname) errors.push('surname');
    if (!fields.firstname) errors.push('firstname');
    if (!fields.nrc) errors.push('nrc');
    if (errors.length) return res.status(400).json({ error: 'Missing required fields: ' + errors.join(', ') });

    // Check if attachments exist (at least one file required)
    if (!attachments || attachments.length === 0) {
      return res.status(400).json({ error: 'At least one file must be attached. Please upload your payment receipt and school results.' });
    }

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
    for (const f of attachments) {
      if (!ALLOWED_MIMES.includes(f.mimetype)) {
        return res.status(400).json({ error: 'Unsupported file type' });
      }
      totalBytes += (f.size || 0);
      if (totalBytes > MAX_TOTAL_ATTACHMENTS) {
        return res.status(400).json({ error: 'Total attachments exceed 30MB' });
      }
    }

    // ===== EMAIL PREPARATION SECTION =====
    // Build HTML email body with organized sections
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
    .header { background: linear-gradient(135deg, #0066cc 0%, #ff6600 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0 0 0; font-size: 14px; }
    .section { background: white; margin-bottom: 15px; padding: 15px; border-left: 4px solid #ff6600; border-radius: 4px; }
    .section-title { font-size: 16px; font-weight: bold; color: #0066cc; margin-bottom: 10px; text-transform: uppercase; }
    .field-row { display: flex; margin-bottom: 8px; }
    .field-label { font-weight: bold; width: 180px; color: #0066cc; }
    .field-value { flex: 1; word-break: break-word; }
    .payment-box { background: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 4px; margin: 15px 0; }
    .files-box { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 4px; margin: 15px 0; }
    .files-box ul { margin: 10px 0; padding-left: 20px; }
    .files-box li { margin: 5px 0; }
    .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Application Submission</h1>
      <p>Craw Hammer Trades School - Application Portal</p>
    </div>

    <!-- APPLICANT PERSONAL DETAILS -->
    <div class="section">
      <div class="section-title">👤 Applicant Personal Details</div>
      <div class="field-row"><span class="field-label">First Name:</span><span class="field-value">${fields.firstname || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Surname:</span><span class="field-value">${fields.surname || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Gender:</span><span class="field-value">${fields.gender || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Date of Birth:</span><span class="field-value">${fields.dob || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">NRC Number:</span><span class="field-value">${fields.nrc || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Nationality:</span><span class="field-value">${fields.nationality || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Residential Address:</span><span class="field-value">${fields.address || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Cell Number:</span><span class="field-value">${fields.cell || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Email Address:</span><span class="field-value">${fields.email || 'N/A'}</span></div>
    </div>

    <!-- EDUCATIONAL BACKGROUND -->
    <div class="section">
      <div class="section-title">📚 Educational Background & Documents</div>
      <div class="field-row"><span class="field-label">Last School Attended:</span><span class="field-value">${fields.lastSchool || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Education Level:</span><span class="field-value">${fields.educationAttained || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Year Completed:</span><span class="field-value">${fields.yearCompleted || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Previous Qualifications:</span><span class="field-value">${fields.prevQualifications || 'None'}</span></div>
      <hr style="margin: 10px 0; border: none; border-top: 1px solid #ddd;">
      <strong>Selected Subjects & Grades:</strong>
      <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-top: 8px;">
        ${(() => {
          try {
            const subjects = JSON.parse(fields.subjectsGrades || '[]');
            if (subjects.length === 0) return '<p style="color: #666;">No subjects selected</p>';
            return subjects.map((s, i) => `<div>${i+1}. ${s.subject} - Grade <strong>${s.grade}</strong></div>`).join('');
          } catch (e) {
            return '<p style="color: #666;">Subject data unavailable</p>';
          }
        })()}
      </div>
    </div>

    <!-- COURSE SELECTION -->
    <div class="section">
      <div class="section-title">🎓 Course Selection</div>
      <div class="field-row"><span class="field-label">1st Choice:</span><span class="field-value">${fields.choice1 || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">2nd Choice:</span><span class="field-value">${fields.choice2 || 'N/A'}</span></div>
    </div>

    <!-- STUDY PREFERENCES -->
    <div class="section">
      <div class="section-title">⚙️ Study Preferences</div>
      <div class="field-row"><span class="field-label">Mode of Study:</span><span class="field-value">${fields.mode || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Level of Study:</span><span class="field-value">${fields.level || 'N/A'}</span></div>
    </div>

    <!-- SPONSOR INFORMATION -->
    <div class="section">
      <div class="section-title">👨‍👩‍👧 Sponsor Information</div>
      <div class="field-row"><span class="field-label">Sponsor Name:</span><span class="field-value">${fields.sponsorName || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Relationship:</span><span class="field-value">${fields.sponsorRelation || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Occupation:</span><span class="field-value">${fields.sponsorOccupation || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Email:</span><span class="field-value">${fields.sponsorEmail || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Cell Number:</span><span class="field-value">${fields.sponsorCell || 'N/A'}</span></div>
      <div class="field-row"><span class="field-label">Postal Address:</span><span class="field-value">${fields.sponsorPostal || 'N/A'}</span></div>
    </div>

    <!-- PAYMENT INFORMATION -->
    <div class="payment-box">
      <div style="font-weight: bold; margin-bottom: 10px;">💳 APPLICATION PAYMENT</div>
      <div class="field-row"><span class="field-label">Application Fee:</span><span class="field-value"><strong>K100</strong></span></div>
      <div class="field-row"><span class="field-label">Payment Method:</span><span class="field-value">Zanaco Bill Muster</span></div>
      <div class="field-row"><span class="field-label">Bank Account:</span><span class="field-value"><strong>0596204400114</strong></span></div>
    </div>

    <!-- ATTACHED FILES -->
    <div class="files-box">
      <div style="font-weight: bold; margin-bottom: 10px;">📎 ATTACHED FILES (${attachments.length})</div>
      <ul>
        ${attachments.map(f => `<li><strong>${f.originalname}</strong> (${Math.round(f.size / 1024)} KB)</li>`).join('')}
      </ul>
    </div>

    <!-- CONFIRMATIONS -->
    <div class="section">
      <div class="section-title">✓ Application Confirmations</div>
      <div class="field-row"><span class="field-label">Identity Confirmed:</span><span class="field-value">${fields.identityCheck === 'on' || fields.identityCheck === 'true' ? '✓ Yes' : '✗ No'}</span></div>
      <div class="field-row"><span class="field-label">Intent Confirmed:</span><span class="field-value">${fields.intentCheck === 'on' || fields.intentCheck === 'true' ? '✓ Yes' : '✗ No'}</span></div>
      <div class="field-row"><span class="field-label">Integrity Confirmed:</span><span class="field-value">${fields.integrityCheck === 'on' || fields.integrityCheck === 'true' ? '✓ Yes' : '✗ No'}</span></div>
      <div class="field-row"><span class="field-label">Application Date:</span><span class="field-value">${fields.applicationDate || 'N/A'}</span></div>
    </div>

    <div class="footer">
      <p>This is an automated email from the Craw Hammer Trades School Application Portal.</p>
      <p>Application submitted at ${new Date().toLocaleString('en-ZM', { timeZone: 'Africa/Lusaka' })}</p>
    </div>
  </div>
</body>
</html>
    `;

    // Plain text fallback
    const textBody = `
Application received from ${fields.surname} ${fields.firstname}

=== APPLICANT PERSONAL DETAILS ===
Name: ${fields.firstname} ${fields.surname}
Email: ${fields.email}
Cell: ${fields.cell}
NRC: ${fields.nrc}

=== EDUCATIONAL BACKGROUND ===
Last School: ${fields.lastSchool}
Education Level: ${fields.educationAttained}
Year Completed: ${fields.yearCompleted}
Subjects & Grades:
${(() => {
  try {
    const subjects = JSON.parse(fields.subjectsGrades || '[]');
    if (subjects.length === 0) return '  No subjects recorded';
    return subjects.map((s, i) => `  ${i+1}. ${s.subject} - Grade ${s.grade}`).join('\n');
  } catch (e) {
    return '  Subject data unavailable';
  }
})()}

=== COURSE SELECTION ===
1st Choice: ${fields.choice1}
2nd Choice: ${fields.choice2}

=== STUDY PREFERENCES ===
Mode: ${fields.mode}
Level: ${fields.level}

=== SPONSOR INFORMATION ===
Name: ${fields.sponsorName}
Relationship: ${fields.sponsorRelation}
Email: ${fields.sponsorEmail}

=== PAYMENT INFORMATION ===
Application Fee: K100
Payment Method: Zanaco Bill Muster
Bank Account: 0596204400114

=== ATTACHED FILES ===
${attachments.map(f => `${f.originalname} (${Math.round(f.size / 1024)} KB)`).join('\n')}
    `;

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
    const emailAttachments = [];
    
    // Add all uploaded attachments
    attachments.forEach(f => {
      emailAttachments.push({ 
        filename: f.originalname, 
        content: f.buffer 
      });
    });

    // Determine From header
    // Use applicant email as sender (with fallback to SMTP user if email is missing)
    let fromHeader = fields.email || (process.env.SMTP_FROM || process.env.SMTP_USER);
    let replyToHeader = fields.email;

    // Configure email message
    const mailOptions = {
      from: fromHeader,
      replyTo: replyToHeader,
      to: process.env.TO_EMAIL || 'crawhammer.marketing@gmail.com',
      subject: `New application: ${fields.surname} ${fields.firstname}`,
      text: textBody,
      html: htmlBody,
      replyTo: fields.email || undefined, // Allows admissions team to reply directly to applicant
      attachments: emailAttachments
    };

    // ===== EMAIL SENDING (Blocking - Wait for completion) =====
    // Send email and wait for result before responding
    let emailSent = false;
    let emailError = null;

    try {
      const info = await transporter.sendMail(mailOptions);
      emailSent = true;
      if (NODE_ENV === 'development') {
        console.log('Email sent successfully:', info.messageId);
      }
    } catch (sendErr) {
      emailError = sendErr.code || sendErr.message;
      console.error('Email send error:', emailError);
      console.error('Full error:', sendErr);
      
      // Retry with different approach if DNS error
      if (sendErr && (sendErr.code === 'EDNS' || sendErr.code === 'ENOTFOUND')) {
        try {
          console.log('Retrying email send after DNS error...');
          // Wait a moment and retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          const retryInfo = await transporter.sendMail(mailOptions);
          emailSent = true;
          emailError = null;
          console.log('Email sent on retry:', retryInfo.messageId);
        } catch (retryErr) {
          console.error('Email retry also failed:', retryErr.message);
          emailError = retryErr.message;
        }
      }
    }

    // Response with email status
    if (emailSent) {
      res.json({ ok: true, emailSent: true });
    } else {
      // Application was received but email failed
      res.json({ 
        ok: true, 
        emailSent: false, 
        message: 'Application received. Email confirmation could not be sent. Your application has been submitted to our admissions team.',
        technicalError: emailError
      });
    }
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
