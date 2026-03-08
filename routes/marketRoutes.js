const express = require('express');
const axios = require('axios');
require('dotenv').config();
const router = express.Router();

router.get('/prices', async (req, res) => {
    try {
        const { commodity, state, district } = req.query;
        const apiUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'; 
        
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); 
        const year = today.getFullYear();
        const currentDate = `${day}/${month}/${year}`;

        // 2. Make the request to Agmarknet with the date filter included
        const response = await axios.get(apiUrl, {
            params: {
                'api-key': process.env.AGMARKET_API_KEY,
                format: 'json',
                offset: 0,
                limit: 50,
                'filters[arrival_date]': currentDate, 
                'filters[commodity]': commodity,
                'filters[state.keyword]': state,      
                'filters[district]': district
            }
        });

        // 3. Send the successful data back to your frontend
        res.status(200).json({
            success: true,
            date_fetched: currentDate,
            records: response.data.records
        });

    } catch (error) {
        const apiError = error.response ? error.response.data : error.message;
        console.error("AGMARKNET REJECTION DETAILS:", apiError);

        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch market prices from Agmarknet." 
        });
    }
});

module.exports = router;