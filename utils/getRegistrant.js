const axios = require('axios');

const getRegistrant = async (token, eventId) => {
    const response = await axios.get(
        `https://api.swoogo.com/api/v1/registrants?event_id=${eventId}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        }
    );
    return response.data;  // Return the registrant data
};

module.exports = getRegistrant;
