const getToken = require('../utils/getToken');
const getRegTypes = require('../utils/getRegTypes');
const allowCors = require('../utils/allowCors');

const handler = async (req, res) => {
    const eventId = req.query.event_id || '256029';
    try {
        const token = await getToken();
        const regTypes = await getRegTypes(token, eventId);
        res.status(200).json(regTypes);
    } catch (error) {
        console.error('Error fetching registration types:', error);
        res.status(500).json({ error: 'Failed to fetch registration types' });
    }
};

module.exports = allowCors(handler);
