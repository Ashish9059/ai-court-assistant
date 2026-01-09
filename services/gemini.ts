
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language, AgentResponse, ChatMessage } from '../types';

const SYSTEM_INSTRUCTION = `You are an Indian legal expert AI named Nyaya Sahayak. 
Always answer based strictly on Indian laws, including:
- IPC (Indian Penal Code) / BNS (Bharatiya Nyaya Sanhita)
- CrPC (Code of Criminal Procedure) / BNSS (Bharatiya Nagarik Suraksha Sanhita)
- Indian Evidence Act / BSA (Bharatiya Sakshya Adhiniyam)
- Constitution of India
- IT Act (Cyber Laws)
- Consumer Protection Act
- Negotiable Instruments Act

Do not reference foreign laws (like US/UK law).
Be precise, professional, and empathetic.
Disclaimer: Always start or end with a disclaimer that you are an AI and this is not professional legal advice.
`;

const AGENT_SYSTEM_INSTRUCTION = `You are “Nyaya Sahayak AI Agent” — an intelligent legal assistant designed for Indian courts.

Your job:
1. Detect user's intention:
   - FIR drafting -> action: 'generateFIR'
   - Notice drafting -> action: 'generateNotice'
   - Case summary generation -> action: 'summarizeCase'
   - Document analysis -> action: 'analyzeDocument'
   - Offence classification (bailable/cognizable) -> action: 'offenceChecker'
   - Court timeline explanation -> action: 'timelineInfo'
   - Legal rights explanation -> action: 'rightsInfo'
   - Legal dictionary lookup -> action: 'dictionaryLookup'
   - General legal question -> action: 'generalAnswer'

2. FIR COLLECTION MODE (CRITICAL):
   If the user wants to draft an FIR (action 'generateFIR'):
   - Gretting: "I can help you draft a FIR for the police. This is for informational purposes and is not legal advice."
   - You MUST collect these details ONE BY ONE:
     1. Complainant Name
     2. Complainant Father's Name
     3. Complainant Address
     4. Complainant Contact Number
     5. Accused Name (if known)
     6. Accused Father's Name (if known)
     7. Accused Address (if known)
     8. Relationship between complainant and accused
     9. Date & Time of the Incident
     10. Place of Incident
     11. Detailed description of the incident
     12. Witnesses (if any)
     13. Property lost/damaged (if any)
   - RULE: Ask ONE question at a time. Wait for the answer.
   - RULE: Confirm the answer before moving to the next.
   - RULE: If description is given via speech-to-text style, summarize it in text.
   - FINISHING: Once all 13 points are collected, summarize them clearly and ask: "Here is the information you provided. Shall I generate the FIR now?"
   - DATA: Keep the collected information in the "data" object in your JSON response.

3. Return output in structured JSON ONLY.

JSON Structure:
{
  "intent": "string",
  "confidence": "high/medium/low",
  "required_fields": ["field_currently_asking"],
  "response_text": "string (The actual reply to the user)",
  "action": "string",
  "data": { "collected_fir_fields": {} }
}
`;

// Initialize GoogleGenAI client with API key from environment
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

// Fix: Using gemini-3-flash-preview for the basic text translation task
export const translateText = async (text: string, targetLang: Language): Promise<string> => {
  if (!text) return "";
  const ai = getClient();
  const prompt = `Translate to ${targetLang === 'en' ? 'English' : 'Hindi'}. Only return the translated text. Text: "${text}"`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || text;
  } catch (error) {
    return text;
  }
};

