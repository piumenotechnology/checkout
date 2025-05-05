const getToken = require('../utils/getToken');
const getEvents = require('../utils/getEvents');
const allowCors = require('../utils/allowCors');

const handler = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { eventId } = req.query;
        console.log('Event ID received:', eventId);

        const token = await getToken();
        console.log('Token fetched:', token);

        const event = await getEvents(token, eventId);
        console.log('Event fetched:', event);

        return res.status(200).json(event);
    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({ error: 'Failed to fetch events' });
    }
};

module.exports = allowCors(handler);
