const postRegistrant = require('../utils/postRegistrant');
const getToken = require('../utils/getToken');
const allowCors = require('../utils/allowCors');

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { participants, eventId, fieldMap, reference } = req.body;

    if (!participants || !eventId) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let swoogoToken;

    try {
        swoogoToken = await getToken();
        if (!swoogoToken) {
            throw new Error('Failed to get swoogo token');
        }

        const allParticipants = Object.values(participants).flat();

        const registrantResponses = await Promise.all(
            allParticipants.map(async (participant) => {
                const registrantData = {
                    email: participant.email,
                    event_id: eventId,
                    first_name: participant.firstName,
                    last_name: participant.lastName,
                    registration_status: 'in_progress',
                    send_email: 'false',
                    discount_code: participant.discount || '',
                    reg_type_id: participant.regType,
                    company: participant.company,
                    job_title: participant.jobTitle,
                    work_phone: participant.phone,
                    [fieldMap.country]: participant.country,
                    [fieldMap.state]: participant.state,
                    payment_method: 'credit_card',
                    reference: reference
                };

                return await postRegistrant(swoogoToken, registrantData);
            })
        );

        if (registrantResponses.some(result => !result.success)) {
            return res.status(400).json({
                success: false,
                message: 'Failed to register one or more participants',
                failedParticipants: registrantResponses.filter(r => !r.success),
            });
        }

        return res.status(200).json({
            success: true,
            registrantResults: registrantResponses,
            nextStep: 'payment',
        });
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message || 'Internal server error',
        });
    }
};

module.exports = allowCors(handler);