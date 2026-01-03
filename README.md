<div align="center">
  <img width="1200" height="475" alt="AI Court Assistant Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>⚖️ AI Court Assistant</h1>
  <p><strong>An AI-Powered Legal Guidance & Court Understanding Application</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Competition-Google%20DeepMind%20Vibe-blue" alt="Competition" />
    <img src="https://img.shields.io/badge/AI-Google%20Gemini-orange" alt="AI" />
    <img src="https://img.shields.io/badge/Built%20With-React%20%2B%20TypeScript-brightgreen" alt="Built With" />
  </p>
</div>

---

## 🧠 Overview

**AI Court Assistant** is a conversational AI web application that helps users understand legal concepts, court procedures, and case-related questions using natural language.

Built for the **Google DeepMind Vibe Coding Competition (Kaggle)**, this project demonstrates how **generative AI (Google Gemini)** can be used responsibly to improve access to legal information for students, citizens, and non-experts.

> [!WARNING]
> **Disclaimer:** This application is for educational and informational purposes only and does **not** provide legal advice.

---

## ✨ Features

- 💬 **Plain English Queries:** Ask complex legal questions in everyday language.
- 📚 **Procedure Simplified:** Clear explanations of court protocols and legal terminology.
- 🤖 **Gemini Powered:** Integrated with Google Gemini API for nuanced, context-aware responses.
- ⚡ **Modern UI:** High-performance interface built with React, TypeScript, and Vite.
- 🎯 **Accessibility First:** Clean design focused on readability and user guidance.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **AI Model:** Google Gemini (Gemini 1.5 Pro/Flash)
- **Platform:** Google AI Studio

---

## 🔗 Live App

Experience the application directly in **Google AI Studio**:  
👉 [Launch AI Court Assistant](https://ai.studio/apps/drive/1bahEJ83KN6cUeCMoU7KjLswJLhSdiXEX)

---

## 🚀 Run Locally

### Prerequisites
- Node.js (v18 or higher)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Steps

1. **Clone the repo**
   ```bash
   git clone [https://github.com/your-username/ai-court-assistant.git](https://github.com/your-username/ai-court-assistant.git)
   cd ai-court-assistant
2. Install dependencies

bash

npm install

3. Set environment variables Create a. env. local file in the root directory:

bash

0

VITE_GEMINI_API_KEY=your_gemini_api_ke y_here

4. Run the app

bash

npm run dev

5. Open in browser Visit: http://localhost: 5173



🔁 Application Workflow
Input: User submits a query regarding a court procedure or legal term.
Contextualization: The application wraps the input with safety prompts and educational context.
Processing: The prompt is sent via the Gemini API.
Validation: The model generates a response filtered for educational accuracy.
Display: The user receives a formatted, easy-to-read breakdown of the information.
📂 Project Structure

ai-court-assistant/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   └── Header.tsx
│   ├── services/
│   │   └── geminiService.ts
│   ├── views/
│   │   └── ChatView.tsx
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
├── .env.local
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md


🌍 Why This Project?
Legal systems are complex and often inaccessible. AI Court Assistant explores how generative AI can:
Reduce Barriers: Lower the threshold for understanding legal documents and rights.
Improve Awareness: Help citizens prepare for court appearances with procedural knowledge.
Responsible AI: Demonstrate how to provide guidance without overstepping into professional legal counsel.
🏆 Competition Context
This project was created for the Google DeepMind Vibe Coding Competition on Kaggle, focusing on:
Practical AI Applications: Real-world utility for everyday users.
Safety & Responsibility: Clear disclaimers and educational boundaries.
Technical Execution: Efficient use of the Gemini API and modern web frameworks.
<!-- end list -->