const ICS = require('ics');
const allowCors = require('../utils/allowCors');

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { eventDetails, fileName } = req.body;

    if (!eventDetails || !fileName) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const { title, description, location, start, end } = eventDetails;

    try {
        const event = {
            start,
            end,
            title,
            description,
            location,
            status: 'CONFIRMED',
        };

        ICS.createEvent(event, (error, icsContent) => {
            if (error) {
                return res.status(500).json({ success: false, message: error.message });
            }

            const safeFileName = encodeURIComponent(fileName);

            res.setHeader('Content-Type', 'text/calendar');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}.ics"`);
            res.setHeader('Content-Length', Buffer.byteLength(icsContent));

            res.send(icsContent);
        });
    } catch (error) {
        console.error('Error generating ICS:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while generating the ICS file.',
        });
    }
};

module.exports = allowCors(handler);
