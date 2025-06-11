let userSkills = [];
let generatedResume = '';
let generatedCoverLetter = '';

// Skills management
document.getElementById('skillInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addSkill(this.value.trim());
        this.value = '';
    }
});

function addSkill(skill) {
    if (skill && !userSkills.includes(skill)) {
        userSkills.push(skill);
        updateSkillsDisplay();
    }
}

function removeSkill(skill) {
    userSkills = userSkills.filter(s => s !== skill);
    updateSkillsDisplay();
}

function updateSkillsDisplay() {
    const container = document.getElementById('skillsContainer');
    container.innerHTML = userSkills.map(skill =>
        `<div class="skill-tag">
            ${skill}
            <span class="skill-remove" onclick="removeSkill('${skill}')">×</span>
        </div>`
    ).join('');
}

// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

    document.querySelector(`.tab:nth-child(${tab === 'resume' ? '1' : '2'})`).classList.add('active');
    document.getElementById(tab === 'resume' ? 'resumeTab' : 'coverLetterTab').classList.add('active');
}

// Form submission
document.getElementById('resumeForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        targetRole: document.getElementById('targetRole').value,
        experience: document.getElementById('experience').value,
        education: document.getElementById('education').value,
        skills: userSkills,
        workExperience: document.getElementById('workExperience').value,
        companyName: document.getElementById('companyName').value
    };

    document.getElementById('resumePreview').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            Generating AI-powered resume...
        </div>
    `;
    document.getElementById('coverLetterPreview').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            Generating AI-powered cover letter...
        </div>
    `;

    try {
        const resumeContent = await callOpenAI_Resume(formData);
        generatedResume = resumeContent;
        const cleanedContent = cleanContent(resumeContent);
        document.getElementById('resumePreview').innerHTML = cleanedContent;
    } catch (err) {
        document.getElementById('resumePreview').innerHTML = `
            <div style="color: red; padding: 20px; text-align: center;">
                ❌ Error generating resume. Please try again.
                <br><small>${err.message}</small>
            </div>
        `;
    }

    generateCoverLetter(formData);
});

// Enhanced content cleaning function
function cleanContent(content) {
    return content
        .replace(/\n\s*\n\s*\n+/g, '\n\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\s+|\s+$/g, '')
        .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '<br>')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

// Updated resume generation with better PDF-friendly formatting
async function callOpenAI_Resume(data) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return `
        <div class="pdf-content" style="font-family: Arial, sans-serif; color: #000; line-height: 1.4; max-width: 100%; word-wrap: break-word;">
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; page-break-inside: avoid;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #000;">${data.fullName}</h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #000;">${data.email} | ${data.phone} | ${data.location}</p>
            </div>
            
            <div style="margin-bottom: 20px; page-break-inside: avoid;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; color: #000;">OBJECTIVE</h3>
                <p style="margin: 0; text-align: justify; color: #000;">Experienced ${data.targetRole} with ${data.experience} years of experience seeking to leverage skills in ${data.skills.slice(0, 3).join(', ')} to contribute to ${data.companyName || 'your organization'}.</p>
            </div>
            
            <div style="margin-bottom: 20px; page-break-inside: avoid;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; color: #000;">EDUCATION</h3>
                <p style="margin: 0; color: #000;">${data.education}</p>
            </div>
            
            <div style="margin-bottom: 20px; page-break-inside: avoid;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; color: #000;">SKILLS</h3>
                <div style="margin: 0;">
                    ${data.skills.map(skill => `<span style="display: inline-block; margin: 2px; padding: 2px 8px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; font-size: 12px; color: #000;">${skill}</span>`).join('')}
                </div>
            </div>
            
            ${data.workExperience ? `
            <div style="margin-bottom: 20px; page-break-inside: avoid;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; color: #000;">WORK EXPERIENCE</h3>
                <p style="margin: 0; text-align: justify; color: #000;">${data.workExperience}</p>
            </div>
            ` : ''}
            
            <div style="height:32px;"></div>
        </div>
    `;
}

