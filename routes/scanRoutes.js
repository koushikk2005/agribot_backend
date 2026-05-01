const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');

const upload = multer({ storage: multer.memoryStorage() });

// ✅ ENV KEYS
const PLANT_API_KEY = process.env.PLANT_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

router.post('/', upload.single('image'), async (req, res) => {
    try {
        console.log("SCAN HIT");

        // ✅ check image
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        // ✅ check keys
        if (!PLANT_API_KEY || !OPENROUTER_API_KEY) {
            return res.status(500).json({ error: "API keys missing" });
        }

        const imageBase64 = req.file.buffer.toString('base64');

        // 🌿 1. PLANT API
        const plantRes = await axios.post(
            'https://plant.id/api/v3/identification',
            {
                images: [imageBase64],
                health: "all"
            },
            {
                headers: {
                    'Api-Key': PLANT_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        const data = plantRes.data;
        console.log("PLANT RESPONSE OK");

        // 🧠 2. EXTRACT DATA SAFELY
        let diseaseName = "No clear disease detected";
        let confidence = 0;

        if (data?.health_assessment?.is_healthy?.binary === false) {
            const diseases = data.health_assessment.diseases;

            if (diseases && diseases.length > 0) {
                diseaseName = diseases[0].name || "Unknown disease";
                confidence = diseases[0].probability || 0;
            }
        }

        // 🧠 3. PROMPT
        const prompt = `
You are an agriculture expert.

Scan result:
Disease: ${diseaseName}
Confidence: ${confidence}

Give:
- Problem
- Cause
- Solution
- Prevention

Keep it simple.
`;

        // 🤖 4. OPENROUTER (FIXED)
        const aiRes = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: "mistralai/mistral-7b-instruct", // ✅ safer model
                messages: [{ role: "user", content: prompt }]
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const aiReply =
            aiRes.data?.choices?.[0]?.message?.content ||
            "AI response not available";

        // ✅ RESPONSE
        res.json({
            disease: diseaseName,
            confidence: confidence,
            ai: aiReply
        });

    } catch (err) {
        console.error("SCAN ERROR:", err.response?.data || err.message);

        res.status(500).json({
            error: err.response?.data || err.message
        });
    }
});

module.exports = router;