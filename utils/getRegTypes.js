const axios = require('axios');

const getRegTypes = async (token, eventId) => {
    const response = await axios.get(
        `https://api.swoogo.com/api/v1/reg-types?event_id=${eventId}&fields=id%2Cname%2Cpublic_short_name%2Cadmin_short_name%2Cdescription%2Ccapacity%2Csold_out_message%2Cmin_group_size%2Cmax_group_size%2Ccreated_at%2Cupdated_at`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        }
    );
    return response.data;
};

module.exports = getRegTypes;
