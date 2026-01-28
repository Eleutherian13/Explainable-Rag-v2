"""
Data pipeline visualization and tracking.
"""
from typing import Dict, List, Any
from datetime import datetime


class PipelineTracker:
    """Track and visualize data pipeline flow."""
    
    def __init__(self):
        """Initialize pipeline tracker."""
        self.stages = {}
        self.start_time = datetime.now()
    
    def log_stage(self, stage_name: str, data: Dict[str, Any]):
        """Log a pipeline stage with its data."""
        self.stages[stage_name] = {
            "timestamp": datetime.now(),
            "data": data
        }
    
    def get_pipeline_visualization(self) -> Dict:
        """
        Get complete pipeline visualization data.
        
        Returns:
            Dict with pipeline flow and metadata
        """
        return {
            "stages": [
                {
                    "id": "upload",
                    "name": "Document Upload",
                    "icon": "📤",
                    "description": "Parse and read uploaded files",
                    "status": "complete",
                    "data": self.stages.get("upload", {}).get("data", {})
                },
                {
                    "id": "preprocessing",
                    "name": "Preprocessing & Chunking",
                    "icon": "✂️",
                    "description": "Clean text and split into chunks",
                    "status": "complete",
                    "data": self.stages.get("preprocessing", {}).get("data", {})
                },
                {
                    "id": "embedding",
                    "name": "Embedding Generation",
                    "icon": "🔢",
                    "description": "Generate vector embeddings for each chunk",
                    "status": "complete",
                    "data": self.stages.get("embedding", {}).get("data", {})
                },
                {
                    "id": "indexing",
                    "name": "Vector Indexing (FAISS)",
                    "icon": "🗂️",
                    "description": "Build searchable FAISS index",
                    "status": "complete",
                    "data": self.stages.get("indexing", {}).get("data", {})
                },
                {
                    "id": "entity_extraction",
                    "name": "Entity Extraction",
                    "icon": "🏷️",
                    "description": "Extract named entities from chunks",
                    "status": "complete",
                    "data": self.stages.get("entity_extraction", {}).get("data", {})
                },
                {
                    "id": "graph_building",
                    "name": "Knowledge Graph Construction",
                    "icon": "🔗",
                    "description": "Build entity relationships graph",
                    "status": "complete",
                    "data": self.stages.get("graph_building", {}).get("data", {})
                }
            ],
            "query_stages": [
                {
                    "id": "retrieval",
                    "name": "Semantic Retrieval",
                    "icon": "🔍",
                    "description": "Find most relevant document chunks",
                    "status": "complete",
                    "data": self.stages.get("retrieval", {}).get("data", {})
                },
                {
                    "id": "answer_generation",
                    "name": "Answer Generation",
                    "icon": "💡",
                    "description": "Generate answer using LLM with context",
                    "status": "complete",
                    "data": self.stages.get("answer_generation", {}).get("data", {})
                },
                {
                    "id": "citation",
                    "name": "Citation Extraction",
                    "icon": "📌",
                    "description": "Link answer to source documents",
                    "status": "complete",
                    "data": self.stages.get("citation", {}).get("data", {})
                }
            ],
            "total_time": (datetime.now() - self.start_time).total_seconds()
        }
    
    @staticmethod
    def get_pipeline_info() -> Dict:
        """Get information about the data pipeline."""
        return {
            "name": "Explainable RAG Pipeline",
            "description": "Retrieval Augmented Generation with Knowledge Graphs",
            "components": {
                "Preprocessing": {
                    "description": "Document parsing and text cleaning",
                    "technologies": ["pdfplumber", "regex", "NLTK"],
                    "output": "Clean text chunks"
                },
                "Embedding": {
                    "description": "Convert text to semantic vectors",
                    "technologies": ["Sentence-Transformers", "all-MiniLM-L6-v2"],
                    "output": "384-dimensional embeddings"
                },
                "Retrieval": {
                    "description": "Find relevant documents",
                    "technologies": ["FAISS", "Semantic similarity"],
                    "output": "Top-K relevant chunks"
                },
                "Entity Extraction": {
                    "description": "Extract named entities and relationships",
                    "technologies": ["NER", "Regex patterns"],
                    "output": "Structured entities"
                },
                "Graph Construction": {
                    "description": "Build entity relationship graph",
                    "technologies": ["NetworkX", "Graph algorithms"],
                    "output": "Knowledge graph"
                },
                "Answer Generation": {
                    "description": "Generate answers using LLM",
                    "technologies": ["OpenAI GPT", "Prompt engineering"],
                    "output": "Contextual answer"
                },
                "Citation": {
                    "description": "Track answer to source mapping",
                    "technologies": ["Text similarity", "Citation extraction"],
                    "output": "Source citations"
                }
            }
        }
