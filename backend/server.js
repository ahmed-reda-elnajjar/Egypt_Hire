// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// تحميل متغيرات البيئة
dotenv.config();

const app = express();
const PORT = 5000; // السيرفر سيعمل على المنفذ 5000

// السماح للواجهة الأمامية بالاتصال بالسيرفر
app.use(cors());
app.use(express.json());

// إعداد Gemini API
// تأكد أنك وضعت المفتاح في ملف .env داخل مجلد backend
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

// نقطة الاتصال (Endpoint) التي ستطلبها من الـ React
app.post('/api/analyze-speech', async (req, res) => {
    try {
        const { topic, transcript } = req.body;

        if (!transcript || !topic) {
            return res.status(400).json({ error: "Missing topic or transcript" });
        }

        const prompt = `
            Act as an IELTS examiner.
            Topic: ${topic}
            Transcript: ${transcript}
            
            Return ONLY valid JSON (no extra text) with this structure:
            {
              "score": 0-100,
              "feedback": "Two sentences of constructive feedback.",
              "breakdown": { "fluency":0, "vocab":0, "grammar":0, "clarity":0 }
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // تنظيف النص لتحويله لـ JSON
        const jsonStr = text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(jsonStr);

        // إرسال النتيجة للفرونت إند
        res.json(data);

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to analyze speech", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});