"""
Main FastAPI application.
"""
import os
import uuid
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.models.schemas import (
    QueryRequest, QueryResponse, UploadResponse, StatusResponse,
    Entity, Relationship, GraphNode, GraphEdge, GraphData
)
from app.modules.preprocessing import preprocess_documents
from app.modules.retrieval import EmbeddingModel, FAISSRetriever
from app.modules.entity_extraction import EntityExtractor
from app.modules.graph_builder import KnowledgeGraphBuilder
from app.modules.answer_generator import AnswerGenerator

# Initialize FastAPI app
app = FastAPI(
    title="Explainable RAG with Knowledge Graphs",
    description="A web application for RAG with knowledge graph explanations",
    version="1.0.0"
)

# CORS middleware - Enhanced for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Global state for sessions (in-memory, for production use DB)
sessions = {}

# Lazy initialization of components (on first use)
embedding_model = None
entity_extractor = None
answer_generator = None

def get_embedding_model():
    """Lazily initialize embedding model on first use."""
    global embedding_model
    if embedding_model is None:
        print("Initializing embedding model (this may take a moment)...")
        embedding_model = EmbeddingModel()
    return embedding_model

def get_entity_extractor():
    """Lazily initialize entity extractor on first use."""
    global entity_extractor
    if entity_extractor is None:
        entity_extractor = EntityExtractor()
    return entity_extractor

def get_answer_generator():
    """Lazily initialize answer generator on first use."""
    global answer_generator
    if answer_generator is None:
        answer_generator = AnswerGenerator()
    return answer_generator


class RAGSession:
    """Session object for managing uploaded documents and indices."""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.retriever = FAISSRetriever(get_embedding_model())
        self.chunks = []
        self.sources = []
        self.entities = []
        self.entity_chunk_map = {}
        self.graph_builder = KnowledgeGraphBuilder()


@app.get("/status", response_model=StatusResponse)
async def status():
    """Health check endpoint."""
    return StatusResponse(
        status="healthy",
        message="Explainable RAG system is running"
    )


