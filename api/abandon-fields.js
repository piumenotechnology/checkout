const sgMail = require('@sendgrid/mail');
const allowCors = require('../utils/allowCors');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const handler = async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const data = JSON.parse(req.body);

        const timestampCA = new Date().toLocaleString("en-CA", {
            timeZone: "America/Toronto",
            dateStyle: "full",
            timeStyle: "long",
        });

        let fullEmails = [];

        if (Array.isArray(data.emailUsers) && Array.isArray(data.emailDomains)) {
            fullEmails = data.emailUsers.map((user, idx) => {
                const domain = data.emailDomains[idx] || "";
                return user && domain ? `${user}@${domain}` : user || domain || "";
            }).filter(Boolean);
        } else if (Array.isArray(data.emailAddresses)) {
            fullEmails = data.emailAddresses;
        }

        const msg = {
            to: ['rimbunkarya2016@gmail.com', 'izzudinfasya@gmail.com'],
            from: 'masfess24@gmail.com',
            subject: 'Abandoned Checkout Form',
            html: `
                <h3>Abandoned Form Data</h3>
                <p><strong>Names:</strong> ${data.userName?.join(", ") || "N/A"}</p>
                <p><strong>Emails:</strong> ${fullEmails.join(", ") || "N/A"}</p>
                <p><strong>Companies:</strong> ${data.compNames?.join(", ") || "N/A"}</p>
                <p><strong>Event Web:</strong> ${data.eventWeb}</p>
                <p><strong>Time:</strong> ${timestampCA}</p>
            `,
        };

        await sgMail.send(msg);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error sending abandon email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
};

module.exports = allowCors(handler);
