// Application Form Handler
(function () {
    const form = document.querySelector('#application-form form');
    if (!form) return;

    // Copy account number to clipboard
    const copyBtn = document.querySelector('.copy-account-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const accountNum = '0596204400114';
            navigator.clipboard.writeText(accountNum).then(() => {
                const originalIcon = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check text-green-600 text-xl"></i>';
                setTimeout(() => {
                    this.innerHTML = originalIcon;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        });
    }

    // ensure a multiple file input exists; create it if missing
    let attachmentsInput = form.querySelector('input[name="attachments"]');
    if (!attachmentsInput) {
        const wrapper = document.createElement('div');
        wrapper.className = 'mt-4';
        wrapper.innerHTML = '<label class="block font-medium">Attach documents (multiple allowed)</label>' +
            '<input id="attachments" name="attachments" type="file" multiple class="mt-1 block w-full" />';
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn && submitBtn.parentNode) submitBtn.parentNode.insertBefore(wrapper, submitBtn);
        else form.appendChild(wrapper);
        attachmentsInput = form.querySelector('input[name="attachments"]');
    }

    // attachments UI: show selected files and support drag & drop
    (function attachmentsUi() {
        const dropzone = document.getElementById('dropzone');
        const list = document.getElementById('attachments-list');
        if (!attachmentsInput || !dropzone || !list) return;

        function renderFiles() {
            const files = attachmentsInput.files;
            if (!files || files.length === 0) {
                list.textContent = 'No files selected.';
                return;
            }
            const ul = document.createElement('ul');
            ul.className = 'space-y-1';
            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                const li = document.createElement('li');
                li.className = 'flex justify-between items-center';
                li.innerHTML = `<span class="truncate">${f.name} <span class="text-xs text-slate-400">(${Math.round(f.size/1024)} KB)</span></span>`;
                ul.appendChild(li);
            }
            list.innerHTML = '';
            list.appendChild(ul);
            const clear = document.createElement('button');
            clear.type = 'button';
            clear.className = 'mt-2 text-xs text-red-600 underline';
            clear.textContent = 'Remove all';
            clear.addEventListener('click', () => {
                const dt = new DataTransfer();
                attachmentsInput.files = dt.files;
                renderFiles();
            });
            list.appendChild(clear);
        }

        attachmentsInput.addEventListener('change', renderFiles);

        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('bg-slate-100'); });
        dropzone.addEventListener('dragleave', (e) => { dropzone.classList.remove('bg-slate-100'); });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('bg-slate-100');
            const dt = e.dataTransfer;
            if (dt && dt.files && dt.files.length) {
                const dataTransfer = new DataTransfer();
                for (let i = 0; i < dt.files.length; i++) dataTransfer.items.add(dt.files[i]);
                attachmentsInput.files = dataTransfer.files;
                renderFiles();
            }
        });

        renderFiles();
    })();

    // Proof of Payment UI: show selected file and support drag & drop
    (function proofOfPaymentUi() {
        const proofInput = document.getElementById('proofOfPayment');
        const proofDropzone = document.getElementById('proof-dropzone');
        const proofFileInfo = document.getElementById('proof-file-info');
        
        if (!proofInput || !proofDropzone || !proofFileInfo) return;

        function renderProofFile() {
            if (!proofInput.files || proofInput.files.length === 0) {
                proofFileInfo.textContent = 'No file selected.';
                proofDropzone.classList.remove('border-orange-500', 'bg-orange-50');
                proofDropzone.classList.add('border-slate-200', 'bg-slate-50');
                return;
            }
            const file = proofInput.files[0];
            proofFileInfo.innerHTML = `
                <div class="flex items-center justify-between">
                    <span><i class="fas fa-check-circle text-green-600 mr-2"></i>${file.name} <span class="text-xs text-slate-500">(${Math.round(file.size/1024)} KB)</span></span>
                    <button type="button" class="text-red-600 text-xs underline hover:text-red-800">Remove</button>
                </div>
            `;
            const removeBtn = proofFileInfo.querySelector('button');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    const dt = new DataTransfer();
                    proofInput.files = dt.files;
                    renderProofFile();
                });
            }
            proofDropzone.classList.remove('border-slate-200', 'bg-slate-50');
            proofDropzone.classList.add('border-orange-500', 'bg-orange-50');
        }

        proofInput.addEventListener('change', renderProofFile);

        proofDropzone.addEventListener('dragover', (e) => { 
            e.preventDefault(); 
            proofDropzone.classList.add('border-orange-500', 'bg-orange-50');
        });
        proofDropzone.addEventListener('dragleave', (e) => { 
            proofDropzone.classList.remove('border-orange-500', 'bg-orange-50');
        });
        proofDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            const dt = e.dataTransfer;
            if (dt && dt.files && dt.files.length) {
                // Accept only the first file for proof of payment
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(dt.files[0]);
                proofInput.files = dataTransfer.files;
                renderProofFile();
            }
        });

        renderProofFile();
    })();

    // Replace or populate the nationality input with a country dropdown
    (function populateNationality() {
        const natEl = document.getElementById('nationality');
        if (!natEl) return;
        const countries = [
            'Zambia','Zimbabwe','South Africa','Botswana','Namibia','Mozambique','Malawi','Tanzania','Kenya','Uganda',
            'Nigeria','Ghana','Sierra Leone','Liberia','Cameroon','Egypt','Morocco','Algeria','Tunisia','Sudan',
            'United Kingdom','United States','Canada','Australia','New Zealand','India','Pakistan','Bangladesh',
            'China','Japan','South Korea','Germany','France','Italy','Spain','Portugal','Brazil','Argentina','Chile',
            'Netherlands','Belgium','Sweden','Norway','Denmark','Finland','Russia'
        ];

        const select = document.createElement('select');
        select.id = natEl.id;
        select.name = natEl.name || 'nationality';
        select.className = natEl.className;

        countries.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            select.appendChild(opt);
        });

        const initial = (natEl.value || '').trim();
        if (initial) {
            const match = Array.from(select.options).find(o => o.value.toLowerCase() === initial.toLowerCase());
            if (match) match.selected = true;
            else {
                const opt = document.createElement('option'); opt.value = initial; opt.textContent = initial; opt.selected = true; select.insertBefore(opt, select.firstChild);
            }
        }

        natEl.parentNode.replaceChild(select, natEl);
    })();

    // Auto-insert slashes into NRC input to format XXXXXX/XX/X and restrict to digits
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
            if (e.ctrlKey || e.metaKey || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') return;
            if (!/\d/.test(e.key)) e.preventDefault();
        });
    })();

    function showError(el, msg) {
        clearError(el);
        const node = document.createElement('p');
        node.className = 'text-red-500 text-sm mt-1';
        node.textContent = msg;
        el.insertAdjacentElement('afterend', node);
    }

    function clearError(el) {
        const next = el.nextElementSibling;
        if (next && next.classList && next.classList.contains('text-red-500')) next.remove();
    }

    function validateNRC(value) {
        const trimmed = value.trim();
        if (/^\d{6}\/\d{2}\/\d{1}$/.test(trimmed)) return true;
        if (/^\d{9}$/.test(trimmed)) return true;
        return false;
    }

    function validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    function validatePhone(value) {
        const digits = value.replace(/\D/g, '');
        if (digits.length === 12 && digits.startsWith('260')) return true;
        if (digits.length === 10 && digits.startsWith('0')) return true;
        return false;
    }

    function gatherData() {
        const data = {};
        data.surname = document.getElementById('surname').value.trim();
        data.firstname = document.getElementById('firstname').value.trim();
        data.gender = document.getElementById('gender') ? document.getElementById('gender').value : '';
        data.dob = document.getElementById('dob') ? document.getElementById('dob').value : '';
        data.nrc = document.getElementById('nrc').value.trim();
        data.nationality = document.getElementById('nationality') ? document.getElementById('nationality').value : '';
        data.address = document.getElementById('address').value.trim();
        data.cell = document.getElementById('cell').value.trim();
        data.phone = document.getElementById('cell').value.trim();
        data.email = document.getElementById('email').value.trim();
        data.lastSchool = document.getElementById('lastSchool') ? document.getElementById('lastSchool').value.trim() : '';
        data.educationAttained = document.getElementById('educationAttained') ? document.getElementById('educationAttained').value.trim() : '';
        data.yearCompleted = document.getElementById('yearCompleted') ? document.getElementById('yearCompleted').value.trim() : '';
        data.prevQualifications = document.getElementById('prevQualifications') ? document.getElementById('prevQualifications').value.trim() : '';
        data.choice1 = (document.querySelector('input[name="choice1"]:checked') || {}).value || '';
        data.choice2 = document.getElementById('choice2') ? document.getElementById('choice2').value : '';
        data.mode = (document.querySelector('input[name="mode"]:checked') || {}).value || '';
        data.level = document.getElementById('levelSelect') ? document.getElementById('levelSelect').value : '';
        data.sponsorName = document.getElementById('sponsorName') ? document.getElementById('sponsorName').value.trim() : '';
        data.sponsorCell = document.getElementById('sponsorCell') ? document.getElementById('sponsorCell').value.trim() : '';
        data.sponsorPostal = document.getElementById('sponsorPostal') ? document.getElementById('sponsorPostal').value.trim() : '';
        data.sponsorOccupation = document.getElementById('sponsorOccupation') ? document.getElementById('sponsorOccupation').value.trim() : '';
        data.sponsorRelation = document.getElementById('sponsorRelation') ? document.getElementById('sponsorRelation').value.trim() : '';
        data.applicationFee = 'K100';
        data.paymentMethod = 'Zanaco Bill Muster';
        data.zanacoBankAccount = '0596204400114';
        return data;
    }

    function openReviewPage(data) {
        sessionStorage.setItem('applicationData', JSON.stringify(data));
        
        const fileData = [];
        const proofInput = document.getElementById('proofOfPayment');
        const proofFile = proofInput && proofInput.files && proofInput.files.length > 0 ? proofInput.files[0] : null;
        
        // Function to read and store proof of payment
        function processProofOfPayment() {
            if (proofFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const proofData = {
                        name: proofFile.name,
                        type: proofFile.type,
                        size: proofFile.size,
                        data: e.target.result,
                        isProofOfPayment: true
                    };
                    sessionStorage.setItem('proofOfPayment', JSON.stringify(proofData));
                    processAttachments();
                };
                reader.readAsArrayBuffer(proofFile);
            } else {
                processAttachments();
            }
        }
        
        // Function to process other attachments
        function processAttachments() {
            for (let i = 0; i < attachmentsInput.files.length; i++) {
                const file = attachmentsInput.files[i];
                const reader = new FileReader();
                reader.onload = (e) => {
                    fileData.push({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: e.target.result
                    });
                    if (fileData.length === attachmentsInput.files.length) {
                        sessionStorage.setItem('applicationFiles', JSON.stringify(fileData));
                        window.location.href = 'review.html';
                    }
                };
                reader.readAsArrayBuffer(file);
            }
            
            if (attachmentsInput.files.length === 0) {
                sessionStorage.setItem('applicationFiles', JSON.stringify([]));
                window.location.href = 'review.html';
            }
        }
        
        processProofOfPayment();
    }

    function showSuccess(msg) {
        const el = document.createElement('div');
        el.className = 'fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 6000);
    }

    function showErrorBanner(msg) {
        const el = document.createElement('div');
        el.className = 'fixed bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded shadow';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 8000);
    }

    function onSubmit(e) {
        e.preventDefault();
        let valid = true;
        const errors = [];

        ['surname','firstname','nrc','cell','email','address'].forEach(id => {
            const el = document.getElementById(id);
            if (el) clearError(el);
        });

        // Validate proof of payment file is uploaded
        const proofInput = document.getElementById('proofOfPayment');
        if (!proofInput || !proofInput.files || proofInput.files.length === 0) {
            const dropzone = document.getElementById('proof-dropzone');
            if (dropzone) {
                showError(dropzone, 'Proof of payment (Zanaco Bill Muster receipt) is required.');
                errors.push('Proof of payment');
                valid = false;
            }
        }

        ['surname','firstname','address'].forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.value.trim()) { 
                showError(el, 'This field is required.'); 
                errors.push(el.previousElementSibling?.textContent || id);
                valid = false; 
            }
        });

        const nrcEl = document.getElementById('nrc');
        if (!nrcEl.value.trim()) {
            showError(nrcEl, 'NRC is required.');
            errors.push('NRC');
            valid = false;
        } else if (!validateNRC(nrcEl.value)) { 
            showError(nrcEl, 'NRC must be in format XXXXXX/XX/X or 9 digits.'); 
            errors.push('NRC format');
            valid = false; 
        }

        const cellEl = document.getElementById('cell');
        if (!cellEl.value.trim()) {
            showError(cellEl, 'Cell number is required.');
            errors.push('Cell number');
            valid = false;
        } else if (!validatePhone(cellEl.value)) { 
            showError(cellEl, 'Enter a valid cell number (0XXXXXXXXX or +260XXXXXXXXX).'); 
            errors.push('Cell number format');
            valid = false; 
        }

        const emailEl = document.getElementById('email');
        if (emailEl.value && !validateEmail(emailEl.value)) { 
            showError(emailEl, 'Enter a valid email address.'); 
            errors.push('Email format');
            valid = false; 
        }

        if (!valid) {
            const firstError = form.querySelector('.text-red-500');
            if (firstError) {
                firstError.previousElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            if (window.innerWidth < 768) {
                showErrorBanner('Please fix the following: ' + errors.join(', '));
            }
            return;
        }

        const data = gatherData();
        openReviewPage(data);
    }

    form.addEventListener('submit', onSubmit);
})();
