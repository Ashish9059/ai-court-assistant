# ⚖️ AI Court Assistant  
### An AI-Powered Legal Guidance & Court Understanding Application

---

## 🧠 Overview

**AI Court Assistant** is a conversational AI application designed to help users understand legal concepts, court procedures, and case-related questions in simple, natural language.

Built for the **Google DeepMind Vibe Coding Competition (Kaggle)**, this project demonstrates how generative AI (Gemini) can be used responsibly to improve **access to legal information** for students, citizens, and non-experts.

> ⚠️ **Disclaimer:** This application is for educational and informational purposes only and does **not** provide legal advice.

---

## ✨ Features

- 💬 Natural language interaction for legal queries  
- 📚 Simplified explanations of court processes and legal terms  
- 🤖 Powered by Google Gemini API  
- ⚡ Fast, modern frontend using React + TypeScript + Vite  
- 🎯 Clean and minimal UI focused on clarity and accessibility  

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite  
- **AI Model:** Google Gemini  
- **Platform:** Google AI Studio  

---

## 🔗 Live App

View the app in **Google AI Studio**:  
👉 https://ai.studio/apps/drive/1bahEJ83KN6cUeCMoU7KjLswJLhSdiXEX

---

## 🚀 Run Locally

### Prerequisites
- Node.js (v18+ recommended)

### Steps

1. **Install dependencies**
   ```bash
   npm install

2. **Set environment variables
Create a .env.local file and add:

GEMINI_API_KEY=your_gemini_api_key_here

3. **Run the app
   ```bash
   npm run dev

4. **Open in your browser:

   http://localhost:5173


## Project Structure

ai-court-assistant/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   └── Header.tsx
│   │
│   ├── services/
│   │   └── geminiService.ts
│   │
│   ├── views/
│   │   └── ChatView.tsx
│   │
│   ├── types.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .env.local
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md