@app.post("/upload", response_model=UploadResponse)
async def upload(files: List[UploadFile] = File(...)):
    """
    Upload and process documents.
    
    Args:
        files: List of PDF or text files
        
    Returns:
        Upload response with index ID and chunk count
    """
    try:
        if not files or len(files) == 0:
            raise HTTPException(status_code=400, detail="No files provided. Please select at least one file.")
        
        print(f"Starting upload for {len(files)} files")
        
        # Validate file types
        supported_extensions = {'.pdf', '.txt', '.md', '.yaml', '.yml'}
        for file in files:
            if not any(file.filename.lower().endswith(ext) for ext in supported_extensions):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid file type: {file.filename}. Supported: PDF, TXT, MD"
                )
        
        # Read file contents
        file_contents = []
        for file in files:
            try:
                content = await file.read()
                if len(content) == 0:
                    raise HTTPException(status_code=400, detail=f"File {file.filename} is empty")
                file_contents.append((content, file.filename))
                print(f"Read {len(content)} bytes from {file.filename}")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error reading file {file.filename}: {str(e)}")
        
        # Preprocess documents
        print("Preprocessing documents...")
        chunks, sources = preprocess_documents(file_contents)
        
        if not chunks or len(chunks) == 0:
            raise HTTPException(status_code=400, detail="No text content could be extracted from the uploaded files. Please check your documents.")
        
        print(f"Created {len(chunks)} chunks from documents")
        
        # Create session
        session_id = str(uuid.uuid4())
        session = RAGSession(session_id)
        session.chunks = chunks
        session.sources = sources
        
        # Build retrieval index
        print("Building embedding index...")
        session.retriever.build_index(chunks, sources)
        
        # Extract entities
        print("Extracting entities...")
        session.entities, session.entity_chunk_map = get_entity_extractor().extract_from_chunks(chunks)
        
        # Build knowledge graph
        print("Building knowledge graph...")
        session.graph_builder.build_graph(
            session.entities,
            session.entity_chunk_map,
            chunks
        )
        
        sessions[session_id] = session
        
        print(f"Upload completed successfully. Session ID: {session_id}")
        
        return UploadResponse(
            status="success",
            message=f"Successfully processed {len(chunks)} chunks from {len(files)} file(s)",
            index_id=session_id,
            chunks_count=len(chunks)
        )
        
    except HTTPException as e:
        print(f"Upload HTTP error: {e.detail}")
        raise
    except Exception as e:
        error_msg = f"Upload error: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """
    Process query and return answer with explanations.
    
    Args:
        request: Query request with query text and session ID
        
    Returns:
        Query response with answer, entities, relationships, and graph
    """
    try:
        # Get session
        session_id = request.index_id
        if not session_id or session_id not in sessions:
            raise HTTPException(status_code=404, detail="Index not found. Please upload documents first.")
        
        session = sessions[session_id]
        
        if not session.retriever.is_indexed():
            raise HTTPException(status_code=400, detail="Index not properly initialized")
        
        # Retrieve relevant chunks
        retrieved_chunks, retrieved_sources, similarities = session.retriever.retrieve(
            request.query,
            k=request.top_k
        )
        
        if not retrieved_chunks:
            raise HTTPException(status_code=404, detail="No relevant documents found")
        
        # Generate answer
        answer = get_answer_generator().generate(request.query, retrieved_chunks)
        
        # Extract entities from retrieved chunks
        retrieved_entities = []
        entity_extractor_instance = get_entity_extractor()
        for chunk_idx, chunk in enumerate(retrieved_chunks):
            entities = entity_extractor_instance.extract_entities(chunk)
            for ent in entities:
                retrieved_entities.append({
                    'name': ent['name'],
                    'type': ent['type'],
                    'source_chunk_id': chunk_idx
                })
        
        # Remove duplicates
        seen = set()
        unique_entities = []
        for ent in retrieved_entities:
            key = (ent['name'].lower(), ent['type'])
            if key not in seen:
                unique_entities.append(Entity(**ent))
                seen.add(key)
        
        # Get relationships from graph
        relationships = [
            Relationship(
                from_entity=rel['from_entity'],
                to_entity=rel['to_entity'],
                relation=rel['relation']
            )
            for rel in session.graph_builder.get_relationships()
        ]
        
        # Get graph data
        graph_data_dict = session.graph_builder.get_graph_data()
        graph_nodes = [GraphNode(**node) for node in graph_data_dict['nodes']]
        graph_edges = [GraphEdge(**edge) for edge in graph_data_dict['edges']]
        graph_data = GraphData(nodes=graph_nodes, edges=graph_edges)
        
        return QueryResponse(
            answer=answer,
            entities=unique_entities,
            relationships=relationships,
            graph_data=graph_data,
            snippets=retrieved_chunks,
            status="success"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/debug/retrieve")
async def debug_retrieve(request: QueryRequest):
    """Debug endpoint to show retrieval results with similarities."""
    try:
        session_id = request.index_id
        if not session_id or session_id not in sessions:
            raise HTTPException(status_code=404, detail="Index not found")
        
        session = sessions[session_id]
        
        # Retrieve with details
        retrieved_chunks, retrieved_sources, similarities = session.retriever.retrieve(
            request.query,
            k=request.top_k
        )
        
        return {
            "query": request.query,
            "results": [
                {
                    "chunk": chunk[:200] + "..." if len(chunk) > 200 else chunk,
                    "source": source,
                    "similarity": sim,
                    "full_length": len(chunk)
                }
                for chunk, source, sim in zip(retrieved_chunks, retrieved_sources, similarities)
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/clear")
async def clear_session(index_id: str):
    """Clear a session."""
    if index_id in sessions:
        del sessions[index_id]
        return {"status": "success", "message": "Session cleared"}
    raise HTTPException(status_code=404, detail="Session not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
