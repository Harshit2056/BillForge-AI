import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in your .env file.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey
});

export default ai;