"""
Pydantic models for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class QueryRequest(BaseModel):
    """Request model for query endpoint."""
    query: str = Field(..., min_length=1, max_length=1000)
    index_id: Optional[str] = None
    top_k: int = Field(default=5, ge=1, le=20)


class Entity(BaseModel):
    """Model for extracted entities."""
    name: str
    type: str
    source_chunk_id: Optional[int] = None


class Relationship(BaseModel):
    """Model for entity relationships."""
    from_entity: str
    to_entity: str
    relation: str


class GraphNode(BaseModel):
    """Model for graph nodes."""
    id: str
    label: str


class GraphEdge(BaseModel):
    """Model for graph edges."""
    source: str
    target: str
    label: str


class GraphData(BaseModel):
    """Model for graph visualization data."""
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class Citation(BaseModel):
    """Model for answer citations to source chunks."""
    chunk_index: int
    chunk_text: str
    relevance_score: float = Field(default=0.5, ge=0.0, le=1.0)
    matched_text: Optional[str] = None


class AnswerEntity(BaseModel):
    """Model for entities mentioned in the answer."""
    name: str
    type: str
    source_chunk_id: Optional[int] = None
    position_in_answer: int = -1
    retrieval_score: float = Field(default=0.5, ge=0.0, le=1.0)


class ChunkReference(BaseModel):
    """Model for chunk-level source attribution."""
    index: int
    filename: str
    relevance_score: float


class QueryResponse(BaseModel):
    """Response model for query endpoint."""
    answer: str
    entities: List[Entity]
    answer_entities: List[AnswerEntity] = Field(default_factory=list)
    relationships: List[Relationship]
    graph_data: GraphData
    snippets: List[str]
    citations: List[Citation] = Field(default_factory=list)
    confidence_score: float = Field(default=0.5, ge=0.0, le=1.0)
    unsupported_segments: List[str] = Field(default_factory=list)
    retrieval_scores: List[float] = Field(default_factory=list)
    chunk_references: List[ChunkReference] = Field(default_factory=list)
    status: str = "success"


class UploadResponse(BaseModel):
    """Response model for upload endpoint."""
    status: str
    message: str
    index_id: str
    chunks_count: int


class StatusResponse(BaseModel):
    """Response model for status endpoint."""
    status: str
    message: str
    version: str = "1.0.0"

class DocumentProcessingStatus(BaseModel):
    """Status of a document in the pipeline."""
    filename: str
    status: str  # 'uploaded', 'chunking', 'embedding', 'indexed'
    progress: int  # 0-100
    chunks_count: int = 0
    error: Optional[str] = None


class SessionProcessingStatus(BaseModel):
    """Overall session processing status."""
    session_id: str
    overall_status: str  # 'idle', 'processing', 'completed', 'error'
    documents: List[DocumentProcessingStatus]
    total_chunks: int = 0
    total_entities: int = 0
    total_graph_edges: int = 0
    current_stage: str = ""
    error_message: Optional[str] = None


class ExportData(BaseModel):
    """Data export container."""
    data_type: str  # 'chunks', 'entities', 'graph', 'trace'
    content: Dict[str, Any]
    filename: str
    format: str  # 'json', 'csv', 'pdf'