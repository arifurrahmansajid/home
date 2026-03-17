const uploadBtn = document.getElementById('uploadBtn');
const cvInput = document.getElementById('cvInput');
const fileDisplay = document.getElementById('fileDisplay');
const fileNameSpan = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFile');
const submitBtn = document.getElementById('submitBtn');
const formCard = document.getElementById('formCard');
const thankYouCard = document.getElementById('thankYouCard');

let selectedFile = null;

// Handle upload button click
uploadBtn.addEventListener('click', () => {
    cvInput.click();
});

// Handle file selection
cvInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        fileNameSpan.textContent = file.name;
        fileDisplay.style.display = 'flex';
        uploadBtn.style.display = 'none';
        submitBtn.disabled = false;
    }
});

// Handle file removal
removeFileBtn.addEventListener('click', () => {
    selectedFile = null;
    cvInput.value = '';
    fileDisplay.style.display = 'none';
    uploadBtn.style.display = 'flex';
    submitBtn.disabled = true;
});

// Handle submission
submitBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('cv', selectedFile);

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/submit', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            formCard.style.display = 'none';
            thankYouCard.style.display = 'flex';
        } else {
            alert('Error: ' + result.message);
            submitBtn.textContent = 'Send';
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to send CV. Please try again.');
        submitBtn.textContent = 'Send';
        submitBtn.disabled = false;
    }
});
