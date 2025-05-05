const axios = require('axios');

const getDiscount = async (token, eventId) => {
    const response = await axios.get(
        `https://api.swoogo.com/api/v1/discounts?event_id=${eventId}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        }
    );
    return response.data;  // Return the discount data
};

module.exports = getDiscount;
