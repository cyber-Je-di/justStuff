# Application Workflow - Visual Overview

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     APPLICATION WORKFLOW                             │
└─────────────────────────────────────────────────────────────────────┘

                              ┌──────────┐
                              │  START   │
                              └─────┬────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │    Fill Application Form       │
                    │  (apply.html)                  │
                    │  ✓ Personal Information        │
                    │  ✓ Educational Background      │
                    │  ✓ Course Selection            │
                    │  ✓ Study Preferences           │
                    │  ✓ Sponsor Information         │
                    │  ✓ File Uploads               │
                    │  ✓ Confirmations              │
                    └──────────────┬─────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  VALIDATE FORM              │
                    │  ✓ All required fields      │
                    │  ✓ Format validation       │
                    │  ✓ File upload check      │
                    │  ✓ Confirmations check    │
                    └──────┬───────────────┬─────┘
                           │               │
                    ✓ Valid │               │ ✗ Invalid
                           │               │
                    ┌──────▼─┐      ┌─────▼──────┐
                    │ SUBMIT  │      │ SHOW ERROR │
                    │ REVIEW  │      │ MESSAGES   │
                    └──────┬──┘      └─────┬──────┘
                           │               │
                           │ ◀─────────────┘
                           │ (User fixes and retries)
                           │
        ┌──────────────────▼───────────────────┐
        │    REVIEW PAGE (review.html)         │
        │                                      │
        │  ┌────────────────────────────────┐  │
        │  │ Personal Information      [✓✓✓]│  │
        │  │ Educational Background    [✓✓✓]│  │
        │  │ Course Selection         [✓✓✓]│  │
        │  │ Sponsor Information      [✓✓✓]│  │
        │  │ Confirmations            [✓✓✓]│  │
        │  │ Attached Documents       [✓ ✗]│  │
        │  │                              │  │
        │  │ ┌─────────────────────────┐  │  │
        │  │ │ [Edit Info] [Submit App]│  │  │
        │  │ └─────────────────────────┘  │  │
        │  └────────────────────────────────┘  │
        └──────────────┬──────────┬─────────────┘
                       │          │
            ┌──────────┘          │
            │   Click Edit Info   │ Click Submit
            │                     │
            │              ┌──────▼────────────┐
            │              │  Validate Files   │
            │              │  ✓ Payment Receipt│
            │              │  ✓ School Results │
            │              └──────┬──────┬─────┘
            │                     │      │
            │            ✓ Both   │      │ ✗ Missing
            │            Present  │      │
    ┌───────┴─────────┐    ┌─────▼────┐ │
    │ Go Back to Form │    │ SUBMIT    │ │
    │ (Data preserved)│    │ TO SERVER │ │
    └────────────────┘    └─────┬────┘ │
                                │      └─ Show Files Notice
                                │        (Missing required files)
                    ┌───────────▼────────────┐
                    │  SUBMIT TO SERVER      │
                    │  POST /submit          │
                    │  ✓ All form data       │
                    │  ✓ Attached files      │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼────────────┐
                    │ Server Validation      │
                    │ ✓ Verify all fields    │
                    │ ✓ Check file types     │
                    │ ✓ Send email           │
                    └───────┬──────┬─────────┘
                            │      │
                    ✓ Success│      │✗ Error
                            │      │
                    ┌───────▼─┐  ┌─▼────────┐
                    │ SUCCESS │  │ ERROR    │
                    │ MODAL   │  │ MODAL    │
                    └───┬─────┘  └─┬────────┘
                        │         │
            ┌───────────▼────┐    │
            │ Next Steps:     │    │
            │ 1. Email sent   │    │
            │ 2. Call in 48h  │    │
            │ 3. Home page    │    │
            └────────────────┘    │
                                  │
                        ┌─────────▼──────────┐
                        │ Try Again Button   │
                        │ (User retries)     │
                        └────────────────────┘
