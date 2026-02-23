const { GoogleGenerativeAI } = require("@google/generative-ai");

// 👇 ضع مفتاحك الجديد هنا
const API_KEY = "AIzaSyA4rtOTkTftatbJDtgMLc02zWxFRGmoT98";

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    console.log("Checking connection...");
    // سنجرب طلب بسيط لنرى هل الموديل يعمل
    const result = await models.generateContent("Hello");
    console.log("✅ Success! Model is working:", result.response.text());
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n--- TRYING TO LIST AVAILABLE MODELS ---");
    // هذا الجزء قد لا يعمل مع كل المفاتيح، لكن سنحاول
    console.log("If 1.5-flash failed, try 'gemini-pro' or 'gemini-1.0-pro' in your server.js");
  }
}

listModels();