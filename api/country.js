const countrycitystatejson = require('countrycitystatejson');
const allowCors = require('../utils/allowCors');

const handler = async (req, res) => {
    try {
        const countries = countrycitystatejson.getCountries();
        if (!countries || !Array.isArray(countries)) {
            throw new Error('Invalid or empty country data');
        }

        const countryData = countries.map(country => ({
            id: country.id,
            name: country.name,
            shortName: country.shortName
        }));
        res.status(200).json(countryData);
    } catch (error) {
        console.error('Error fetching country data:', error);
        res.status(500).json({ error: 'Failed to fetch country data' });
    }
};

module.exports = allowCors(handler);