const getToken = require('../utils/getToken');
const getDiscount = require('../utils/getDiscount');
const allowCors = require('../utils/allowCors');

const handler = async (req, res) => {
    const eventId = req.query.event_id || '256029';
    try {
        const token = await getToken();
        const discounts = await getDiscount(token, eventId);
        res.status(200).json(discounts);
    } catch (error) {
        console.error('Error fetching discounts:', error);
        res.status(500).json({ error: 'Failed to fetch discounts' });
    }
};

module.exports = allowCors(handler);