// Enhanced Cover Letter generation
function generateCoverLetter(data) {
    const today = new Date().toLocaleDateString();
    generatedCoverLetter = `
        <div class="pdf-content" style="font-family: Arial, sans-serif; color: #000; line-height: 1.6; max-width: 100%; word-wrap: break-word;">
            <div style="margin-bottom: 20px; page-break-inside: avoid;">
                <strong style="color: #000;">${data.fullName}</strong><br>
                <span style="color: #000;">${data.email}</span><br>
                <span style="color: #000;">${data.phone}</span><br>
                <span style="color: #000;">${data.location}</span>
            </div>
            
            <div style="margin-bottom: 20px; color: #000;">${today}</div>
            
            <p style="color: #000;">Dear Hiring Manager,</p>
            
            <p style="color: #000; text-align: justify;">I am excited to apply for the position of ${data.targetRole} at ${data.companyName || 'your company'}. With ${data.experience} years of experience and skills in ${data.skills.slice(0, 3).join(', ')}, I believe I am a strong candidate for this role.</p>
            
            ${data.workExperience ? `<p style="color: #000; text-align: justify;">In my recent role, I have been involved in ${data.workExperience.substring(0, 100)}... My background has prepared me well for the challenges of this position.</p>` : ''}
            
            <p style="color: #000; text-align: justify;">My education in ${data.education} has provided me with a strong foundation in the field, and I am eager to bring my skills and enthusiasm to your team.</p>
            
            <p style="color: #000; text-align: justify;">Thank you for your time and consideration. I look forward to the opportunity to discuss how I can contribute to your organization.</p>
            
            <p style="color: #000;">Sincerely,<br>${data.fullName}</p>
        </div>
    `;
    document.getElementById('coverLetterPreview').innerHTML = generatedCoverLetter;
}

// Fixed PDF Download function
function downloadPDF(type) {
    const element = document.getElementById(type === 'resume' ? 'resumePreview' : 'coverLetterPreview');
    
    if (!element || !element.innerHTML.trim()) {
        alert('Please generate the ' + type + ' first before downloading.');
        return;
    }

    const options = {
        margin: 0.5,
        filename: type === 'resume' ? 'Resume.pdf' : 'Cover_Letter.pdf',
        image: { 
            type: 'jpeg', 
            quality: 0.98
        },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            allowTaint: true,
            letterRendering: true,
            logging: false
            // Do NOT set width/height here!
        },
        jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait',
            compress: true
        },
        pagebreak: { 
            mode: ['avoid-all', 'css', 'legacy'],
            before: '.page-break-before',
            after: '.page-break-after',
            avoid: ['tr', 'td', 'th', 'div.skill-tag']
        }
    };

    // Use the actual DOM element, not a clone or temp container
    html2pdf()
        .set(options)
        .from(element)
        .save()
        .catch(error => {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try again.');
        });
}

// Alternative PDF download using browser's print function
function downloadPDFPrint(type) {
    const element = document.getElementById(type === 'resume' ? 'resumePreview' : 'coverLetterPreview');
    
    if (!element || !element.innerHTML.trim()) {
        alert('Please generate the ' + type + ' first before downloading.');
        return;
    }

    const printWindow = window.open('', '_blank');
    
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${type === 'resume' ? 'Resume' : 'Cover Letter'}</title>
            <style>
                @page {
                    size: A4;
                    margin: 0.5in;
                }
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.4;
                    color: black;
                    background: white;
                    margin: 0;
                    padding: 0;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .skill-remove {
                    display: none;
                }
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${element.innerHTML}
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
}

// Pre-populate sample skills
window.addEventListener('load', function () {
    ['JavaScript', 'React', 'Node.js', 'HTML/CSS', 'Git', 'MongoDB'].forEach(skill => {
        userSkills.push(skill);
    });
    updateSkillsDisplay();
});