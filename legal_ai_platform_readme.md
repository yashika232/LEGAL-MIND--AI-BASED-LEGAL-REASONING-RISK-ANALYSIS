# ⚖️ AI Legal Advisor Platform

An AI-powered legal case management and document analysis platform built using the MERN-style architecture with a React frontend and Flask backend. The platform helps lawyers and legal professionals manage cases, upload legal documents, analyze case risks, retrieve similar judgements, and interact with uploaded documents using Retrieval-Augmented Generation (RAG).

---

# 🚀 Features

## 🔐 Authentication & User Management
- Secure user registration and login
- JWT-based authentication
- Protected routes and APIs
- Password hashing using Flask-Bcrypt

## 📂 Case Management
- Create and manage legal cases
- Store case details including:
  - Case title
  - Case type
  - Court information
  - Parties involved
  - Case description
- Delete cases and uploaded files
- Case status tracking

## 📄 Document Upload & Storage
- Upload multiple legal documents per case
- Supports PDFs and text-based documents
- Secure file handling using Werkzeug
- Organized file storage structure

## 🤖 AI-Powered Legal Analysis
- Automatic legal case summarization
- Risk score prediction
- Risk factor extraction
- Similar judgement retrieval
- Legal insights generation

## 🧠 RAG-based Legal Chatbot
- Chat with uploaded legal documents
- Context-aware responses using LangChain + FAISS
- Conversation history support
- Streaming AI responses
- Document Question Answering system

## ⚖️ Indian Kanoon Integration
- Retrieves similar Indian legal judgements
- Helps lawyers reference related cases
- Dynamic legal search query generation

## 🎨 Modern Frontend UI
- Responsive React frontend
- Dashboard-based navigation
- Animated UI using Framer Motion
- Charts and analytics using Recharts
- Clean legal-tech interface

## ⚙️ Additional Features
- Dark Mode / Light Mode support
- Settings management
- Downloadable drafted documents
- Case-specific drafting suggestions
- Translation-ready architecture

---

# 🛠️ Tech Stack

## Frontend
- React.js
- React Router DOM
- Axios
- Framer Motion
- Recharts
- Lucide React Icons

## Backend
- Flask
- Flask JWT Extended
- Flask SQLAlchemy
- Flask Bcrypt
- Flask CORS

## AI / NLP Stack
- LangChain
- FAISS Vector Database
- HuggingFace Embeddings
- Google Gemini API
- Groq API
- Sentence Transformers

## Database
- SQLite (default)

---

# 📁 Project Structure

```bash
project-root/
│
├── frontend_fixed/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── backend_fixed/
│   ├── app.py
│   ├── models.py
│   ├── config.py
│   ├── requirements.txt
│   ├── rag/
│   │   ├── ingest.py
│   │   └── langchain_rag.py
│   ├── utils/
│   └── ...
│
└── README.md
```

---

# ⚡ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd <repo-name>
```

---

# 🔹 Backend Setup

## 2️⃣ Navigate to Backend Folder

```bash
cd backend_fixed
```

## 3️⃣ Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

## 4️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

## 5️⃣ Create Environment Variables

Create a `.env` file inside `backend_fixed/`

```env
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
GOOGLE_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

## 6️⃣ Run Backend Server

```bash
python app.py
```

Backend will start at:

```bash
http://localhost:5000
```

---

# 🔹 Frontend Setup

## 7️⃣ Navigate to Frontend Folder

```bash
cd frontend_fixed
```

## 8️⃣ Install Frontend Dependencies

```bash
npm install
```

## 9️⃣ Start Frontend

```bash
npm start
```

Frontend will start at:

```bash
http://localhost:3000
```

---

# 🔑 Environment Variables

| Variable | Description |
|---|---|
| SECRET_KEY | Flask application secret |
| JWT_SECRET_KEY | JWT authentication secret |
| GOOGLE_API_KEY | Google Gemini API key |
| GROQ_API_KEY | Groq API key |

---

# 🧠 AI Workflow

## 📥 Document Upload
User uploads legal case files.

## 📄 Text Extraction
PDFs and documents are parsed and converted into text.

## ✂️ Chunking & Embeddings
Documents are split into chunks and embedded using HuggingFace models.

## 🗂️ Vector Storage
Embeddings are stored inside a FAISS vector database.

## 🤖 RAG Querying
User questions are matched against relevant document chunks.

## ⚖️ AI Response Generation
Gemini/Groq models generate contextual legal answers.

---

# 📌 API Endpoints

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register user |
| POST | `/login` | Login user |
| GET | `/me` | Get logged-in user |

## Cases

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cases` | Get all user cases |
| POST | `/cases` | Create new case |
| GET | `/cases/:id` | Get single case |
| POST | `/cases/:id/upload` | Upload case documents |
| POST | `/cases/:id/analyze` | Analyze case |

## RAG Chat

| Method | Endpoint | Description |
|---|---|---|
| POST | `/cases/:id/chat` | Chat with documents |
| GET | `/cases/:id/chat/history` | Get chat history |
| DELETE | `/cases/:id/chat/history` | Clear chat history |

---

# 🖥️ UI Screens

- Landing Page
- Login / Signup
- Dashboard
- Create Case Page
- Case Details Page
- Document Upload Page
- AI Analysis Dashboard
- Legal Chatbot Interface
- Settings Page

---

# 🔒 Security Features

- JWT Authentication
- Password hashing
- Secure file upload handling
- Protected API routes
- Input sanitization

---

# 📊 Future Improvements

- Multi-language legal support
- OCR for scanned legal documents
- Voice-based legal assistant
- Real-time collaboration for lawyers
- Cloud deployment support
- Advanced analytics dashboard
- E-signature integration
- Legal document templates

---

# ☁️ Deployment Suggestions

## Frontend
- Vercel
- Netlify
- Firebase Hosting

## Backend
- Render
- Railway
- AWS EC2
- DigitalOcean

## Database
- PostgreSQL
- MySQL
- MongoDB (future migration)

---

# 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

Developed as an AI-powered LegalTech platform for legal document intelligence, drafting assistance, and case analysis.

---

# ⭐ Support

If you found this project useful, consider giving it a star on GitHub ⭐

