const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const getToken = require('../utils/getToken');
const postRegistrant = require('../utils/postRegistrant');
const allowCors = require('../utils/allowCors');

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { token, amount, participants, eventId } = req.body;

    if (!token || !amount || !participants || !eventId) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const payment = await stripe.charges.create({
            amount: amount,
            currency: 'cad',
            source: token,
            description: 'Event Registration Payment',
        });

        if (payment.status !== 'succeeded') {
            throw new Error('Payment failed.');
        }

        const swoogoToken = await getToken();

        const allParticipants = Object.values(participants).flat();

        const registrantPromises = allParticipants.map(participant => {
            return postRegistrant(swoogoToken, {
                po_number: `PO-${Date.now()}`,
                email: participant.email,
                event_id: eventId,
                first_name: participant.firstName,
                last_name: participant.lastName,
                registration_status: 'confirmed',
                send_email: 'true',
                discount: {
                    "id": 4728765,
                    "value": "testcodeneel"
                },
                reg_type_id: participant.regType,
                company: participant.company,
                job_title: participant.jobTitle,
            });
        });

        const registrantResponses = await Promise.all(registrantPromises);
        const registrantResults = registrantResponses.map(r => r.data);

        return res.status(200).json({
            success: true,
            paymentData: payment,
            registrantResults,
            nextStep: 'confirmation',
        });

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: error.response?.data || error.message,
        });
    }
};

module.exports = allowCors(handler);
