const axios = require('axios');

const postRegistrant = async (token, registrantData) => {
    try {
        const formData = new URLSearchParams();

        Object.keys(registrantData).forEach(key => {
            formData.append(key, registrantData[key]);
        });

        const response = await axios.post('https://api.swoogo.com/api/v1/registrants/create', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('ERROR RESPONSE STATUS:', error.response.status);
            console.error('ERROR RESPONSE DATA:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('RAW ERROR:', error.message);
        }
        throw new Error('Failed to create registrant');
    }
};

module.exports = postRegistrant;