```

---

## Form Validation Flow

```
┌─ User Submits Form
│
├─ VALIDATE PERSONAL DETAILS
│  ├─ First Name: Required
│  ├─ Surname: Required
│  ├─ Gender: Required (dropdown)
│  ├─ Date of Birth: Required (date picker)
│  ├─ NRC: Required + Format Check (XXXXXX/XX/X)
│  ├─ Nationality: Required (dropdown)
│  ├─ Address: Required + Min 10 characters
│  ├─ Cell Phone: Required + Zambian format (0976... or 260...)
│  └─ Email: Optional but must be valid if provided
│
├─ VALIDATE EDUCATION
│  ├─ Last School: Required
│  ├─ Education Level: Required
│  ├─ Year Completed: Required + 1990-2030 range
│  └─ Subjects & Grades: Required + Minimum 6
│     ├─ Grade must be 1-9 (Zambian system)
│     └─ Each subject can only be selected once
│
├─ VALIDATE COURSES
│  ├─ 1st Choice Course: Required (radio button)
│  └─ 2nd Choice Course: Required (dropdown)
│
├─ VALIDATE STUDY PREFERENCES
│  ├─ Mode of Study: Required (radio button)
│  │  ├─ Full Time
│  │  ├─ Part Time
│  │  ├─ Distance Learning
│  │  └─ Short Intensive
│  └─ Level of Study: Required (dropdown)
│     ├─ Craft Certificate
│     ├─ Certificate
│     ├─ Trade Test (Level I-III)
│     └─ Advanced Certificate (Level I-II)
│
├─ VALIDATE SPONSOR INFO
│  ├─ Sponsor Name: Required
│  ├─ Postal Address: Required
│  ├─ Email: Required + Valid format
│  ├─ Cell: Optional but if provided, must be valid
│  ├─ Occupation: Optional
│  └─ Relationship: Required
│
├─ VALIDATE FILE UPLOADS
│  ├─ School Results: Required (PDF/JPG/PNG/DOC/DOCX)
│  ├─ Payment Receipt: Required (same types)
│  └─ Additional Docs: Optional (max 5 files, 20MB each)
│
└─ VALIDATE CONFIRMATIONS
   ├─ Identity Confirmation: MUST be checked
   ├─ Intent & Commitment: MUST be checked
   ├─ Information Integrity: MUST be checked
   ├─ Application Date: Required (date picker)
   └─ ALL THREE must be checked to submit
```

---

## Mobile Responsiveness Breakpoints

```
┌──────────────────────────────────────────────────┐
│  EXTRA SMALL (< 640px)  - PHONES                 │
│                                                   │
│  Layout: 1 column                                │
│  Buttons: Full width                             │
│  Tables: Stack vertically                        │
│  Modal: Full screen                              │
│  Font: 16px (minimum)                            │
│  Button Height: 44px+ (tap target)               │
│                                                   │
│  Subject Selector: Dropdown                      │
│  Input Fields: Full width with padding           │
│  File Dropzone: Full width, touch-friendly       │
└──────────────────────────────────────────────────┘
                           △
                           │
┌──────────────────────────────────────────────────┐
│  SMALL (640px - 767px)  - SMALL TABLETS          │
│                                                   │
│  Layout: Start 2-column in places                │
│  Buttons: Partial width                          │
│  Padding: Moderate spacing                       │
│  Font: 14px                                      │
│                                                   │
│  Subject Selector: Dropdown or table rows        │
│  Grid: 2 columns where logical                   │
└──────────────────────────────────────────────────┘
                           △
                           │
┌──────────────────────────────────────────────────┐
│  MEDIUM (768px - 1023px)  - TABLETS              │
│                                                   │
│  Layout: 2 column for form sections              │
│  Sidebar: Optional                               │
│  Font: 14px - 16px                               │
│  Modal: Centered, constrained width              │
│                                                   │
│  Subject Selector: Table view                    │
│  Grid: Balanced 2-column layouts                 │
└──────────────────────────────────────────────────┘
                           △
                           │
┌──────────────────────────────────────────────────┐
│  LARGE (1024px+)  - DESKTOPS                     │
│                                                   │
│  Layout: Full 3-column layout possible           │
│  Sidebar: Sticky right sidebar                   │
│  Font: 16px                                      │
│  Max-width: 7xl (80rem = 1280px)                │
│                                                   │
│  Subject Selector: 2-column table                │
│  Review Page: Multiple sections                  │
│  Grid: Flexible 3-column layouts                 │
└──────────────────────────────────────────────────┘
```

---

## Data Flow & Session Storage

```
USER INTERACTION          STORAGE              RETRIEVAL

┌─────────────────┐
│ Fill Form on    │──┐
│ apply.html      │  │
└─────────────────┘  │    ┌──────────────────┐
                     │───▶│ sessionStorage:  │
┌─────────────────┐  │    │ applicationData │
│ Upload Files    │──┘    │ applicationFiles│
└─────────────────┘       └────────┬─────────┘
       │                           │
       │                    ┌──────▼──────┐
       │                    │ JSON String │
       │                    │ stored in   │
       │                    │ Browser RAM │
       │                    └──────┬──────┘
       │                           │
       └──────────────┬────────────┘
                      │
        ┌─────────────▼──────────┐
        │ Navigate to review.html│
        └──────────┬─────────────┘
                   │
        ┌──────────▼────────────┐
        │ JavaScript loads:     │
        │ - applicationData     │
        │ - applicationFiles    │
        │ from sessionStorage   │
        └──────────┬────────────┘
                   │
        ┌──────────▼─────────────┐
        │ Display in review page │
        │ with all information   │
        │ formatted and readable │
        └────────────────────────┘
