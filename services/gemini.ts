import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language, AgentResponse } from '../types';

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
1. Understand user questions in Hinglish, Hindi, or English.
2. Detect the user's intention automatically:
   - FIR drafting -> action: 'generateFIR'
   - Notice drafting -> action: 'generateNotice'
   - Case summary generation -> action: 'summarizeCase'
   - Document analysis -> action: 'analyzeDocument'
   - Offence classification (bailable/cognizable) -> action: 'offenceChecker'
   - Court timeline explanation -> action: 'timelineInfo'
   - Legal rights explanation -> action: 'rightsInfo'
   - Legal dictionary lookup -> action: 'dictionaryLookup'
   - General legal question -> action: 'generalAnswer'

3. If required, ask follow-up questions in the 'response_text'.
4. Return output in clean structured JSON format ONLY. Do not use Markdown formatting for the JSON itself.

JSON Structure:
{
  "intent": "string",
  "confidence": "high/medium/low",
  "required_fields": ["field1", "field2"],
  "response_text": "string (The actual reply to the user)",
  "action": "string (one of the actions listed above)",
  "data": {}
}

App Agent Rules:
- Be helpful and polite.
- Only provide general legal guidance (not professional legal advice).
- If the user query is unclear, ask for details.
- If the user asks to perform a specific task that maps to an action (like "Draft an FIR"), set the action accordingly so the app can navigate.

Language Support:
- If the user input is Hindi, ensure 'response_text' is in Hindi.
- If the user input is English, ensure 'response_text' is in English.
`;

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to translate text using Gemini
export const translateText = async (text: string, targetLang: Language): Promise<string> => {
  if (!text) return "";
  
  const ai = getClient();
  const prompt = `Translate the following text to ${targetLang === 'en' ? 'English' : 'Hindi'}. Only return the translated text, nothing else. Text: "${text}"`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Translation Error:", error);
    return text;
  }
};

export const chatWithAgent = async (
  message: string, 
  language: Language
): Promise<AgentResponse> => {
  const ai = getClient();
  
  const langInstruction = language === 'hi' 
    ? " The user prefers Hindi. Ensure 'response_text' is in Hindi." 
    : " The user prefers English. Ensure 'response_text' is in English.";

  const finalPrompt = message + langInstruction;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
      config: {
        systemInstruction: AGENT_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");

    try {
      const parsed: AgentResponse = JSON.parse(text);
      return parsed;
    } catch (e) {
      console.error("JSON Parse Error", e);
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
      ? "क्षमा करें, कनेक्शन में समस्या है। कृपया पुनः प्रयास करें।" 
      : "Sorry, there was a connection issue. Please try again.";
    
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

export const generateLegalResponse = async (
  prompt: string,
  language: Language = 'en',
  systemInstructionOverride?: string
): Promise<string> => {
  const ai = getClient();
  let finalPrompt = prompt;

  // Translate input to English if language is Hindi
  if (language === 'hi') {
    finalPrompt = await translateText(prompt, 'en');
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
      config: {
        systemInstruction: systemInstructionOverride || SYSTEM_INSTRUCTION,
      },
    });
    
    let resultText = response.text || "I could not generate a response. Please try again.";

    // Translate output to Hindi if language is Hindi
    if (language === 'hi') {
        resultText = await translateText(resultText, 'hi');
    }
    
    return resultText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    const msg = "An error occurred while connecting to the legal assistant. Please try again.";
    return language === 'hi' ? await translateText(msg, 'hi') : msg;
  }
};

export const analyzeDocument = async (
  base64Data: string,
  mimeType: string,
  language: Language,
  promptText: string = "Analyze this legal document."
): Promise<string> => {
  const ai = getClient();
  
  // Translate prompt if needed
  let finalPromptText = promptText;
  if (language === 'hi') {
      finalPromptText = await translateText(promptText, 'en');
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          { text: finalPromptText },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\nAnalyze the document and provide: 1. Summary, 2. Key Allegations/Points, 3. Applicable Laws, 4. Case Strength/Risk, 5. Recommended Next Steps.",
      },
    });
    
    let result = response.text || "Could not analyze the document.";
    
    if (language === 'hi') {
        result = await translateText(result, 'hi');
    }

    return result;
  } catch (error) {
    console.error("Document Analysis Error:", error);
    const msg = "Failed to analyze document. Please ensure it is a clear image or PDF.";
    return language === 'hi' ? await translateText(msg, 'hi') : msg;
  }
};

export const generateFIRDraft = async (data: any, language: Language): Promise<string> => {
  let complainant = data.complainant;
  let incident = data.incidentDetails;
  let evidence = data.evidence;

  if (language === 'hi') {
      complainant = await translateText(complainant, 'en');
      incident = await translateText(incident, 'en');
      evidence = await translateText(evidence, 'en');
  }

  const prompt = `
    Draft a formal Police FIR (First Information Report) for an Indian Police Station based on:
    Complainant: ${complainant}
    Accused: ${data.accused}
    Date/Time: ${data.dateTime}
    Incident: ${incident}
    Evidence: ${evidence}
    
    Structure the FIR professionally. Cite specific Indian IPC/BNS sections applicable.
  `;
  
  const ai = getClient();
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { systemInstruction: SYSTEM_INSTRUCTION }
      });
      let text = response.text || "Error generating FIR";
      
      if (language === 'hi') {
          text = await translateText(text, 'hi');
      }
      return text;
  } catch (e) {
      return "Error generating FIR";
  }
};

export const generateLegalNotice = async (type: string, details: string, language: Language): Promise<string> => {
  let finalDetails = details;
  if (language === 'hi') {
      finalDetails = await translateText(details, 'en');
  }

  const prompt = `
    Draft a formal Legal Notice for: ${type}.
    Details of the case: ${finalDetails}.
    
    Include:
    1. Legal Header
    2. Reference to specific acts (e.g., Section 138 NI Act for cheque bounce).
    3. Demand for action/payment within specific time (e.g., 15 days).
    4. Warning of legal consequences.
  `;

  const ai = getClient();
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { systemInstruction: SYSTEM_INSTRUCTION }
      });
      let text = response.text || "Error generating Notice";
      if (language === 'hi') {
          text = await translateText(text, 'hi');
      }
      return text;
  } catch (e) {
      return "Error generating Notice";
  }
};

export const getLawFinderResponse = async (incident: string, language: Language): Promise<string> => {
  const prompt = `
    Analyze this incident under Indian Law: "${incident}"
    
    Provide:
    1. Applicable Sections (IPC/BNS, CrPC/BNSS, etc.)
    2. Offence Classification (Bailable/Non-bailable, Cognizable/Non-cognizable).
    3. Prescribed Punishment.
    4. Detailed Explanation.
  `;
  return generateLegalResponse(prompt, language);
};

export const getTimelineResponse = async (caseType: string, language: Language): Promise<string> => {
    const prompt = `Generate a typical court timeline and procedural steps in India for a: ${caseType}. Include stages from filing to judgment/appeal.`;
    return generateLegalResponse(prompt, language);
}