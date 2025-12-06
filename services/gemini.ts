import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

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

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLegalResponse = async (
  prompt: string,
  systemInstructionOverride?: string
): Promise<string> => {
  const ai = getClient();
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstructionOverride || SYSTEM_INSTRUCTION,
      },
    });
    return response.text || "I could not generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while connecting to the legal assistant. Please try again.";
  }
};

export const analyzeDocument = async (
  base64Data: string,
  mimeType: string,
  promptText: string = "Analyze this legal document."
): Promise<string> => {
  const ai = getClient();
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
          { text: promptText },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\nAnalyze the document and provide: 1. Summary, 2. Key Allegations/Points, 3. Applicable Laws, 4. Case Strength/Risk, 5. Recommended Next Steps.",
      },
    });
    return response.text || "Could not analyze the document.";
  } catch (error) {
    console.error("Document Analysis Error:", error);
    return "Failed to analyze document. Please ensure it is a clear image or PDF.";
  }
};

export const generateFIRDraft = async (data: any): Promise<string> => {
  const prompt = `
    Draft a formal Police FIR (First Information Report) for an Indian Police Station based on:
    Complainant: ${data.complainant}
    Accused: ${data.accused}
    Date/Time: ${data.dateTime}
    Incident: ${data.incidentDetails}
    Evidence: ${data.evidence}
    
    Structure the FIR professionally. Cite specific Indian IPC/BNS sections applicable.
  `;
  return generateLegalResponse(prompt);
};

export const generateLegalNotice = async (type: string, details: string): Promise<string> => {
  const prompt = `
    Draft a formal Legal Notice for: ${type}.
    Details of the case: ${details}.
    
    Include:
    1. Legal Header
    2. Reference to specific acts (e.g., Section 138 NI Act for cheque bounce).
    3. Demand for action/payment within specific time (e.g., 15 days).
    4. Warning of legal consequences.
  `;
  return generateLegalResponse(prompt);
};

export const getLawFinderResponse = async (incident: string): Promise<string> => {
  const prompt = `
    Analyze this incident under Indian Law: "${incident}"
    
    Provide:
    1. Applicable Sections (IPC/BNS, CrPC/BNSS, etc.)
    2. Offence Classification (Bailable/Non-bailable, Cognizable/Non-cognizable).
    3. Prescribed Punishment.
    4. Detailed Explanation.
  `;
  return generateLegalResponse(prompt);
};

export const getTimelineResponse = async (caseType: string): Promise<string> => {
    const prompt = `Generate a typical court timeline and procedural steps in India for a: ${caseType}. Include stages from filing to judgment/appeal.`;
    return generateLegalResponse(prompt);
}
