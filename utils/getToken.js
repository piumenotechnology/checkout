const axios = require('axios');

const getToken = async () => {
    try {
        const encodedCredentials = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');
        const body = new URLSearchParams({ grant_type: 'client_credentials' });

        const response = await axios.post(
            'https://api.swoogo.com/api/v1/oauth2/token',
            body,
            {
                headers: {
                    'Authorization': `Basic ${encodedCredentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                },
            }
        );

        return response.data.access_token; // Return the token
    } catch (error) {
        console.error('Token error:', error.response?.data || error.message);
        throw new Error('Failed to get token');
    }
};

module.exports = getToken;