```

---

## Error Handling Flow

```
USER MAKES ERROR
       │
       ▼
╔──────────────────────╗
║ CLIENT-SIDE DETECT   ║
║ ✓ Field validation   ║
║ ✓ Format checking    ║
║ ✓ File validation    ║
╚──────────┬───────────╝
           │
           ├─ SHOW INLINE ERROR
           │  ├─ Icon: ⚠️
           │  ├─ Message: Clear & helpful
           │  ├─ Location: Below field
           │  └─ Color: Red highlight
           │
           ├─ SHOW FORM-LEVEL ERROR
           │  ├─ Error banner at top
           │  ├─ List all problems
           │  └─ Scroll to first issue
           │
           └─ PREVENT SUBMISSION
              └─ Submit button disabled

OR

SERVER DETECTS ERROR
       │
       ▼
╔──────────────────────╗
║ SERVER-SIDE VERIFY   ║
║ ✓ Field validation   ║
║ ✓ Rate limiting      ║
║ ✓ File verification  ║
╚──────────┬───────────╝
           │
           └─ RETURN 400 ERROR
              │
              ▼
        SHOW ERROR MODAL
        ├─ Title: "Submission Failed"
        ├─ Message: Specific error
        ├─ Button: "Try Again"
        └─ Button: Returns to form
              │
              └─ User fixes & retries
```

---

## Key Metrics

```
✓ VALIDATION COVERAGE
  - 16 required fields validated
  - 8 optional fields validated if provided
  - 4 file upload types supported
  - 7 different validation patterns used

✓ MOBILE OPTIMIZATION
  - 4 responsive breakpoints (xs, sm, md, lg)
  - 100% responsive design
  - Touch-friendly (44px+ buttons)
  - 320px minimum width support

✓ USER EXPERIENCE
  - 3 confirmation checkboxes (legal)
  - 2 required file uploads (with tracking)
  - 1 review page (before submission)
  - 1 success confirmation (personalized)
  - 1 edit capability (go back & modify)

✓ SECURITY
  - Input sanitization on client
  - Format validation on both ends
  - Rate limiting (10/min per IP)
  - File type whitelisting
  - Size limits enforced
```

---

## Component Structure

```
┌─ apply.html
│  ├─ Header (Navigation)
│  ├─ Main Form
│  │  ├─ Section 1: Personal Details
│  │  │  ├─ 9 input fields
│  │  │  └─ Validation on each
│  │  ├─ Section 2: Educational Background
│  │  │  ├─ 4 text inputs
│  │  │  ├─ Subject selector (mobile/desktop)
│  │  │  └─ File upload (school results)
│  │  ├─ Section 3: Course Selection
│  │  │  ├─ 1st Choice (radio buttons)
│  │  │  └─ 2nd Choice (dropdown)
│  │  ├─ Section 4: Study Preferences
│  │  │  ├─ Mode of Study (radio)
│  │  │  └─ Level of Study (dropdown)
│  │  ├─ Section 5: Sponsor Information
│  │  │  └─ 6 input fields
│  │  └─ Section 6: Application Finalization
│  │     ├─ 3 confirmation checkboxes
│  │     ├─ Application date
│  │     ├─ Payment receipt upload
│  │     └─ Additional documents upload
│  └─ Footer
│
├─ review.html
│  ├─ Header (Navigation + Edit Button)
│  ├─ Progress Indicator (Fill → Review → Submit)
│  ├─ Review Content (7 Sections)
│  │  ├─ Personal Information
│  │  ├─ Educational Background
│  │  ├─ Course Selection & Study Preferences
│  │  ├─ Sponsor Information
│  │  ├─ Application Details
│  │  ├─ Confirmations Checklist
│  │  └─ Attached Documents
│  ├─ Confirmation Section
│  │  ├─ Terms checkbox
│  │  └─ File validation notice
│  ├─ Submit Button Section
│  │  └─ Submit button (disabled until confirmed)
│  ├─ Loading Modal (during submission)
│  ├─ Success Modal (after submission)
│  └─ Error Modal (if submission fails)
│
└─ js/apply.js
   ├─ Mobile Subject Picker
   ├─ File Upload Handlers (3 dropzones)
   ├─ NRC Auto-formatter
   ├─ Validation Functions
   ├─ Form Submission Handler
   └─ Error Display Functions
```

---

This visual overview helps understand the complete application workflow, from form filling through successful submission.
