# Zaraara
#AI E-Commerce Chatbot

An intelligent shopping assistant integrated into an e-commerce website.  
The chatbot helps users:

- 🔎 Find products using natural language
- 🧠 Understand filters like price, category, colors, sizes
- 📦 View their orders
- 💬 Get conversational responses powered by an LLM

Built using **React + Flask + LangGraph + Groq LLM**.

# How to run
1. Clone the repository.

2. Backend Setup (Flask + Node API + Prisma):
   - Install backend dependencies:
     - cd backend
     - npm install
     - cd backend/chatbot
     - pip install -r requirements.txt
   - Create .env files in both backend and chatbot folders by copying from .env.example and filling in the values.
   - Run Prisma:
     - cd backend
     - npx prisma generate
     - npx prisma migrate dev --name init
   - Start backend servers:
     - cd backend
     - npm run dev
     - cd backend/chatbot
     - python app.py

3. Frontend Setup (React):
   - cd frontend
   - npm install
   - npm run dev
   - Open the frontend in the browser at localhost:5173. Make sure both backend servers are running before using the frontend.




