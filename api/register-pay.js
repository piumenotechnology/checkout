const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const getToken = require('../utils/getToken');
const allowCors = require('../utils/allowCors');
const axios = require('axios');
const { URLSearchParams } = require('url');

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const {
        token,
        amount,
        description,
        email,
        nameOnCard,
        billingAddressLine1,
        billingCity,
        billingCountry,
        billingPostalCode,
        participants,
        eventId
    } = req.body;

    if (!token || !amount || !participants || !eventId) {
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
                const formData = new URLSearchParams();
                // formData.append('po_number', `PO-${Date.now()}`);
                formData.append('email', participant.email);
                formData.append('event_id', eventId);
                formData.append('first_name', participant.firstName);
                formData.append('last_name', participant.lastName);
                formData.append('registration_status', 'in_progress');
                formData.append('send_email', 'false');
                formData.append('discount_code', participant.discount || '');
                formData.append('reg_type_id', participant.regType);
                formData.append('company', participant.company);
                formData.append('job_title', participant.jobTitle);
                formData.append('work_phone', participant.phone);
                formData.append('c_5970654', participant.country);
                formData.append('c_5970655', participant.state);
                formData.append('payment_method', 'credit_card');

                try {
                    const response = await axios.post(
                        'https://api.swoogo.com/api/v1/registrants/create',
                        formData,
                        {
                            headers: {
                                'Authorization': `Bearer ${swoogoToken}`,
                                'Accept': 'application/json',
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                        }
                    );

                    const resData = response.data;

                    if (Array.isArray(resData) && resData[0]?.field && resData[0]?.message) {
                        console.error('Swoogo validation error:', resData);
                        return {
                            success: false,
                            message: 'Validation errors occurred',
                            failedParticipants: [
                                {
                                    error: resData
                                }
                            ]
                        };
                    }

                    return {
                        success: true,
                        data: resData,
                    };

                } catch (error) {
                    const errorData = error.response?.data;

                    if (Array.isArray(errorData) && errorData[0]?.field && errorData[0]?.message) {
                        return {
                            success: false,
                            message: 'Validation errors occurred',
                            failedParticipants: [
                                {
                                    error: errorData
                                }
                            ]
                        };
                    }

                    console.error('Registrant creation failed (exception):', errorData || error.message);
                    return {
                        success: false,
                        message: 'Internal server error',
                        error: errorData || error.message,
                    };
                }
            })
        );

        if (registrantResponses.some(result => !result.success)) {
            return res.status(400).json({
                success: false,
                message: 'Failed to register one or more participants',
                failedParticipants: registrantResponses.filter(r => !r.success),
            });
        }

        // Proceed to payment
        const customer = await stripe.customers.create({
            email,
            name: nameOnCard,
            address: {
                line1: billingAddressLine1,
                city: billingCity,
                country: billingCountry,
                postal_code: billingPostalCode,
            },
            source: token,
        });

        const paymentData = await stripe.charges.create({
            amount: amount,
            currency: 'cad',
            customer: customer.id,
            description: description,
            receipt_email: email,
        });

        if (paymentData.status !== 'succeeded') {
            throw new Error('Payment failed.');
        }

        // Update registrants to 'confirmed'
        const updateResponses = await Promise.all(
            registrantResponses.map(async (r) => {
                const updateForm = new URLSearchParams();
                updateForm.append('registration_status', 'confirmed');
                updateForm.append('send_email', 'true');

                try {
                    const updateRes = await axios.put(
                        `https://api.swoogo.com/api/v1/registrants/${r.data.id}`,
                        updateForm,
                        {
                            headers: {
                                'Authorization': `Bearer ${swoogoToken}`,
                                'Accept': 'application/json',
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                        }
                    );
                    return {
                        success: true,
                        data: updateRes.data
                    };
                } catch (error) {
                    console.error('Failed to confirm registrant:', error.response?.data || error.message);
                    return {
                        success: false,
                        error: error.response?.data || error.message
                    };
                }
            })
        );

        return res.status(200).json({
            success: true,
            paymentData,
            registrantResults: updateResponses,
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