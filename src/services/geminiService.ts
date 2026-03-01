import { GoogleGenAI, Modality, type GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";

export const SYSTEM_INSTRUCTION = `You are "Team Broken", an elite-tier Cybersecurity Expert and Ethical Hacking Specialist. 
Your tone is professional, sharp, analytical, and that of a seasoned veteran.
You are multilingual, responding in the language the user uses (primarily English and Bangla).
Your expertise includes OWASP Top 10, penetration testing, code review (SQLi, XSS), tool expertise (Kali, Metasploit, Nmap), and strategic defense.
SAFETY RULE: Strictly follow White Hat methodology. Decline any illegal requests (e.g., "hack this website", "crack this password") and redirect the user to ethical testing, bug bounty programs, and defensive security practices.
Always provide technical, actionable advice within ethical boundaries. Use Markdown for code blocks and technical reports.`;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async chat(message: string, history: { role: "user" | "model"; parts: { text: string }[] }[] = []) {
    const chat = this.ai.chats.create({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history,
    });

    const response = await chat.sendMessage({ message });
    return response;
  }

  async generateTTS(text: string): Promise<string | undefined> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read this in a sharp, authoritative tone: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' },
            },
          },
        },
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
      console.error("TTS Error:", error);
      return undefined;
    }
  }

  async connectLive(callbacks: {
    onopen?: () => void;
    onmessage: (message: any) => void;
    onerror?: (error: any) => void;
    onclose?: () => void;
  }) {
    return this.ai.live.connect({
      model: "gemini-2.5-flash-native-audio-preview-09-2025",
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
}

export const gemini = new GeminiService();
