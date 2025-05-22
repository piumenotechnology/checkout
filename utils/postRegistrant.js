const axios = require('axios');
const { URLSearchParams } = require('url');

const postRegistrant = async (token, registrantData) => {
    try {
        const formData = new URLSearchParams();
        Object.keys(registrantData).forEach(key => {
            formData.append(key, registrantData[key] || '');
        });

        const response = await axios.post(
            'https://api.swoogo.com/api/v1/registrants/create',
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
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
                failedParticipants: [{ error: resData }],
            };
        }

        return {
            success: true,
            data: resData,
        };
    } catch (error) {
        const errorData = error.response?.data;

        if (Array.isArray(errorData) && errorData[0]?.field && errorData[0]?.message) {
            console.error('Swoogo validation error:', errorData);
            return {
                success: false,
                message: 'Validation errors occurred',
                failedParticipants: [{ error: errorData }],
            };
        }

        console.error('Registrant creation failed:', errorData || error.message);
        return {
            success: false,
            message: 'Internal server error',
            error: errorData || error.message,
        };
    }
};

module.exports = postRegistrant;