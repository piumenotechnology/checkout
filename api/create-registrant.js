const postRegistrant = require('../utils/postRegistrant');
const getToken = require('../utils/getToken');
const allowCors = require('../utils/allowCors');

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const token = await getToken();
        const registrant = await postRegistrant(token, req.body);

        console.log(registrant);

        return res.status(200).json({
            success: true,
            data: registrant,
            nextStep: 'confirmation',
        });
    } catch (error) {
        console.error('Post error:', error);

        return res.status(500).json({
            success: false,
            error: 'Failed to create registrant',
            message: error.message,
        });
    }
};

module.exports = allowCors(handler);
