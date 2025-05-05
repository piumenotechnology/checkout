const getToken = require('../utils/getToken');
const getRegistrant = require('../utils/getRegistrant');
const allowCors = require('../utils/allowCors');

const handler = async (req, res) => {
    const eventId = req.query.event_id || '256029';
    try {
        const token = await getToken();
        const registrants = await getRegistrant(token, eventId);
        res.status(200).json(registrants);
    } catch (error) {
        console.error('Error fetching registrants:', error);
        res.status(500).json({ error: 'Failed to fetch registrants' });
    }
};

module.exports = allowCors(handler);
