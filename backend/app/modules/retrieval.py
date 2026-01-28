"""
Embedding and retrieval module using FAISS.
"""
import numpy as np
from typing import List, Tuple, Optional
from sentence_transformers import SentenceTransformer
import faiss


class EmbeddingModel:
    """Wrapper for SentenceTransformers embedding model."""
    
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initialize embedding model.
        
        Args:
            model_name: HuggingFace model identifier
        """
        self.model = SentenceTransformer(model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()
    
    def encode(self, texts: List[str]) -> np.ndarray:
        """
        Encode texts to embeddings.
        
        Args:
            texts: List of text strings
            
        Returns:
            Numpy array of embeddings
        """
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        return embeddings.astype(np.float32)


class FAISSRetriever:
    """Vector retrieval using FAISS."""
    
    def __init__(self, embedding_model: EmbeddingModel):
        """
        Initialize retriever.
        
        Args:
            embedding_model: EmbeddingModel instance
        """
        self.embedding_model = embedding_model
        self.index = None
        self.chunks = []
        self.sources = []
    
    def build_index(self, texts: List[str], sources: List[str]):
        """
        Build FAISS index from texts.
        
        Args:
            texts: List of text chunks
            sources: List of source filenames
        """
        self.chunks = texts
        self.sources = sources
        
        # Encode texts
        embeddings = self.embedding_model.encode(texts)
        
        # Create FAISS index
        self.index = faiss.IndexFlatL2(embeddings.shape[1])
        self.index.add(embeddings)
    
    def retrieve(self, query: str, k: int = 5) -> Tuple[List[str], List[str], List[float]]:
        """
        Retrieve top-k relevant chunks.
        
        Args:
            query: Query string
            k: Number of results
            
        Returns:
            Tuple of (chunks, sources, similarities)
        """
        if self.index is None:
            return [], [], []
        
        # Encode query
        query_embedding = self.embedding_model.encode([query])
        
        # Search
        distances, indices = self.index.search(query_embedding, min(k, len(self.chunks)))
        
        # Get results
        retrieved_chunks = [self.chunks[i] for i in indices[0]]
        retrieved_sources = [self.sources[i] for i in indices[0]]
        retrieved_distances = distances[0].tolist()
        
        # Convert distances to similarities
        similarities = [1.0 / (1.0 + d) for d in retrieved_distances]
        
        return retrieved_chunks, retrieved_sources, similarities
    
    def get_retrieved_indices(self, query: str, k: int = 5) -> Tuple[List[int], List[float]]:
        """
        Get indices of top-k retrieved chunks and their similarities.
        
        Args:
            query: Query string
            k: Number of results
            
        Returns:
            Tuple of (chunk_indices, similarities)
        """
        if self.index is None:
            return [], []
        
        # Encode query
        query_embedding = self.embedding_model.encode([query])
        
        # Search
        distances, indices = self.index.search(query_embedding, min(k, len(self.chunks)))
        
        # Convert distances to similarities
        retrieved_indices = indices[0].tolist()
        retrieved_distances = distances[0].tolist()
        similarities = [1.0 / (1.0 + d) for d in retrieved_distances]
        
        return retrieved_indices, similarities
    
    def is_indexed(self) -> bool:
        """Check if index is built."""
        return self.index is not None
