const axios = require('axios');

const getEvents = async (token, eventId) => {
    try {
        const response = await axios.get(
            `https://api.swoogo.com/api/v1/events/${eventId}?fields=capacity%2Cclose_date%2Cclose_time%2Ccreated_at%2Ccreated_by%2Cdescription%2Cend_date%2Cend_time%2Cfolder_id%2Cfree_event%2Chashtag%2Cid%2Cname%2Corganizer_id%2Cstart_date%2Cstart_time%2Cstatus%2Ctarget_attendance%2Ctimezone%2Ctype_id%2Cupdated_at%2Cupdated_by%2Curl%2Cwebinar_url`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching event:', error);
        throw new Error('Failed to fetch event');
    }
};

module.exports = getEvents;

