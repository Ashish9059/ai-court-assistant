# Nyaya Sahayak (न्याय सहायक) - AI Court Assistant

Nyaya Sahayak is a sophisticated AI-powered legal assistant tailored specifically for the Indian legal system. It provides accessible legal information, drafts essential documents, and analyzes legal text using advanced AI models.

## ⚖️ Key Features

*   **Bilingual Support**: Full interface and AI response capabilities in both **English** and **Hindi**.
*   **Intelligent Legal Chat**: A context-aware chatbot that can answer queries about IPC, BNS, CrPC, and more. It features an animated AI avatar and text-to-speech functionality.
*   **FIR Draft Generator**: A step-by-step assistant (via chat or form) to generate formal First Information Reports with integrated speech-to-text. It automatically suggests relevant BNS/IPC sections based on the incident type.
*   **Document Analyzer**: Multimodal capability to upload PDFs or images of legal documents for summarization and risk assessment.
*   **Law Finder**: Helps users identify applicable laws and sections by describing a real-life incident.
*   **Legal Notice Generator**: Drafts formal notices for common issues like cheque bounces, property disputes, and recovery.
*   **Court Timelines**: Explains the typical procedural journey of various case types in Indian courts.
*   **Know Your Rights & Dictionary**: Instant access to fundamental rights and simplified legal terminology.

## 🛠️ Tech Stack

*   **Frontend**: React (TypeScript)
*   **Styling**: Tailwind CSS (Mobile-first, Dark Mode)
*   **AI Engine**: Google Gemini API (`gemini-3-pro-preview` for reasoning, `gemini-3-flash-preview` for tasks)
*   **Icons**: Lucide React
*   **Document Export**: jsPDF (for FIR PDF generation)
*   **Text Processing**: React Markdown

## 📂 Project Structure

```text
.
├── index.html              # Entry HTML with Tailwind & Import Maps
├── index.tsx               # Entry React mount point
├── App.tsx                 # Root component, routing, and shared views
├── types.ts                # Global TypeScript interfaces and enums
├── metadata.json           # App permissions (mic/camera) and descriptions
├── services/
│   └── gemini.ts           # Gemini API integration & legal logic
├── components/
│   ├── BottomNav.tsx       # Main navigation for mobile views
│   └── AvatarAgent.tsx     # Animated AI agent UI component
└── views/
    ├── Home.tsx            # Dashboard with quick-access tools
    ├── Chat.tsx            # Stateful conversational legal agent
    ├── LawFinder.tsx       # Incident-to-law mapping tool
    ├── DocumentAnalyzer.tsx# Multimodal file analysis interface
    ├── FIRGenerator.tsx    # Formal FIR drafting and history management
    ├── NoticeGenerator.tsx # Legal notice template engine
    └── Timeline.tsx        # Court procedure visualization
```

## 🚀 Getting Started

1.  **API Key**: The application requires a valid `API_KEY` from Google AI Studio provided via environment variables.
2.  **Permissions**: Ensure microphone access is granted for the Speech-to-Text features in the FIR generator.
3.  **BNS/IPC**: The AI is programmed to handle the transition from IPC to Bharatiya Nyaya Sanhita (BNS) sections.

## 🏛️ Legal Disclaimer

Nyaya Sahayak is an AI-powered informational tool. It is **not a substitute for professional legal counsel**. Users are advised to consult with a qualified advocate for official legal proceedings.


# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1bahEJ83KN6cUeCMoU7KjLswJLhSdiXEX

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
