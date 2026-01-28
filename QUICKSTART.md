# Dataforge - Quick Start Guide

## Prerequisites
- Python 3.12+ (or 3.14)
- Node.js 18+ with npm
- 2GB RAM minimum

## Installation & Setup (One-time)

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cd ..
```

## Running the Application

### Terminal 1 - Backend Server
```bash
python run_backend.py
```
✓ Backend starts on: **http://127.0.0.1:8000**
✓ API Docs: **http://127.0.0.1:8000/docs**

### Terminal 2 - Frontend Development Server
```bash
cd frontend
npm run dev
```
✓ Frontend starts on: **http://127.0.0.1:5173** (or http://localhost:5173)

### Visit the Application
Open browser and go to: **http://localhost:5173**

## Testing

### Quick Test (Verify Everything Works)
```bash
python test_e2e.py
```
Expected output:
```
[✓] Backend is running
[✓] Status endpoint works
[✓] Upload works
[✓] Query works
[✓] CORS configured correctly
```

### Run Unit Tests
```bash
cd backend
python -m pytest -q
```
Expected: **20 passed** ✓

## Usage

### 1. Upload Documents
- Click "Upload Documents" panel
- Drag and drop or select files (PDF, TXT, MD)
- Click "Upload & Index Documents"
- Wait for processing to complete (~2-3 seconds)

### 2. Ask Questions
- Documents will be automatically indexed
- Enter your question in "Ask a Question" panel
- Click "Submit Query"
- View results with:
  - **Answer**: AI-generated response
  - **Graph**: Knowledge graph visualization
  - **Entities**: Extracted entities
  - **Sources**: Original document snippets

## Common Issues & Solutions

### Backend doesn't start
```bash
# Reinstall dependencies
pip install --upgrade -r backend/requirements.txt

# Check Python version
python --version  # Should be 3.12+

# Check port 8000 is available
netstat -ano | findstr :8000
```

### Frontend shows "No response from server"
- Ensure backend is running (Terminal 1)
- Check backend is on http://127.0.0.1:8000
- Wait a few seconds for backend startup

### Upload fails or query times out
- Backend may be processing previous request
- Try again after a few seconds
- Check browser console (F12) for error details

### CORS or "blocked by CORS" error
- Backend CORS is pre-configured
- Ensure frontend connects to correct backend URL
- Check `.env` file in frontend (if exists)

## Production Deployment

For production, add:
1. **Database**: PostgreSQL for persistent storage
2. **Cache**: Redis for embedding caching
3. **Auth**: JWT authentication
4. **SSL**: HTTPS certificates
5. **Docker**: Use docker-compose (provided)

```bash
docker-compose up
```

## Key Features

✅ Upload documents (PDF, TXT, MD, YAML)
✅ Automatic chunking and embedding
✅ FAISS vector retrieval
✅ Entity extraction and linking
✅ Knowledge graph construction
✅ LLM-powered answer generation
✅ Citation tracking
✅ Confidence scoring
✅ Interactive visualization

## Support & Documentation

- **API Documentation**: http://localhost:8000/docs (when running)
- **Backend Guide**: See `README.md` in backend/
- **Full Report**: See `BACKEND_FIXES_REPORT.md`
- **Troubleshooting**: See copilot-instructions.md

## Status

✅ Backend: **FULLY FUNCTIONAL**
✅ Frontend: **READY TO USE**
✅ Integration: **TESTED & VERIFIED**

Ready to use! 🚀
