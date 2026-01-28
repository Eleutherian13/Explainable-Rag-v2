"""
Citation and traceability module.
Handles linking answers to source documents, extracting answer entities, and confidence scoring.
"""
from typing import List, Dict, Tuple, Optional
import re
from statistics import mean


def extract_answer_entities(answer: str, available_entities: List[Dict]) -> List[Dict]:
    """
    Find which available entities are mentioned in the answer.
    
    Args:
        answer: Generated answer text
        available_entities: List of extracted entities with source_chunk_id
        
    Returns:
        List of entities mentioned in answer with position information
    """
    answer_entities = []
    answer_lower = answer.lower()
    
    for entity in available_entities:
        entity_name_lower = entity['name'].lower()
        
        # Find all occurrences of entity in answer
        position = answer_lower.find(entity_name_lower)
        
        if position >= 0:
            answer_entities.append({
                'name': entity['name'],
                'type': entity['type'],
                'position_in_answer': position,
                'source_chunk_id': entity.get('source_chunk_id', 0),
                'retrieval_score': entity.get('retrieval_score', 0.5),
                'mentioned': True
            })
    
    return answer_entities


def find_answer_citations(answer: str, chunks: List[str], similarities: List[float]) -> Tuple[List[Dict], List[str]]:
    """
    Find which chunks support the answer and extract unsupported segments.
    
    Args:
        answer: Generated answer text
        chunks: Retrieved source chunks
        similarities: Relevance scores for each chunk
        
    Returns:
        Tuple of (citations list, unsupported segments list)
    """
    citations = []
    unsupported_segments = []
    
    # Split answer into sentences
    sentences = re.split(r'(?<=[.!?])\s+', answer.strip())
    supported_sentences = set()
    
    for sentence in sentences:
        if not sentence.strip():
            continue
            
        # Check which chunks contain this sentence or key terms from it
        found = False
        sentence_lower = sentence.lower()
        key_terms = set(word for word in sentence.split() if len(word) > 4)
        
        for chunk_idx, chunk in enumerate(chunks):
            chunk_lower = chunk.lower()
            
            # Try exact match first
            if sentence_lower in chunk_lower:
                citations.append({
                    'chunk_index': chunk_idx,
                    'chunk_text': chunk[:200],  # First 200 chars for display
                    'relevance_score': float(similarities[chunk_idx]),
                    'matched_text': sentence[:100]
                })
                supported_sentences.add(sentence)
                found = True
                break
            
            # Try partial match with key terms
            matching_terms = sum(1 for term in key_terms if term in chunk_lower)
            if matching_terms >= max(2, len(key_terms) // 2):
                citations.append({
                    'chunk_index': chunk_idx,
                    'chunk_text': chunk[:200],
                    'relevance_score': float(similarities[chunk_idx]),
                    'matched_text': sentence[:100]
                })
                supported_sentences.add(sentence)
                found = True
                break
        
        if not found and sentence.strip():
            unsupported_segments.append(sentence)
    
    return citations, unsupported_segments


def calculate_answer_confidence(
    citations: List[Dict],
    similarities: List[float],
    answer_length: int
) -> float:
    """
    Calculate confidence score based on citation quality and retrieval scores.
    
    Args:
        citations: List of citations for the answer
        similarities: Retrieval relevance scores
        answer_length: Number of sentences in answer
        
    Returns:
        Confidence score between 0.0 and 1.0
    """
    if not similarities:
        return 0.0
    
    # Retrieval quality score (mean of top chunks)
    retrieval_score = float(mean(similarities)) if similarities else 0.0
    
    # Citation coverage score (how much of answer is cited)
    citation_coverage = 1.0 if answer_length == 0 else min(1.0, len(citations) / answer_length)
    
    # Citation quality score (mean relevance of citations)
    citation_quality = (
        float(mean(c['relevance_score'] for c in citations))
        if citations
        else 0.0
    )
    
    # Weighted combination
    final_score = (
        retrieval_score * 0.4 +
        citation_coverage * 0.35 +
        citation_quality * 0.25
    )
    
    return min(1.0, max(0.0, final_score))


def extract_sentences(text: str) -> List[str]:
    """
    Extract sentences from text.
    
    Args:
        text: Input text
        
    Returns:
        List of sentences
    """
    # Split on sentence boundaries
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if s.strip()]


def link_chunks_to_answer_segments(answer: str, chunks: List[str], similarities: List[float]) -> Dict[int, List[str]]:
    """
    Create mapping of chunk indices to answer segments they support.
    
    Args:
        answer: Generated answer
        chunks: Source chunks
        similarities: Relevance scores
        
    Returns:
        Dict mapping chunk_idx -> [supported_segments]
    """
    chunk_support_map = {}
    sentences = extract_sentences(answer)
    
    for sentence in sentences:
        if not sentence:
            continue
        
        sentence_lower = sentence.lower()
        key_terms = set(word for word in sentence.split() if len(word) > 4)
        
        for chunk_idx, chunk in enumerate(chunks):
            chunk_lower = chunk.lower()
            
            # Check if chunk supports this sentence
            if sentence_lower in chunk_lower or any(term in chunk_lower for term in key_terms):
                if chunk_idx not in chunk_support_map:
                    chunk_support_map[chunk_idx] = []
                chunk_support_map[chunk_idx].append(sentence)
    
    return chunk_support_map
