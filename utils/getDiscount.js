const axios = require('axios');

const getDiscount = async (token, eventId) => {
    const response = await axios.get(
        `https://api.swoogo.com/api/v1/discounts?event_id=${eventId}&fields=absolute_discount%2Capplicable_line_items%2Ccapacity%2Ccode%2Ccreated_at%2Ccustom_fees%2Cevent_id%2Cid%2Cnotes%2Cpercentage_discount%2Csold_out_message%2Ctype%2Cupdated_at`,
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
