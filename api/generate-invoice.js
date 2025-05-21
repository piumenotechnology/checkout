const chromium = require("@sparticuz/chromium");
const puppeteer = require('puppeteer-core');
const allowCors = require('../utils/allowCors');

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { htmlContent, fileName } = req.body;

    if (!htmlContent || !fileName) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const executablePath = await chromium.executablePath();

        if (!executablePath) {
            throw new Error("Chromium executable not found.");
        }

        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({ format: 'A4' });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating PDF:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while generating the PDF.',
        });
    }
};

module.exports = allowCors(handler);
