const express = require('express');
const { client } = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// POST: Unified Login Route
router.post('/login', async (req, res) => {
    try {
        const { identifier, password, userType } = req.body;

        if(!identifier || !password) {
            return res.status(400).json({ message: "Email/Contact, password are required" });
        }

        // 1. Map the exact frontend dropdown values to your DB collections
        const collectionMap = {
            'Farmer': 'farmers',
            'Buyer': 'buyers',
            'Cold Storage Owner': 'cs_owners'
        };

        const targetCollection = collectionMap[userType];

        // 2. Validate the userType
        if (!targetCollection) {
            return res.status(400).json({ message: "Invalid user type selected" });
        }

        // 3. Search the correct collection dynamically
        const user = await client.db("AgriDB").collection(targetCollection).findOne({ $or: [{ email: identifier }, { contact: identifier }] });
        
        // 4. Check if user exists and if the plain text password matches
        if (!user || password !== user.password) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 5. Generate the JWT securely
        const token = jwt.sign(
            { id: user._id, role: userType }, 
            process.env.JWT_SECRET, // Make sure this is set in your .env file
            { expiresIn: '1d' } 
        );

        // 6. Send the token and user details back to the frontend
        res.status(200).json({ 
            message: "Login successful", 
            token: token,
            userId: user._id,
            role: userType 
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
});

module.exports = router;