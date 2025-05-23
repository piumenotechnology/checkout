const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const allowCors = require('../utils/allowCors');
const getToken = require('../utils/getToken');
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
        registrantIds,
    } = req.body;

    // Validate required fields
    if (!token || !amount || !email || !nameOnCard || !billingAddressLine1 || !billingCity || !billingCountry || !billingPostalCode || !registrantIds) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const swoogoToken = await getToken();
        if (!swoogoToken) {
            throw new Error('Failed to retrieve Swoogo API token');
        }

        // Create customer
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

        // Create charge
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

        // Update registrants to 'confirmed' and send confirmation emails
        const updateResponses = await Promise.all(
            registrantIds.map(async (registrantId) => {
                try {
                    const updateForm = new URLSearchParams();
                    updateForm.append('registration_status', 'confirmed');
                    updateForm.append('send_email', 'true');

                    const updateRes = await axios.put(
                        `https://api.swoogo.com/api/v1/registrants/update/${registrantId}`,
                        updateForm,
                        {
                            headers: {
                                'Authorization': `Bearer ${swoogoToken}`,
                                'Accept': 'application/json',
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                        }
                    );

                    await axios.post(
                        `https://api.swoogo.com/api/v1/registrants/${registrantId}/trigger-email/registration_created`,
                        {},
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
                        data: updateRes.data,
                    };
                } catch (error) {
                    console.error(`Error updating or emailing registrant ${registrantId}:`, error.response?.data || error.message);
                    return {
                        success: false,
                        id: registrantId,
                        error: error.response?.data || error.message,
                    };
                }
            })
        );

        if (updateResponses.some(result => !result.success)) {
            return res.status(400).json({
                success: false,
                message: 'Failed to update or email one or more registrants',
                failedRegistrants: updateResponses.filter(r => !r.success),
                paymentData,
            });
        }

        return res.status(200).json({
            success: true,
            paymentData,
            registrantResults: updateResponses,
            nextStep: 'confirmation',
        });
    } catch (error) {
        console.error('Payment or update failed:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message || 'Internal server error',
        });
    }
};

module.exports = allowCors(handler);