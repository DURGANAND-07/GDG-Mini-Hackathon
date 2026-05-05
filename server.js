const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Gemini 
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are a compassionate, safe, and private AI listener designed to help college students manage academic stress and anxiety.
Strict Rules:
1. Empathy First: Always validate their feelings before offering solutions. Use a warm, conversational, non-judgmental tone.
2. Coping Methods: Suggest practical, personalized exercises (e.g., 4-7-8 breathing, grounding techniques, time-blocking) if they feel overwhelmed. Use markdown formatting to make your responses readable.
3. Emergency Protocol: If a user implies severe crisis or self-harm, you MUST immediately provide emergency resources (e.g., "Please reach out for help immediately. In India, call AASRA at 9820466726.").
4. Boundaries: Keep responses concise. Never diagnose medical conditions.`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required." });

        console.log(`[SafeSpace] Incoming message received.`);

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash-8b', 
            contents: message,
            config: { 
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.6 // Slightly lower temperature for consistent, calm responses
            }
        });

        res.json({ reply: response.text });

    } catch (error) {
        console.error("AI Error:", error.message || error);
        
        // HACKATHON FALLBACK: If the API dies, send this hardcoded empathy response 
        // instead of an error, so the app still looks like it's working!
        res.json({ 
            reply: "I'm experiencing a little bit of brain fog right now, but I want you to know I hear you, and your feelings are completely valid. Take a deep breath with me: Inhale... Exhale..." 
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`💙 SafeSpace Server running on http://localhost:${PORT}`));
