# Getting Started Guide

## Quick Start

### Prerequisites

- **Python 3.12+**
- **Node.js 20+**
- **Groq API Key** (free at https://console.groq.com)

### 1. Clone & Setup Environment

```bash
cd Dataforge

# Create .env file
cp .env.example .env

# Add your Groq API key to .env
# GROQ_API_KEY=your-key-here
```

### 2. Start Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload --port 8000
```

### 3. Start Frontend (new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 4. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Using the Application

1. **Upload Documents**: Click "Upload Documents" and select PDF, TXT, or MD files
2. **Ask Questions**: Enter a question about your documents
3. **View Results**: 
   - **Answer**: AI-generated response grounded in your documents
   - **Sources**: Original document chunks used to generate the answer
   - **Entities**: Named entities extracted from the documents
   - **Pipeline**: Full 9-stage RAG pipeline transparency

## Docker (Alternative)

```bash
docker-compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## Troubleshooting

- **Port in use**: Change port in `uvicorn` command or `vite.config.js`
- **API errors**: Check that backend is running and GROQ_API_KEY is set
- **Import errors**: Ensure all dependencies are installed
