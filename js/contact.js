// Contact Form Handler
(function(){
    const form = document.getElementById('contact-form');
    if (!form) return;

    function getFormData(){
        const inputs = form.querySelectorAll('input, textarea, select');
        const data = {};
        inputs.forEach(i => { if (i.name || i.placeholder) data[i.name || i.placeholder] = i.value; });
        return data;
    }

    function openWhatsApp(text){
        const phone = '260761700608';
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }

    function openMail(to, subject, body){
        const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
    }

    form.addEventListener('submit', function(e){
        e.preventDefault();
        const name = form.querySelector('input[type="text"]').value || '';
        const phone = form.querySelector('input[type="tel"]').value || '';
        const program = form.querySelector('select') ? form.querySelector('select').value : '';
        const message = form.querySelector('textarea').value || '';

        const body = `Name: ${name}\nPhone: ${phone}\nProgram: ${program}\n\nMessage:\n${message}`;

        // Show choice modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="max-w-lg w-full glass-card rounded-2xl p-6">
                <h3 class="text-lg font-bold mb-3">Send message via</h3>
                <div class="flex gap-3 mb-4">
                    <button id="via-ws" class="flex-1 bg-green-600 text-white px-4 py-3 rounded">WhatsApp</button>
                    <button id="via-mail" class="flex-1 bg-slate-700 text-white px-4 py-3 rounded">Email</button>
                </div>
                <div class="text-right"><button id="via-cancel" class="text-sm text-slate-500">Cancel</button></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#via-ws').addEventListener('click', () => { openWhatsApp(body); modal.remove(); });
        modal.querySelector('#via-mail').addEventListener('click', () => { openMail('crawhammer.marketing@gmail.com', `Enquiry from ${name}`, body); modal.remove(); });
        modal.querySelector('#via-cancel').addEventListener('click', () => modal.remove());
    });
})();
