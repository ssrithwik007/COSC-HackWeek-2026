document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const form = {
        fullName: document.getElementById('fullName'),
        jobTitle: document.getElementById('jobTitle'),
        company: document.getElementById('company'),
        phone: document.getElementById('phone'),
        email: document.getElementById('email'),
        website: document.getElementById('website'),
        linkedin: document.getElementById('linkedin'),
        github: document.getElementById('github'),
        twitter: document.getElementById('twitter'),
        instagram: document.getElementById('instagram'),
        profilePic: document.getElementById('profilePic'),
        template: document.getElementById('templateSelector'),
        accentColor: document.getElementById('accentColor'),
    };

    const preview = {
        name: document.getElementById('preview-name'),
        title: document.getElementById('preview-title'),
        company: document.getElementById('preview-company'),
        phone: document.getElementById('preview-phone'),
        email: document.getElementById('preview-email'),
        website: document.getElementById('preview-website'),
        img: document.getElementById('preview-img'),
        linkPhone: document.getElementById('link-phone'),
        linkEmail: document.getElementById('link-email'),
        linkWebsite: document.getElementById('link-website'),
        linkLinkedin: document.getElementById('link-linkedin'),
        linkGithub: document.getElementById('link-github'),
        linkTwitter: document.getElementById('link-twitter'),
        linkInstagram: document.getElementById('link-instagram'),
        card: document.getElementById('card-preview')
    };

    const colorHex = document.getElementById('colorHex');
    const btnReset = document.getElementById('btn-reset');
    const btnPng = document.getElementById('btn-png');
    const btnPdf = document.getElementById('btn-pdf');
    const canvasQR = document.getElementById('qr-code');
    
    let qr = new QRious({
        element: canvasQR,
        value: 'https://example.com',
        size: 200,
        background: 'white',
        foreground: '#000000'
    });

    // Default configuration
    const defaultData = {
        fullName: 'Maximus Decimus Meridius',
        jobTitle: 'Graphic Designer',
        company: 'Example Business Pvt. Ltd.',
        phone: '',
        email: '',
        website: '',
        linkedin: '',
        github: '',
        twitter: '',
        instagram: '',
        template: 'template-minimal',
        accentColor: '#3B82F6',
        profilePicData: '' // base64
    };

    let currentData = { ...defaultData };

    // Load from local storage
    const saved = localStorage.getItem('businessCardGen_v1');
    if (saved) {
        try {
            currentData = { ...currentData, ...JSON.parse(saved) };
        } catch (e) {
            console.error("Local storage reset due to corrupted data.");
        }
    }

    // Initialize Form UI
    function populateForm() {
        form.fullName.value = currentData.fullName;
        form.jobTitle.value = currentData.jobTitle;
        form.company.value = currentData.company;
        form.phone.value = currentData.phone;
        form.email.value = currentData.email;
        form.website.value = currentData.website;
        form.linkedin.value = currentData.linkedin;
        form.github.value = currentData.github;
        form.twitter.value = currentData.twitter;
        form.instagram.value = currentData.instagram;
        form.template.value = currentData.template;
        form.accentColor.value = currentData.accentColor;
        colorHex.textContent = currentData.accentColor;
    }

    // Refresh Preview
    function updatePreview() {
        // Text
        preview.name.textContent = currentData.fullName || 'Your Name';
        preview.title.textContent = currentData.jobTitle;
        preview.company.textContent = currentData.company;
        
        preview.phone.textContent = currentData.phone;
        preview.email.textContent = currentData.email;
        preview.website.textContent = currentData.website;

        // Visibility
        preview.linkPhone.classList.toggle('hidden', !currentData.phone);
        preview.linkEmail.classList.toggle('hidden', !currentData.email);
        preview.linkWebsite.classList.toggle('hidden', !currentData.website);
        
        preview.linkLinkedin.classList.toggle('hidden', !currentData.linkedin);
        preview.linkGithub.classList.toggle('hidden', !currentData.github);
        preview.linkTwitter.classList.toggle('hidden', !currentData.twitter);
        preview.linkInstagram.classList.toggle('hidden', !currentData.instagram);
        
        preview.linkPhone.href = currentData.phone ? `tel:${currentData.phone.replace(/\\D/g, '')}` : '#';
        preview.linkEmail.href = currentData.email ? `mailto:${currentData.email}` : '#';
        preview.linkWebsite.href = currentData.website || '#';
        preview.linkLinkedin.href = currentData.linkedin || '#';
        preview.linkGithub.href = currentData.github || '#';
        preview.linkTwitter.href = currentData.twitter || '#';
        preview.linkInstagram.href = currentData.instagram || '#';
        
        // Avatar
        if (currentData.profilePicData) {
            preview.img.src = currentData.profilePicData;
        } else {
            const initial = (currentData.fullName || 'U').charAt(0).toUpperCase();
            preview.img.src = `https://ui-avatars.com/api/?name=${initial}&background=E5E7EB&color=9CA3AF&size=300`;
        }

        // Appearance
        preview.card.className = `card ${currentData.template}`;
        preview.card.style.setProperty('--accent-color', currentData.accentColor);
        colorHex.textContent = currentData.accentColor.toUpperCase();

        // QR Code Updates
        let qrValue = currentData.website || currentData.email || 'https://example.com';
        qr.value = qrValue;
        qr.foreground = currentData.accentColor;

        // Save
        localStorage.setItem('businessCardGen_v1', JSON.stringify(currentData));
        
        // Ensure properly rendered SVGs on unhidden items
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // Event Listeners
    Object.keys(form).forEach(key => {
        if (key === 'profilePic') return; // handled separately
        form[key].addEventListener('input', (e) => {
            currentData[key] = e.target.value;
            updatePreview();
        });
    });

    form.profilePic.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                currentData.profilePicData = event.target.result;
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });

    btnReset.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset your business card?")) {
            currentData = { ...defaultData };
            localStorage.removeItem('businessCardGen_v1');
            form.profilePic.value = "";
            populateForm();
            updatePreview();
        }
    });

    // Fix svg usage for html2canvas
    function prepareForRender() {
        // html2canvas struggles with currentColor in lucide svgs sometimes in certain containers, but usually it works fine now.
    }

    btnPng.addEventListener('click', async () => {
        btnPng.innerHTML = "Generating...";
        prepareForRender();
        try {
            const canvas = await html2canvas(preview.card, { scale: 4, useCORS: true, allowTaint: true, logging: false });
            const link = document.createElement('a');
            link.download = 'business_card.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error(e);
            alert("Error downloading PNG");
        }
        btnPng.innerHTML = '<i data-lucide="image"></i> Download PNG';
        lucide.createIcons();
    });

    btnPdf.addEventListener('click', async () => {
        btnPdf.innerHTML = "Generating...";
        prepareForRender();
        try {
            const canvas = await html2canvas(preview.card, { scale: 4, useCORS: true, allowTaint: true, logging: false });
            const imgData = canvas.toDataURL('image/png');
            
            // Standard business card is 3.5 x 2 inches
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'in',
                format: [3.5, 2]
            });
            
            pdf.addImage(imgData, 'PNG', 0, 0, 3.5, 2);
            pdf.save('business_card.pdf');
        } catch (e) {
            console.error(e);
            alert("Error downloading PDF");
        }
        btnPdf.innerHTML = '<i data-lucide="file-text"></i> Download PDF';
        lucide.createIcons();
    });

    // Load initial icons
    lucide.createIcons();
    
    // Initial render
    populateForm();
    updatePreview();
});
