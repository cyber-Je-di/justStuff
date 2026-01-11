// Enhanced Application Form Handler with Comprehensive Validation
(function () {
    const form = document.querySelector('#application-form form') || document.querySelector('#main-form');
    if (!form) return;

    // Store form state for edit functionality
    window.formSubmitted = false;
    window.currentFormData = null;

    // ===== DYNAMIC SUBJECT PICKER (MOBILE) =====
    (function mobileSubjectPicker() {
        const mobileSelector = document.getElementById('mobile-subjects-selector');
        if (!mobileSelector) return;

        const allSubjects = ['English', 'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 
                            'Computer Science', 'History', 'Geography', 'Economics', 'Civics', 'Agriculture', 'Commerce', 'Art & Design'];
        let selectedSubjects = [];

        const dropdown = document.getElementById('mobile-subject-dropdown');
        const gradeInput = document.getElementById('mobile-subject-grade');
        const customSubjectInput = document.getElementById('mobile-custom-subject-name');
        const customSubjectContainer = document.getElementById('custom-subject-input-mobile');
        const addBtn = document.getElementById('add-subject-btn');
        const selectedList = document.getElementById('mobile-selected-subjects');
        const counter = document.getElementById('subjects-counter');
        const subjectsGradesField = document.getElementById('subjectsGrades');

        // Grade input validation - only allow 1-9
        gradeInput.addEventListener('input', function(e) {
            let value = this.value.replace(/[^1-9]/g, '');
            if (value.length > 1) {
                value = value.charAt(0);
            }
            this.value = value;
        });

        // Toggle custom subject input
        dropdown.addEventListener('change', function() {
            if (this.value === 'custom') {
                customSubjectContainer.classList.remove('hidden');
                customSubjectInput.focus();
            } else {
                customSubjectContainer.classList.add('hidden');
            }
        });

        // Add subject button click
        addBtn.addEventListener('click', function() {
            let selectedSubject = dropdown.value.trim();
            const grade = gradeInput.value.trim();

            // Validate inputs
            if (!selectedSubject) {
                alert('Please select a subject');
                return;
            }

            if (selectedSubject === 'custom') {
                selectedSubject = customSubjectInput.value.trim();
                if (!selectedSubject) {
                    alert('Please enter a custom subject name');
                    return;
                }
            }

            if (!grade) {
                alert('Please enter a grade (1-9)');
                return;
            }

            if (!/^[1-9]$/.test(grade)) {
                alert('Grade must be a number between 1 and 9');
                return;
            }

            // Check if subject already selected
            if (selectedSubjects.some(s => s.subject.toLowerCase() === selectedSubject.toLowerCase())) {
                alert('You have already selected this subject');
                return;
            }

            // Add subject
            selectedSubjects.push({ subject: selectedSubject, grade: grade });
            updateUI();
            clearInputs();
        });

        // Remove subject button
        selectedList.addEventListener('click', function(e) {
            if (e.target.closest('button[data-remove-subject]')) {
                const subjectName = e.target.closest('button').getAttribute('data-remove-subject');
                selectedSubjects = selectedSubjects.filter(s => s.subject !== subjectName);
                updateUI();
            }
        });

        // Update UI
        function updateUI() {
            // Update counter
            const count = selectedSubjects.length;
            counter.textContent = `${count}/6`;

            // Update selected subjects list
            if (selectedSubjects.length === 0) {
                selectedList.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">No subjects added yet</p>';
            } else {
                selectedList.innerHTML = selectedSubjects.map(item => `
                    <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div class="flex-1">
                            <p class="text-xs font-semibold text-slate-700">${item.subject}</p>
                            <p class="text-xs text-slate-600">Grade: <span class="font-bold text-orange-600">${item.grade}</span></p>
                        </div>
                        <button type="button" data-remove-subject="${item.subject}" class="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition text-lg">
                            ×
                        </button>
                    </div>
                `).join('');
            }

            // Update dropdown - remove already selected subjects
            const selectedNames = selectedSubjects.map(s => s.subject.toLowerCase());
            const options = dropdown.querySelectorAll('option');
            options.forEach(option => {
                if (option.value && option.value !== 'custom' && option.value !== '') {
                    option.hidden = selectedNames.includes(option.value.toLowerCase());
                }
            });

            // Serialize to hidden field
            serializeSubjects();
        }

        function clearInputs() {
            dropdown.value = '';
            gradeInput.value = '';
            customSubjectInput.value = '';
            customSubjectContainer.classList.add('hidden');
            dropdown.focus();
        }

        function serializeSubjects() {
            subjectsGradesField.value = JSON.stringify(selectedSubjects);
        }
    })();

    // ===== DESKTOP CUSTOM SUBJECT HANDLER =====
    (function desktopCustomSubjects() {
        const addBtn = document.getElementById('add-custom-subject-btn');
        const container = document.getElementById('custom-subjects-container');
        const table = document.getElementById('subjects-table-desktop');
        
        if (!addBtn || !container || !table) return;
        
        let customCount = 0;
        
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            customCount++;
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-50 bg-slate-50 custom-subject-row';
            row.innerHTML = `
                <td class="px-2 sm:px-4 py-2 sm:py-3">
                    <input type="text" placeholder="Subject" class="w-full px-2 py-2 border border-slate-300 rounded text-xs sm:text-sm custom-subject-input">
                </td>
                <td class="px-2 sm:px-4 py-2 sm:py-3">
                    <input type="text" class="subject-grade w-full text-center px-2 py-2 border border-slate-300 rounded text-xs sm:text-sm" maxlength="1" placeholder="1-9" inputmode="numeric">
                </td>
                <td class="px-2 sm:px-4 py-2 sm:py-3">
                    <button type="button" class="remove-custom-btn text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded transition font-semibold text-xs">
                        <i class="fas fa-trash-alt mr-1"></i> Remove
                    </button>
                </td>
                <td class="px-2 sm:px-4 py-2 sm:py-3"></td>
            `;
            
            // Add remove button handler
            const removeBtn = row.querySelector('.remove-custom-btn');
            removeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                row.remove();
            });
            
            // Grade input validation
            const gradeInput = row.querySelector('.subject-grade');
            gradeInput.addEventListener('input', function(e) {
                let value = this.value.replace(/[^1-9]/g, '');
                if (value.length > 1) {
                    value = value.charAt(0);
                }
                this.value = value;
            });
            
            table.appendChild(row);
            row.querySelector('.custom-subject-input').focus();
        });
    })();

    // ===== FILE UPLOAD HANDLERS =====
    
    // School Results/Certificates Upload
    (function documentsUpload() {
        const fileInput = document.getElementById('resultsCert');
        const dropzone = document.getElementById('documents-dropzone');
        const fileInfo = document.getElementById('documents-file-info');
        
        if (!fileInput || !dropzone || !fileInfo) return;

        function updateDisplay() {
            if (!fileInput.files || fileInput.files.length === 0) {
                fileInfo.textContent = 'No file selected';
                return;
            }
            const file = fileInput.files[0];
            fileInfo.innerHTML = `<i class="fas fa-check-circle text-green-600 mr-2"></i>${file.name} (${Math.round(file.size/1024)} KB)`;
        }

        fileInput.addEventListener('change', updateDisplay);

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('border-orange-500', 'bg-orange-50');
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('border-orange-500', 'bg-orange-50');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-orange-500', 'bg-orange-50');
            if (e.dataTransfer.files.length) {
                const dt = new DataTransfer();
                dt.items.add(e.dataTransfer.files[0]);
                fileInput.files = dt.files;
                updateDisplay();
            }
        });

        updateDisplay();
    })();

    // Proof of Payment Upload
    (function proofOfPaymentUpload() {
        const fileInput = document.getElementById('proofOfPayment');
        const dropzone = document.getElementById('proof-dropzone');
        const fileInfo = document.getElementById('proof-file-info');
        
        if (!fileInput || !dropzone || !fileInfo) return;

        function updateDisplay() {
            if (!fileInput.files || fileInput.files.length === 0) {
                fileInfo.textContent = 'No file selected';
                dropzone.classList.remove('border-orange-500', 'bg-orange-50');
                return;
            }
            const file = fileInput.files[0];
            fileInfo.innerHTML = `<i class="fas fa-check-circle text-green-600 mr-2"></i>${file.name} (${Math.round(file.size/1024)} KB)`;
            dropzone.classList.add('border-orange-500', 'bg-orange-50');
        }

        fileInput.addEventListener('change', updateDisplay);

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('border-orange-500', 'bg-orange-50');
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('border-orange-500', 'bg-orange-50');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-orange-500', 'bg-orange-50');
            if (e.dataTransfer.files.length) {
                const dt = new DataTransfer();
                dt.items.add(e.dataTransfer.files[0]);
                fileInput.files = dt.files;
                updateDisplay();
            }
        });

        updateDisplay();
    })();

    // Additional Documents Upload
    (function attachmentsUpload() {
        const fileInput = document.getElementById('attachments');
        const dropzone = document.getElementById('dropzone');
        const fileInfo = document.getElementById('attachments-list');
        
        if (!fileInput || !dropzone || !fileInfo) return;

        function updateDisplay() {
            if (!fileInput.files || fileInput.files.length === 0) {
                fileInfo.textContent = 'No files selected';
                return;
            }
            const ul = document.createElement('ul');
            ul.className = 'space-y-2 mt-2';
            for (let i = 0; i < fileInput.files.length; i++) {
                const file = fileInput.files[i];
                const li = document.createElement('li');
                li.className = 'flex items-center gap-2 text-sm';
                li.innerHTML = `<i class="fas fa-file text-orange-500"></i><span>${file.name} (${Math.round(file.size/1024)} KB)</span>`;
                ul.appendChild(li);
            }
            fileInfo.innerHTML = '';
            fileInfo.appendChild(ul);
        }

        fileInput.addEventListener('change', updateDisplay);

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('border-orange-500');
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('border-orange-500');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-orange-500');
            if (e.dataTransfer.files.length) {
                const dt = new DataTransfer();
                for (let i = 0; i < e.dataTransfer.files.length; i++) {
                    dt.items.add(e.dataTransfer.files[i]);
                }
                fileInput.files = dt.files;
                updateDisplay();
            }
        });

        updateDisplay();
    })();

    // ===== NRC FORMATTER =====
    (function nrcFormatter() {
        const nrcEl = document.getElementById('nrc');
        if (!nrcEl) return;

        function formatNRC(value) {
            const digits = (value || '').replace(/\D/g, '').slice(0, 9);
            if (digits.length <= 6) return digits;
            if (digits.length <= 8) return digits.slice(0, 6) + '/' + digits.slice(6);
            return digits.slice(0, 6) + '/' + digits.slice(6, 8) + '/' + digits.slice(8, 9);
        }

        nrcEl.addEventListener('input', (e) => {
            const formatted = formatNRC(nrcEl.value);
            nrcEl.value = formatted;
            try { nrcEl.setSelectionRange(formatted.length, formatted.length); } catch (err) {}
        });

        nrcEl.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey || ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) return;
            if (!/\d/.test(e.key)) e.preventDefault();
        });
    })();

    // ===== VALIDATION FUNCTIONS =====
    function validateNRC(value) {
        const trimmed = value.trim();
        return /^\d{6}\/\d{2}\/\d{1}$/.test(trimmed) || /^\d{9}$/.test(trimmed);
    }

    function validateEmail(value) {
        if (!value) return true; // Email is optional
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    function validatePhone(value) {
        if (!value) return true;
        const digits = value.replace(/\D/g, '');
        return (digits.length === 12 && digits.startsWith('260')) || (digits.length === 10 && digits.startsWith('0'));
    }

    function showError(el, msg) {
        const existing = el.nextElementSibling;
        if (existing && existing.classList.contains('text-red-500')) existing.remove();
        const err = document.createElement('p');
        err.className = 'text-red-500 text-sm mt-1 flex items-center gap-1';
        err.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
        el.insertAdjacentElement('afterend', err);
    }

    function clearError(el) {
        const next = el.nextElementSibling;
        if (next && next.classList.contains('text-red-500')) next.remove();
    }

    function scrollToError(el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-red-500');
        setTimeout(() => el.classList.remove('ring-2', 'ring-red-500'), 3000);
    }

    // ===== FORM SUBMISSION =====
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;
        const errors = [];

        // Clear previous errors
        form.querySelectorAll('.text-red-500').forEach(el => el.remove());

        // Required field validations
        const requiredFields = [
            { id: 'firstname', label: 'First Name' },
            { id: 'surname', label: 'Surname' },
            { id: 'gender', label: 'Gender' },
            { id: 'dob', label: 'Date of Birth' },
            { id: 'nrc', label: 'NRC Number' },
            { id: 'nationality', label: 'Nationality' },
            { id: 'address', label: 'Residential Address' },
            { id: 'cell', label: 'Cell Number' },
            { id: 'lastSchool', label: 'Last School Attended' },
            { id: 'educationAttained', label: 'Education Level Attained' },
            { id: 'yearCompleted', label: 'Year of Completion' },
            { id: 'sponsorName', label: 'Sponsor Name' },
            { id: 'sponsorPostal', label: 'Sponsor Postal Address' },
            { id: 'sponsorEmail', label: 'Sponsor Email' },
            { id: 'sponsorRelation', label: 'Relationship to Applicant' },
            { id: 'applicationDate', label: 'Application Date' }
        ];

        requiredFields.forEach(field => {
            const el = document.getElementById(field.id);
            if (el && !el.value.trim()) {
                showError(el, `${field.label} is required`);
                errors.push(field.label);
                isValid = false;
            } else if (el) {
                clearError(el);
            }
        });

        // Subjects and Grades validation - at least 1 subject required (grades must be 1-9)
        // Check hidden field which is populated by mobile picker
        const subjectsGradesField = document.getElementById('subjectsGrades');
        let selectedSubjects = [];
        
        if (subjectsGradesField && subjectsGradesField.value) {
            try {
                selectedSubjects = JSON.parse(subjectsGradesField.value);
            } catch (e) {
                selectedSubjects = [];
            }
        }
        
        // Also try desktop table if no mobile data
        if (selectedSubjects.length === 0) {
            const desktopTable = document.getElementById('subjects-table-desktop');
            if (desktopTable) {
                const rows = desktopTable.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    for (let i = 0; i < cells.length; i += 2) {
                        const subjectCell = cells[i];
                        const gradeCell = cells[i + 1];
                        
                        if (subjectCell && gradeCell) {
                            const subjectInputs = subjectCell.querySelectorAll('input[type="text"]');
                            const subjectName = subjectInputs.length > 0 
                                ? subjectInputs[0].value.trim() 
                                : subjectCell.textContent.trim();
                            
                            const gradeInputs = gradeCell.querySelectorAll('input[type="text"]');
                            const grade = gradeInputs.length > 0 ? gradeInputs[0].value.trim() : '';
                            
                            if (grade && subjectName) {
                                selectedSubjects.push({ subject: subjectName, grade: grade });
                            }
                        }
                    }
                });
            }
        }
        
        if (selectedSubjects.length < 1) {
            const selectorDiv = document.getElementById('mobile-subjects-selector') || document.getElementById('subjects-table-desktop') || document.body;
            showError(selectorDiv, `Please select at least 1 subject with a grade.`);
            errors.push('Subjects and Grades');
            isValid = false;
        } else {
            // Validate all grades are 1-9
            let invalidGrades = false;
            selectedSubjects.forEach(item => {
                if (!/^[1-9]$/.test(item.grade)) {
                    invalidGrades = true;
                }
            });
            
            if (invalidGrades) {
                showError(document.getElementById('mobile-subjects-selector') || document.getElementById('subjects-table-desktop') || document.body, 'All grades must be numbers 1-9 (Zambian standard)');
                errors.push('Invalid Grades');
                isValid = false;
            }
        }

        // NRC validation
        const nrcEl = document.getElementById('nrc');
        if (nrcEl && nrcEl.value.trim() && !validateNRC(nrcEl.value)) {
            showError(nrcEl, 'Invalid NRC format. Use XXXXXX/XX/X');
            isValid = false;
        }

        // Email validation
        const emailEl = document.getElementById('email');
        if (emailEl && emailEl.value && !validateEmail(emailEl.value)) {
            showError(emailEl, 'Invalid email address');
            isValid = false;
        }

        // Sponsor email validation
        const sponsorEmailEl = document.getElementById('sponsorEmail');
        if (sponsorEmailEl && sponsorEmailEl.value && !validateEmail(sponsorEmailEl.value)) {
            showError(sponsorEmailEl, 'Invalid email address');
            isValid = false;
        }

        // Phone validations
        const cellEl = document.getElementById('cell');
        if (cellEl && cellEl.value && !validatePhone(cellEl.value)) {
            showError(cellEl, 'Invalid phone number');
            isValid = false;
        }

        // Course selection validation
        const choice1 = document.querySelector('input[name="choice1"]:checked');
        if (!choice1) {
            showError(form.querySelector('input[name="choice1"]').parentElement, '1st Choice Course is required');
            isValid = false;
        }

        const choice2El = document.getElementById('choice2');
        if (!choice2El.value) {
            showError(choice2El, '2nd Choice Course is required');
            isValid = false;
        }

        // Study preferences validation
        const mode = document.querySelector('input[name="mode"]:checked');
        if (!mode) {
            showError(form.querySelector('input[name="mode"]').parentElement, 'Mode of Study is required');
            isValid = false;
        }

        const levelEl = document.getElementById('levelSelect');
        if (!levelEl.value) {
            showError(levelEl, 'Level of Study is required');
            isValid = false;
        }

        // Confirmation checkboxes validation
        const identityCheck = document.getElementById('identityCheck');
        const intentCheck = document.getElementById('intentCheck');
        const integrityCheck = document.getElementById('integrityCheck');

        if (!identityCheck || !identityCheck.checked) {
            showError(identityCheck ? identityCheck.parentElement : document.body, 'You must confirm your identity');
            errors.push('Identity Confirmation');
            isValid = false;
        }

        if (!intentCheck || !intentCheck.checked) {
            showError(intentCheck ? intentCheck.parentElement : document.body, 'You must confirm your intent and commitment');
            errors.push('Intent & Commitment');
            isValid = false;
        }

        if (!integrityCheck || !integrityCheck.checked) {
            showError(integrityCheck ? integrityCheck.parentElement : document.body, 'You must confirm information integrity');
            errors.push('Information Integrity');
            isValid = false;
        }

        // File validations
        const resultsCertEl = document.getElementById('resultsCert');
        if (!resultsCertEl.files || resultsCertEl.files.length === 0) {
            showError(document.getElementById('documents-dropzone'), 'School results or certificates are required');
            isValid = false;
        }

        const proofEl = document.getElementById('proofOfPayment');
        if (!proofEl.files || proofEl.files.length === 0) {
            showError(document.getElementById('proof-dropzone'), 'Payment proof (Zanaco receipt) is required');
            isValid = false;
        }

        if (!isValid) {
            // Scroll to first error
            const firstError = form.querySelector('.text-red-500');
            if (firstError) {
                scrollToError(firstError.previousElementSibling || firstError);
            }
            showErrorBanner('Please fix the errors above before submitting');
            return;
        }

        // Save to session and redirect to review page
        saveAndReview();
    });

    // Extract subjects and grades from both desktop table and mobile picker
    function extractSubjectsFromTable() {
        const subjects = [];
        
        // First, try to get from mobile picker hidden field
        const subjectsGradesField = document.getElementById('subjectsGrades');
        if (subjectsGradesField && subjectsGradesField.value) {
            try {
                return JSON.parse(subjectsGradesField.value);
            } catch (e) {
                // Fall through to try other methods
            }
        }
        
        // Try desktop table
        const desktopTable = document.getElementById('subjects-table-desktop');
        if (desktopTable) {
            const rows = desktopTable.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                
                // Process each pair of columns (subject, grade)
                for (let i = 0; i < cells.length; i += 2) {
                    const subjectCell = cells[i];
                    const gradeCell = cells[i + 1];
                    
                    if (subjectCell && gradeCell) {
                        // Get subject name - handle both static text and input fields
                        let subjectName = '';
                        
                        // First check for input (including custom subject inputs)
                        const subjectInputs = subjectCell.querySelectorAll('input[type="text"]');
                        if (subjectInputs.length > 0) {
                            subjectName = subjectInputs[0].value.trim();
                        } else {
                            // Fall back to cell text content for predefined subjects
                            subjectName = subjectCell.textContent.trim();
                        }
                        
                        // Get grade value
                        const gradeInputs = gradeCell.querySelectorAll('input[type="text"]');
                        const grade = gradeInputs.length > 0 ? gradeInputs[0].value.trim() : '';
                        
                        // Include if grade is entered and subject name exists
                        if (grade && subjectName) {
                            subjects.push({
                                subject: subjectName,
                                grade: grade
                            });
                        }
                    }
                }
            });
        }
        
        return subjects;
    }

    // Global storage for files that survives page navigation
    window.persistedApplicationFiles = null;

    async function saveAndReview() {
        // Extract subjects from table and populate hidden field
        const subjects = extractSubjectsFromTable();
        console.log('Extracted subjects:', subjects);
        document.getElementById('subjectsGrades').value = JSON.stringify(subjects);
        console.log('subjectsGrades field value:', document.getElementById('subjectsGrades').value);
        
        const data = {
            // Personal Details
            firstname: document.getElementById('firstname').value.trim(),
            surname: document.getElementById('surname').value.trim(),
            gender: document.getElementById('gender').value,
            dob: document.getElementById('dob').value,
            nrc: document.getElementById('nrc').value.trim(),
            nationality: document.getElementById('nationality').value,
            address: document.getElementById('address').value.trim(),
            cell: document.getElementById('cell').value.trim(),
            email: document.getElementById('email').value.trim(),
            
            // Education
            lastSchool: document.getElementById('lastSchool').value.trim(),
            educationAttained: document.getElementById('educationAttained').value.trim(),
            yearCompleted: document.getElementById('yearCompleted').value.trim(),
            subjectsGrades: JSON.stringify(subjects),
            prevQualifications: document.getElementById('prevQualifications').value.trim(),
            
            // Courses
            choice1: document.querySelector('input[name="choice1"]:checked').value,
            choice2: document.getElementById('choice2').value,
            
            // Study Preferences
            mode: document.querySelector('input[name="mode"]:checked').value,
            level: document.getElementById('levelSelect').value,
            
            // Sponsor
            sponsorName: document.getElementById('sponsorName').value.trim(),
            sponsorPostal: document.getElementById('sponsorPostal').value.trim(),
            sponsorEmail: document.getElementById('sponsorEmail').value.trim(),
            sponsorCell: document.getElementById('sponsorCell').value.trim(),
            sponsorOccupation: document.getElementById('sponsorOccupation').value.trim(),
            sponsorRelation: document.getElementById('sponsorRelation').value.trim(),
            
            // Finalization
            identityCheck: document.getElementById('identityCheck').checked,
            intentCheck: document.getElementById('intentCheck').checked,
            integrityCheck: document.getElementById('integrityCheck').checked,
            applicationDate: document.getElementById('applicationDate').value,
            
            // Payment
            paymentMethod: 'Zanaco Bill Muster',
            applicationFee: 'K100',
            zanacoBankAccount: '0596204400114'
        };
        
        console.log('Data to be stored:', data.subjectsGrades);

        // Store data in session storage
        sessionStorage.setItem('applicationData', JSON.stringify(data));
        
        // Get File objects from input elements
        const proofOfPaymentFile = document.getElementById('proofOfPayment').files[0] || null;
        const resultsCertFile = document.getElementById('resultsCert').files[0] || null;
        const attachmentsFiles = Array.from(document.getElementById('attachments').files || []);
        
        // Store metadata for display on review page (serializable data only)
        const fileInfo = {
            proofOfPayment: proofOfPaymentFile ? {
                name: proofOfPaymentFile.name,
                size: proofOfPaymentFile.size,
                type: proofOfPaymentFile.type
            } : null,
            resultsCert: resultsCertFile ? {
                name: resultsCertFile.name,
                size: resultsCertFile.size,
                type: resultsCertFile.type
            } : null,
            attachments: attachmentsFiles.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type
            }))
        };
        
        sessionStorage.setItem('applicationFiles', JSON.stringify(fileInfo));
        
        // Store actual File objects in window for session-level persistence
        // Note: File objects cannot be serialized to IndexedDB, so we keep them in memory
        // This works within a single browser session (apply.html -> review.html)
        window.persistedApplicationFiles = {
            proofOfPayment: proofOfPaymentFile,
            resultsCert: resultsCertFile,
            attachments: attachmentsFiles
        };
        
        console.log('Files stored in memory. Payment receipt:', proofOfPaymentFile ? 'Yes' : 'No', 'School results:', resultsCertFile ? 'Yes' : 'No', 'Attachments:', attachmentsFiles.length);
        
        window.formSubmitted = true;
        window.currentFormData = data;
        
        // Redirect to review page
        window.location.href = 'review.html';
    }

    // IndexedDB helper functions
    function openIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ApplicationDatabase', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('applicationFiles')) {
                    db.createObjectStore('applicationFiles', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    function getFilesFromIndexedDB() {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await openIndexedDB();
                const tx = db.transaction('applicationFiles', 'readonly');
                const store = tx.objectStore('applicationFiles');
                const request = store.getAll();
                
                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                    const records = request.result;
                    const files = {
                        proofOfPayment: null,
                        resultsCert: null,
                        attachments: []
                    };
                    
                    records.forEach(record => {
                        if (record.type === 'proofOfPayment') {
                            files.proofOfPayment = record.file;
                        } else if (record.type === 'resultsCert') {
                            files.resultsCert = record.file;
                        } else if (record.type === 'attachment') {
                            files.attachments.push(record.file);
                        }
                    });
                    
                    resolve(files);
                };
            } catch (err) {
                reject(err);
            }
        });
    }

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function showErrorBanner(msg) {
        const el = document.createElement('div');
        el.className = 'fixed top-20 left-4 right-4 max-w-md bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3';
        el.innerHTML = `<i class="fas fa-exclamation-triangle text-lg flex-shrink-0"></i> <span>${msg}</span>`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 6000);
    }

})();
