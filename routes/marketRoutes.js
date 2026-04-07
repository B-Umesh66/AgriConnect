const express = require('express');
const axios = require('axios');
require('dotenv').config();
const router = express.Router();

const fetchMarketPrices = async (params) => {
    const apiUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const currentDate = `${day}/${month}/${year}`;

    const response = await axios.get(apiUrl, {
        params: {
            'api-key': process.env.AGMARKET_API_KEY,
            format: 'json',
            offset: 0,
            limit: 50,
            'filters[arrival_date]': currentDate,
            'filters[commodity]': params.commodity,
            'filters[state.keyword]': params.state,
            'filters[district]': params.district
        }
    });

    return {
        success: true,
        date_fetched: currentDate,
        records: response.data.records
    };
};

const handleMarketPricesRequest = async (req, res) => {
    try {
        const params = req.method === 'POST' ? req.body : req.query;
        const result = await fetchMarketPrices(params);
        return res.status(200).json(result);
    } catch (error) {
        const apiError = error.response ? error.response.data : error.message;
        console.error("AGMARKNET REJECTION DETAILS:", apiError);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch market prices from Agmarknet."
        });
    }
};

router.get('/prices', handleMarketPricesRequest);
router.post('/prices', handleMarketPricesRequest);

module.exports = router;