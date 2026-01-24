# Setup & Run Instructions

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- **Git**
- A valid **OpenAI API key** (if using GPT models)

## Quick Start (Windows)

### 1. Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 2. Install Frontend Dependencies

```powershell
cd frontend
npm install
```

### 3. Start Backend Server

**Terminal 1:**
```powershell
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

You should see:
```
Uvicorn running on http://127.0.0.1:8000
```

### 4. Start Frontend Server

**Terminal 2:**
```powershell
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x ready in 1234 ms
Local: http://localhost:5173/
```

### 5. Access the Application

- **Frontend**: Open browser to `http://localhost:5173`
- **API Docs**: Visit `http://localhost:8000/docs`

---

## Features & What to Test

### Upload Documents
1. Go to the upload section
2. Drag & drop PDF, TXT, or MD files (or click to select)
3. Click "Upload & Index Documents"
4. You should see:
   - ✅ Progress bar animation
   - ✅ Success message
   - ✅ File validation (size, type)

### Query the Knowledge Base
1. After uploading documents, go to the Query section
2. Type your question
3. Click "Ask"
4. You should see:
   - ✅ Answer generated from your documents
   - ✅ Knowledge graph visualization
   - ✅ Entity extraction and relationships

---

## Troubleshooting

### Backend Issues

**Problem**: "uvicorn: The term 'uvicorn' is not recognized"
```powershell
# Use Python module syntax:
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Problem**: "No module named 'spacy'" or "FAISS not found"
```powershell
cd backend
pip install -r requirements.txt --force-reinstall
python -m spacy download en_core_web_sm
```

**Problem**: "Connection refused" - backend not running
- Make sure backend server is running on terminal
- Check that port 8000 is not in use: `netstat -ano | findstr :8000`

### Frontend Issues

**Problem**: "Cannot find module" or npm errors
```powershell
cd frontend
rm -r node_modules package-lock.json
npm install
npm run dev
```

**Problem**: "Cannot reach http://127.0.0.1:8000"
- Backend server must be running first
- Check CORS settings are enabled (they are by default)

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
OPENAI_API_KEY=your-key-here
EMBEDDING_MODEL=all-MiniLM-L6-v2
LLM_MODEL=gpt-4o-mini
CHUNK_SIZE=300
```

---

## Docker (Alternative)

```powershell
docker-compose up
```

This starts both services:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## Project Structure

```
Dataforge/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & endpoints
│   │   ├── models/schemas.py    # Data models
│   │   └── modules/             # Core RAG pipeline
│   │       ├── preprocessing.py
│   │       ├── retrieval.py
│   │       ├── entity_extraction.py
│   │       ├── graph_builder.py
│   │       └── answer_generator.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DocumentUpload.jsx      # Upload interface
│   │   │   ├── QueryForm.jsx           # Query interface
│   │   │   ├── GraphVisualization.jsx  # Graph display
│   │   │   └── ResultsPanel.jsx        # Results display
│   │   ├── services/api.js             # API calls
│   │   └── store/appStore.js           # State management
│   └── package.json
│
└── docker-compose.yml
```

---

## Development Workflow

### Running Tests

```powershell
cd backend
pytest -v

# Run specific test
pytest tests/test_preprocessing.py::TestChunking::test_chunk_text_basic -v
```

### Code Quality

```powershell
# Backend
cd backend
black . --check
ruff check .

# Frontend
cd frontend
npm run lint
```

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `python -m uvicorn app.main:app --reload` | Start backend dev server |
| `npm run dev` | Start frontend dev server |
| `pytest -v` | Run backend tests |
| `npm run lint` | Lint frontend code |
| `docker-compose up` | Run with Docker |
| `docker-compose down` | Stop Docker services |

---

## Performance Notes

- First upload/query may take longer (models initializing)
- Subsequent uploads are faster (models cached)
- Typical query response: 3-10 seconds
- Graph visualization works best with <500 entities

---

## Need Help?

1. **Check logs**: Look at terminal output for error messages
2. **API Docs**: Visit `http://localhost:8000/docs` for interactive API testing
3. **Browser Console**: Press F12 → Console tab for frontend errors
4. **Review**: Check `backend/app/main.py` for available endpoints

---

Happy exploring! 🚀