// Fix: Using gemini-3-pro-preview for complex reasoning task of legal agent chat
export const chatWithAgent = async (
  messages: ChatMessage[], 
  language: Language
): Promise<AgentResponse> => {
  const ai = getClient();
  
  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  const langInstruction = language === 'hi' 
    ? " The user prefers Hindi. Ensure 'response_text' is in Hindi." 
    : " The user prefers English. Ensure 'response_text' is in English.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: AGENT_SYSTEM_INSTRUCTION + langInstruction }, ...contents.flatMap(c => c.parts)] } as any,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");

    try {
      const parsed: AgentResponse = JSON.parse(text);
      return parsed;
    } catch (e) {
      return {
        intent: 'general',
        confidence: 'low',
        required_fields: [],
        response_text: text || "Error processing request.",
        action: 'generalAnswer',
        data: {}
      };
    }
  } catch (error) {
    console.error("Agent API Error:", error);
    const msg = language === 'hi' 
      ? "क्षमा करें, समस्या आ गई है।" 
      : "Sorry, a connection issue occurred.";
    return {
        intent: 'error',
        confidence: 'low',
        required_fields: [],
        response_text: msg,
        action: 'generalAnswer',
        data: {}
    };
  }
};

// Fix: Using gemini-3-pro-preview for specialized legal responses
export const generateLegalResponse = async (
  prompt: string,
  language: Language = 'en',
  systemInstructionOverride?: string
): Promise<string> => {
  const ai = getClient();
  let finalPrompt = prompt;
  if (language === 'hi') finalPrompt = await translateText(prompt, 'en');

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: finalPrompt,
      config: {
        systemInstruction: systemInstructionOverride || SYSTEM_INSTRUCTION,
      },
    });
    let resultText = response.text || "I could not generate a response.";
    if (language === 'hi') resultText = await translateText(resultText, 'hi');
    return resultText;
  } catch (error) {
    return "An error occurred.";
  }
};

// Fix: Using gemini-3-pro-preview for complex multimodal document analysis
export const analyzeDocument = async (
  base64Data: string,
  mimeType: string,
  language: Language,
  promptText: string = "Analyze this legal document."
): Promise<string> => {
  const ai = getClient();
  let finalPromptText = promptText;
  if (language === 'hi') finalPromptText = await translateText(promptText, 'en');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: finalPromptText },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\nAnalyze document: Summary, Allegations, Laws, Risk, Next Steps.",
      },
    });
    let result = response.text || "Could not analyze.";
    if (language === 'hi') result = await translateText(result, 'hi');
    return result;
  } catch (error) {
    return "Failed to analyze document.";
  }
};

// Fix: Using gemini-3-pro-preview for technical FIR drafting
export const generateFIRDraft = async (data: any, language: Language): Promise<string> => {
  const prompt = `
    Draft a formal Police FIR (First Information Report) for an Indian Police Station based on:
    - Complainant: ${data.complainant}
    - Accused: ${data.accused}
    - Date & Time: ${data.dateTime}
    - Incident Type: ${data.incidentType}
    - Incident Details: ${data.incidentDetails}
    - Evidence: ${data.evidence}
    
    Structure professionally. Suggest and cite relevant Bharatiya Nyaya Sanhita (BNS) and IPC sections specifically for the Incident Type: "${data.incidentType}".
  `;
  const ai = getClient();
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: prompt,
          config: { systemInstruction: SYSTEM_INSTRUCTION }
      });
      let text = response.text || "Error generating FIR";
      if (language === 'hi') text = await translateText(text, 'hi');
      return text;
  } catch (e) {
      return "Error generating FIR";
  }
};

// Fix: Using gemini-3-pro-preview for formal legal notice generation
export const generateLegalNotice = async (type: string, details: string, language: Language): Promise<string> => {
  const prompt = `Draft formal Legal Notice for: ${type}. Case: ${details}. Include Header, Sections (e.g. 138 NI), Demand, Warning.`;
  const ai = getClient();
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: prompt,
          config: { systemInstruction: SYSTEM_INSTRUCTION }
      });
      let text = response.text || "Error generating Notice";
      if (language === 'hi') text = await translateText(text, 'hi');
      return text;
  } catch (e) {
      return "Error generating Notice";
  }
};

export const getLawFinderResponse = async (incident: string, language: Language): Promise<string> => {
  const prompt = `Analyze: "${incident}". Provide: Sections, Classification, Punishment, Explanation.`;
  return generateLegalResponse(prompt, language);
};

export const getTimelineResponse = async (caseType: string, language: Language): Promise<string> => {
    const prompt = `Timeline for: ${caseType}. Include stages from filing to judgment.`;
    return generateLegalResponse(prompt, language);
}
