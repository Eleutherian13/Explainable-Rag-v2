# Dataforge - Explainable RAG Application

A modern full-stack web application implementing Retrieval-Augmented Generation (RAG) with entity extraction and explainable AI. Users can upload documents, ask questions, and receive grounded answers with complete source traceability.

## 🌟 Features

- **Document Upload**: Support for PDF, TXT, and Markdown files
- **Smart Retrieval**: Vector-based semantic search using FAISS and sentence embeddings
- **Entity Extraction**: Automatic named entity recognition
- **AI-Powered Answers**: LLM integration (Groq API) for generating grounded responses
- **Explainability**: Complete traceability of answers to source documents
- **Pipeline Transparency**: Full visibility into the 9-stage RAG pipeline
- **Modern UI**: Responsive React-based interface with Tailwind CSS

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
API Layer (FastAPI)
    ↓
RAG Pipeline:
  1. Document Upload & Validation
  2. Text Chunking
  3. Embedding Generation (sentence-transformers)
  4. Vector Indexing (FAISS)
  5. Semantic Retrieval
  6. Entity Extraction
  7. Context Assembly
  8. RAG Answer Generation (Groq LLM)
  9. Response Polishing & Citation
```

## 🛠️ Technology Stack

### Backend

- **Framework**: FastAPI 0.110+
- **Language**: Python 3.12+
- **Key Libraries**:
  - SentenceTransformers (embeddings)
  - FAISS (vector search)
  - Groq SDK (LLM)
  - PyMuPDF (PDF parsing)

### Frontend

- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand

### DevOps

- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose (recommended)
- Python 3.12+ (for local development)
- Node.js 20+ (for frontend development)
- Groq API key (for LLM integration)

### Option 1: Docker Compose (Recommended)

```bash
# Clone/navigate to project
cd Dataforge

# Copy environment template
cp .env.example .env

# Add your Groq API key in .env
# GROQ_API_KEY=your-key-here

# Start both services
docker-compose up

# Access the app
# Frontend: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Runs on http://localhost:5173
```

## 📖 API Documentation

### Endpoints

#### 1. POST /upload

Upload and index documents.

**Request:**

```bash
curl -X POST -F "files=@document.pdf" http://localhost:8000/upload
```

**Response:**

```json
{
  "status": "success",
  "message": "Successfully processed 5 chunks from 1 files",
  "index_id": "550e8400-e29b-41d4-a716-446655440000",
  "chunks_count": 5
}
```

#### 2. POST /query

Submit a query and get answers with explanations.

**Request:**

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "Who developed GPT-4?", "index_id": "550e8400..."}' \
  http://localhost:8000/query
```

**Response:**

```json
{
  "answer": "GPT-4 was developed by OpenAI.",
  "entities": [
    {"name": "GPT-4", "type": "PRODUCT", "source_chunk_id": 0},
    {"name": "OpenAI", "type": "ORG", "source_chunk_id": 0}
  ],
  "relationships": [
    {"from_entity": "OpenAI", "to_entity": "GPT-4", "relation": "developed"}
  ],
  "graph_data": {
    "nodes": [...],
    "edges": [...]
  },
  "snippets": ["GPT-4 was developed by OpenAI..."],
  "status": "success"
}
```

#### 3. GET /status

Health check.

```bash
curl http://localhost:8000/status
```

#### 4. POST /clear

Clear a session.

```bash
curl -X POST "http://localhost:8000/clear?index_id=550e8400..."
```

## 📁 Project Structure

```
Dataforge/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic models
│   │   └── modules/
│   │       ├── preprocessing.py # Document processing
│   │       ├── retrieval.py     # Vector search
│   │       ├── entity_extraction.py # NER
│   │       ├── graph_builder.py # Knowledge graphs
│   │       └── answer_generator.py # LLM integration
│   ├── requirements.txt
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── store/               # Zustand store
│   │   ├── services/            # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .gitignore
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
OPENAI_API_KEY=sk-your-api-key
```

### Backend Settings

In `backend/app/main.py`:

- Embedding model: `all-MiniLM-L6-v2`
- Retrieval top-k: 5 (configurable per query)
- Chunk size: 300 words
- Chunk overlap: 50 words

## 📊 Usage Examples

### Example 1: Query Knowledge Base

1. Upload PDF documents
2. Receive `index_id` from response
3. Submit query: "What are the main topics?"
4. Receive answer with:
   - Generated response
   - Extracted entities (people, organizations, locations)
   - Knowledge graph showing relationships
   - Source snippets

### Example 2: Verify Sources

Click on entities in the knowledge graph to see:

- Source chunks where entity was found
- Related entities
- Relationships and how they were inferred

## 🔒 Security & Privacy

- **No Persistent Storage**: All data processed in-memory per session
- **CORS Protection**: Configured for localhost (customize for production)
- **Input Validation**: Pydantic models validate all inputs
- **Session Isolation**: Each upload creates isolated session

## ⚡ Performance

- **Embedding**: ~100ms per 300-word chunk
- **Retrieval**: ~50ms for FAISS search
- **Entity Extraction**: ~200ms per chunk
- **Answer Generation**: ~2-5s (API dependent)
- **Total Query Latency**: ~3-10s

## 🚧 Limitations

- **Memory**: In-memory storage limits corpus size (~1GB RAM for 100k chunks)
- **API Costs**: OpenAI API usage charges per request
- **Graph Complexity**: Large graphs may slow visualization
- **Languages**: Currently optimized for English

## 📈 Scaling Considerations

For production:

1. **Add Database**: PostgreSQL for persistent storage
2. **Queue System**: Celery for async processing
3. **Caching**: Redis for embedding cache
4. **Load Balancing**: Nginx for multiple backend instances
5. **User Auth**: JWT for session management

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📝 Logging

Backend logs available via:

- Console output
- API endpoint (implement `/logs` if needed)

## 🤝 Contributing

1. Create feature branch
2. Follow code style (Black for Python, Prettier for JS)
3. Add tests
4. Submit pull request

## 📄 License

MIT License - See LICENSE file

## 🆘 Troubleshooting

### Backend won't start

- Check Python version: `python --version` (need 3.12+)
- Verify spaCy model: `python -m spacy download en_core_web_sm`
- Check port 8000 is available

### Frontend won't connect to API

- Ensure backend is running: `http://localhost:8000/status`
- Check CORS settings in `backend/app/main.py`
- Verify API URL in frontend: `frontend/src/services/api.js`

### High memory usage

- Reduce chunk size in `backend/app/modules/preprocessing.py`
- Clear old sessions via `/clear` endpoint
- Limit uploaded file size

## 📞 Support

For issues, feature requests, or questions:

1. Check documentation
2. Review API docs at `http://localhost:8000/docs`
3. Inspect browser console for frontend errors
4. Check backend logs

## 🎯 Future Enhancements

- [ ] Multi-language support
- [ ] Advanced graph algorithms
- [ ] User authentication
- [ ] Result caching
- [ ] Graph export (SVG/PNG)
- [ ] Advanced filtering
- [ ] Bulk operations
- [ ] Real-time collaborative sessions

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: Production Ready
