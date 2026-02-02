"""
Document preprocessing and chunking module.
"""
import re
from typing import List, Tuple
import pdfplumber
import pypdf
from pathlib import Path
import tempfile
import os
from app.modules.text_reconstructor import TextReconstructor


def insert_spaces_in_concatenated_text(text: str) -> str:
    """
    Intelligently insert spaces in text where words are concatenated without spaces.
    Handles patterns like "Thatis" -> "That is", "eachdimension" -> "each dimension"
    """
    common_words = [
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one',
        'our', 'out', 'had', 'has', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see',
        'two', 'way', 'who', 'boy', 'did', 'get', 'got', 'let', 'put', 'say', 'she', 'too',
        'use', 'each', 'that', 'this', 'with', 'from', 'have', 'been', 'them', 'than', 'more',
        'also', 'over', 'both', 'same', 'such', 'only', 'like', 'what', 'when', 'where', 'which',
        'will', 'would', 'could', 'should', 'first', 'other', 'these', 'those', 'about', 'after',
        'model', 'data', 'time', 'work', 'part', 'year', 'make', 'take', 'come', 'know', 'good',
        'find', 'give', 'hand', 'tell', 'call', 'turn', 'feel', 'fact', 'head', 'keep', 'seem'
    ]
    
    result = []
    i = 0
    while i < len(text):
        if i > 0 and text[i].isupper() and text[i-1].islower():
            # Check if previous chars form a real word
            for word_len in range(3, min(10, i+1)):
                potential_word = text[i-word_len:i].lower()
                if potential_word in common_words:
                    result.append(' ')
                    break
        result.append(text[i])
        i += 1
    
    return ''.join(result)


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from PDF file with proper spacing and layout preservation.
    
    Args:
        file_path: Path to PDF file
        
    Returns:
        Extracted text
    """
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                try:
                    page_text = page.extract_text(layout=False, x_tolerance=3, y_tolerance=3) or ""
                except:
                    page_text = page.extract_text() or ""
                
                if page_text:
                    # First pass: insert spaces in concatenated words
                    page_text = insert_spaces_in_concatenated_text(page_text)
                    
                    # Fix spacing patterns
                    page_text = re.sub(r'([a-z])([A-Z])', r'\1 \2', page_text)
                    page_text = re.sub(r'([a-z])([A-Z][a-z])', r'\1 \2', page_text)
                    page_text = re.sub(r'(\.)([A-Z])', r'\1 \2', page_text)
                    page_text = re.sub(r'([a-z]{2,})([A-Z][a-z]{2,})', r'\1 \2', page_text)
                    # Normalize whitespace
                    page_text = re.sub(r'\s+', ' ', page_text)
                    text += page_text + "\n\n"
    except Exception as e:
        print(f"Error extracting PDF: {e}")
    return text.strip()


def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """
    Extract text from uploaded file (PDF or text).
    
    Args:
        file_content: File content as bytes
        filename: Filename to determine type
        
    Returns:
        Extracted text
    """
    if filename.lower().endswith('.pdf'):
        # Save to temp file and read - use proper temp directory for cross-platform compatibility
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_path = temp_file.name
            temp_file.write(file_content)
        
        try:
            text = extract_text_from_pdf(temp_path)
        finally:
            # Clean up temp file
            try:
                os.unlink(temp_path)
            except Exception:
                pass
        return text
    elif filename.lower().endswith(('.txt', '.md')):
        return file_content.decode('utf-8', errors='ignore')
    else:
        return ""


def clean_text(text: str) -> str:
    """
    Clean and normalize text while preserving readability and structure.
    
    Args:
        text: Raw text
        
    Returns:
        Cleaned text
    """
    # Remove extra line breaks but keep paragraph structure
    text = re.sub(r'\n\s*\n', '\n\n', text)
    # Normalize multiple spaces to single space within lines
    text = re.sub(r'[ \t]+', ' ', text)
    # Remove control characters
    text = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]', '', text)
    # Keep: letters, numbers, spaces, common punctuation, parentheses, colons, semicolons, hyphens
    # This preserves mathematical notation and structured text
    text = re.sub(r'[^a-zA-Z0-9\s\.\"\,\!\?\-\'\(\)\:\;\n\/\@\#\$\%\&\*\+\=]', '', text)
    return text.strip()


def chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks.
    
    Args:
        text: Text to chunk
        chunk_size: Approximate words per chunk
        overlap: Words to overlap between chunks
        
    Returns:
        List of text chunks
    """
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current_chunk = []
    current_size = 0
    
    for sentence in sentences:
        words = sentence.split()
        sentence_size = len(words)
        
        if current_size + sentence_size <= chunk_size:
            current_chunk.append(sentence)
            current_size += sentence_size
        else:
            if current_chunk:
                chunks.append(' '.join(current_chunk))
                # Keep overlap
                current_chunk = current_chunk[-(overlap // 10):] if overlap else []
                current_size = sum(len(s.split()) for s in current_chunk)
            current_chunk.append(sentence)
            current_size += sentence_size
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return [c.strip() for c in chunks if c.strip()]


def preprocess_documents(file_contents: List[Tuple[bytes, str]]) -> Tuple[List[str], List[str]]:
    """
    Preprocess multiple uploaded documents with full text reconstruction.
    
    Args:
        file_contents: List of (content, filename) tuples
        
    Returns:
        Tuple of (chunks, sources)
    """
    reconstructor = TextReconstructor()
    all_chunks = []
    all_sources = []
    
    for content, filename in file_contents:
        # Extract text
        text = extract_text_from_file(content, filename)
        # Clean text
        text = clean_text(text)
        # Reconstruct academic text (fix spacing, equations, etc.)
        text = reconstructor.reconstruct(text)
        # Split into chunks
        chunks = chunk_text(text)
        all_chunks.extend(chunks)
        all_sources.extend([filename] * len(chunks))
    
    return all_chunks, all_sources
