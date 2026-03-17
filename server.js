const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ensure SPA routes still serve index.html if needed
app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/submit')) return next();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/submit', upload.single('cv'), async (req, res) => {
    console.log('--- New Submission Received ---');
    try {
        const { file } = req;
        if (!file) {
            console.log('No file in request');
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        console.log(`Processing file: ${file.originalname} (${file.size} bytes)`);

        // validate env vars before sending
        const requiredEnv = ['EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_TO'];
        const missingEnv = requiredEnv.filter((key) => !process.env[key]);
        if (missingEnv.length > 0) {
            console.error('Missing required env vars:', missingEnv);
            return res.status(500).json({
                success: false,
                message: 'Missing environment variables: ' + missingEnv.join(', '),
            });
        }

        // SMTP Transporter - Simplified for Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Email options
        const mailOptions = {
            from: `"CV Portal" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_TO,
            subject: `New CV Upload: ${file.originalname}`,
            text: `A new CV has been uploaded.\n\nSender/User: ${process.env.EMAIL_USER}\nOriginal Filename: ${file.originalname}`,
            attachments: [
                {
                    filename: file.originalname,
                    content: file.buffer,
                },
            ],
        };

        console.log(`Attempting to send email to: ${process.env.EMAIL_TO}`);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);

        res.json({ success: true, message: 'Thank you for your submission!' });
    } catch (error) {
        console.error('CRITICAL ERROR during submission:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Email delivery failed.',
            detail: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
